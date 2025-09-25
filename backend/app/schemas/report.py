from pydantic import BaseModel
from typing import Optional, Dict, List
from datetime import datetime


# --- Base schema shared by all ---
class ReportBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    location: Dict[str, float]   # {"lat": 12.34, "lng": 56.78}
    photo_url: Optional[str] = None


# --- Incoming data when creating a report ---
class ReportCreate(ReportBase):
    pass


# --- Outgoing data for responses ---
class ReportOut(ReportBase):
    id: str                      # String version of MongoDB _id
    status: str
    created_at: datetime
    assigned_to: Optional[str] = None
    urgency_score: float
    urgency_votes_count: int
    urgency_votes: List[dict] = []