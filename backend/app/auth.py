import bcrypt
import jwt
from datetime import datetime ,timedelta
from fastapi import Depends, HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from . import database, models, schemas # Ensure these dots are correct for your structure
from fastapi.security import OAuth2PasswordBearer
import secrets

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

SECRET_KEY = "your_super_secret_key_change_this_for_production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_reset_token(email: str):
    # Generates a random secure string
    token = secrets.token_urlsafe(32)
    # Set expiration for 30 minutes from now
    expires = datetime.utcnow() + timedelta(minutes=30)
    return token, expires

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(db: Session = Depends(database.get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def hash_password(password:str):
    # ensure it's a string and within limits
    # convert password to bytes
    pwd_bytes = password.encode('utf-8')

    #generate a salt and haseh the password
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes,salt)

    # return as a string to store in the db
    return hashed_password.decode('utf-8')
    

def verify_password(plain_password: str, hashed_password: str):
    # 1. Convert the plain password from the user into bytes
    password_byte_enc = plain_password.encode('utf-8')
    
    # 2. Convert the hashed password from the database into bytes
    hashed_password_byte_enc = hashed_password.encode('utf-8')
    
    # 3. Use checkpw (NOT verify) to compare them
    return bcrypt.checkpw(password_byte_enc, hashed_password_byte_enc)