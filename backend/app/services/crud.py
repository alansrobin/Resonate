from motor.core import AgnosticDatabase
from typing import List, Dict
from datetime import datetime
from app.schemas.report import ReportCreate
from bson.objectid import ObjectId
from pymongo import ReturnDocument
from fastapi import HTTPException

# --- Get all reports ---
async def get_reports_from_db(db: AgnosticDatabase) -> List[dict]:
    reports = await db.reports.find().to_list(length=None)
    for report in reports:
        report["id"] = str(report.pop("_id"))
    return reports

# --- Get a single report by ID ---
async def get_report_by_id(db: AgnosticDatabase, report_id: str) -> dict:
    try:
        report = await db.reports.find_one({"_id": ObjectId(report_id)})
        if report:
            report["id"] = str(report.pop("_id"))
        return report
    except:
        return None

# --- Create a new report ---
async def create_report(db: AgnosticDatabase, report_data: ReportCreate) -> dict:
    report_dict = report_data.model_dump()
    report_dict.update({
        "status": "new",
        "created_at": datetime.utcnow(),
        "assigned_to": None,
        "urgency_score": 0.0,
        "urgency_votes_count": 0,
        "urgency_votes": []
    })

    result = await db.reports.insert_one(report_dict)

    report_dict["id"] = str(result.inserted_id)
    report_dict.pop("_id", None)  # Ensure no raw ObjectId leaks

    return report_dict

# --- Assign report to a user ---
async def assign_report(db: AgnosticDatabase, report_id: str, user_id: int):
    updated_report = await db.reports.find_one_and_update(
        {"_id": ObjectId(report_id)},
        {"$set": {"assigned_to": user_id, "status": "acknowledged", "updated_at": datetime.utcnow()}},
        return_document=ReturnDocument.AFTER
    )
    if updated_report:
        updated_report["id"] = str(updated_report.pop("_id"))
    return updated_report

# --- Update status ---
async def update_report_status(db: AgnosticDatabase, report_id: str, status: str):
    updated_report = await db.reports.find_one_and_update(
        {"_id": ObjectId(report_id)},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}},
        return_document=ReturnDocument.AFTER
    )
    if updated_report:
        updated_report["id"] = str(updated_report.pop("_id"))
    return updated_report

# --- Delete report ---
async def delete_report(db: AgnosticDatabase, report_id: str):
    result = await db.reports.delete_one({"_id": ObjectId(report_id)})
    return result.deleted_count > 0

# --- Vote on urgency ---
async def vote_urgency(db: AgnosticDatabase, report_id: str, urgency_level: int, user_id: str):
    report = await get_report_by_id(db, report_id)
    if not report:
        return None
    
    # Check if user has already voted
    existing_vote = next((v for v in report.get("urgency_votes", []) if v.get("user_id") == user_id), None)

    old_score = report.get("urgency_score", 0.0)
    old_count = report.get("urgency_votes_count", 0)

    # If the user is changing their vote
    if existing_vote:
        # Recalculate score by subtracting old vote, then adding new one.
        # This keeps the count the same.
        new_score = ((old_score * old_count) - existing_vote['vote'] + urgency_level) / old_count
        
        updated_report_doc = await db.reports.find_one_and_update(
            {"_id": ObjectId(report_id), "urgency_votes.user_id": user_id},
            {
                "$set": {
                    "urgency_score": new_score,
                    "urgency_votes.$.vote": urgency_level,
                    "updated_at": datetime.utcnow()
                }
            },
            return_document=ReturnDocument.AFTER
        )

    # If this is a new vote
    else:
        new_count = old_count + 1
        new_score = ((old_score * old_count) + urgency_level) / new_count
        
        updated_report_doc = await db.reports.find_one_and_update(
            {"_id": ObjectId(report_id)},
            {
                "$set": {
                    "urgency_score": new_score,
                    "urgency_votes_count": new_count,
                    "updated_at": datetime.utcnow()
                },
                "$push": {
                    "urgency_votes": {
                        "user_id": user_id,
                        "vote": urgency_level
                    }
                }
            },
            return_document=ReturnDocument.AFTER
        )

    if updated_report_doc:
        updated_report_doc["id"] = str(updated_report_doc.pop("_id"))
    return updated_report_doc