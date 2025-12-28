from pydantic import BaseModel , EmailStr
from typing import Optional ,Dict
from datetime import datetime
# Add this to backend/app/schemas.py
from pydantic import BaseModel, EmailStr

class EmailRequest(BaseModel):
    email: EmailStr

# Add this to backend/app/schemas.py

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    
# What the user sends when they signup
class UserCreate(BaseModel):
    email: EmailStr
    password : str 

# what we send Back to the Frontend(security : we Hide the password)
class UserResponse(BaseModel):
    id: int 
    email : EmailStr

    class Config:
        from_attributes = True

# what the user sends when creating an expense
class TransactionCreate(BaseModel):
    amount : float
    description :str 
    category : str # e.g ., "food" ,"Rent" ,"salary"

class TransactionResponse(TransactionCreate):
    id :int
    timestamp :datetime
    owner_id :int
    class Config:
        from_attribute = True 

class DashboardResponse(BaseModel):
    total_expenses: float
    category_breakdown: Dict[str, float] # e.g., {"Food": 200.0, "Rent": 1200.0}
    transaction_count: int