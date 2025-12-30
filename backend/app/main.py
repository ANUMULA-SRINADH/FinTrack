from fastapi import FastAPI ,Depends, HTTPException ,status
from . import models ,schemas ,auth
from .database import engine , get_db
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from jose import JWTError,jwt
from fastapi.security import OAuth2PasswordRequestForm , OAuth2PasswordBearer
from . import auth  # or 'from app import auth' depending on your run command
import datetime
import os

app = FastAPI(title="FinTrack API", version="1.0.0")

# 1. Fetch the origins from your Render Environment tab
# 2. Split it by comma if you have multiple URLs
origins = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # REMOVE THE QUOTES. Use the variable directly.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

@app.post("/signup", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # USE THE AUTH HELPER - Make sure this matches auth.py
    hashed_pwd = auth.hash_password(user.password)

    # Create user - Double check if your model uses 'hashed_password' or 'password'
    new_user = models.User(email=user.email, hashed_password=hashed_pwd)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# 1. Leave this! It tells the system where the "Passport Office" (login) is.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# 2. This function uses the scheme to protect your routes
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        # We use the token found by oauth2_scheme
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid Token")
    except Exception:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    
    user = db.query(models.User).filter(models.User.email == email).first()
    return user


@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()

    # CRITICAL CHECK:
    # 1. Does 'user' exist?
    # 2. Does auth.verify_password return True?
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email or password"
        )

    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}
        

@app.get("/")
def read_root():
    return {"message": "Welcome to the FinTrack API! - System Online . Database tables created and connected."}

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

@app.post("/transactions", response_model=schemas.TransactionResponse)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    new_transaction = models.Transaction(
        amount=transaction.amount,
        description=transaction.description,
        category=transaction.category,
        owner_id=current_user.id
    )
    
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction) # This is the CRITICAL line - it loads the timestamp
    return new_transaction
    

# 2.Get All new Transactions
@app.get("/transactions",response_model=list[schemas.TransactionResponse])
def get_transactions(
    db:Session = Depends(get_db),
    current_user : models.User = Depends(get_current_user)
):
    #This ensures I only see My data,not everyone else's
    return db.query(models.Transaction).filter(models.Transaction.owner_id==current_user.id).all()



@app.get("/dashboard", response_model=schemas.DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # 1. Fetch all transactions for this user
    transactions = db.query(models.Transaction).filter(models.Transaction.owner_id == current_user.id).all()
    
    # 2. Calculate logic
    total = sum(t.amount for t in transactions)
    
    breakdown = {}
    for t in transactions:
        if t.category in breakdown:
            breakdown[t.category] += t.amount
        else:
            breakdown[t.category] = t.amount
            
    return {
        "total_expenses": total,
        "category_breakdown": breakdown,
        "transaction_count": len(transactions)
    }

@app.delete("/transactions/{transaction_id}")
def delete_transaction(
    transaction_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user) # This must match auth.py
):
    # ... logic ...
    transaction = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id, 
        models.Transaction.owner_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    db.delete(transaction)
    db.commit()
    return {"message": "Transaction deleted successfully"}

from sqlalchemy import func, extract

@app.get("/analytics/yearly-spending")
def get_yearly_spending(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Groups spending by month for the current year
    results = db.query(
        extract('month', models.Transaction.timestamp).label('month'),
        func.sum(models.Transaction.amount).label('total')
    ).filter(
        models.Transaction.owner_id == current_user.id,
        extract('year', models.Transaction.timestamp) == datetime.now().year
    ).group_by('month').all()
    
    return [{"month": int(r.month), "total": float(r.total)} for r in results]


# backend/app/main.py
# backend/app/main.py
import secrets
from datetime import datetime, timedelta

@app.post("/forgot-password")
def forgot_password(data: schemas.EmailRequest, db: Session = Depends(get_db)):
    # 1. Check if user exists
    user = db.query(models.User).filter(models.User.email == data.email).first()
    
    # 2. Even if user doesn't exist, give a generic message (Security Best Practice)
    if not user:
        return {"message": "If this email is registered, you will receive a reset link."}
    
    # 3. Create a secure random token
    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expires = datetime.utcnow() + timedelta(minutes=30) # Valid for 30 mins
    
    db.commit()
    
    # 4. For now, print to console so you can copy-paste it
    print(f"\n********** RESET LINK **********\n")
    print(f"http://localhost:3000/reset-password?token={token}")
    print(f"\n********************************\n")
    
    return {"message": "Reset link generated successfully"}

# backend/app/main.py

@app.post("/reset-password")
def reset_password(data: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    # 1. Search for the user using the reset token
    user = db.query(models.User).filter(models.User.reset_token == data.token).first()
    
    # 2. Check if the token is valid and not expired
    if not user or user.reset_token_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    # 3. Hash the new password and save it
    user.hashed_password = auth.hash_password(data.new_password)
    
    # 4. Clear the reset token fields so they can't be used again
    user.reset_token = None
    user.reset_token_expires = None
    
    db.commit()
    return {"message": "Password updated successfully"}