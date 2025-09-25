from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status, Request
from motor.core import AgnosticDatabase
import pathlib, uuid, aiofiles
from datetime import datetime

from app.core.db import get_database
from app.services import crud
from app.schemas.report import ReportCreate, ReportOut
from app.core.dependencies import get_current_user, get_current_admin_user

# Define the router with a reports prefix
router = APIRouter(tags=["reports"], prefix="/reports")

@router.get("/")
async def get_all_reports(
    db: AgnosticDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    reports = await crud.get_reports_from_db(db)
    return reports

@router.post("/", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
async def create_report(
    title: str = Form(...),
    description: str = Form(None),
    category: str = Form(...),
    lat: float = Form(...),
    lng: float = Form(...),
    photo: UploadFile = File(None),  # ✅ photo optional now
    db: AgnosticDatabase = Depends(get_database)
):
    photo_url = None
    if photo:
        upload_dir = pathlib.Path("./uploads")
        upload_dir.mkdir(parents=True, exist_ok=True)

        filename = f"{uuid.uuid4().hex}{pathlib.Path(photo.filename).suffix}"
        file_path = upload_dir / filename

        async with aiofiles.open(file_path, "wb") as out_file:
            content = await photo.read()
            await out_file.write(content)

        photo_url = f"/uploads/{filename}"

    report_data = ReportCreate(
        title=title,
        description=description,
        category=category,
        location={"lat": lat, "lng": lng},
        photo_url=photo_url or ""
    )

    new_report = await crud.create_report(db, report_data)
    if not new_report:
        raise HTTPException(status_code=500, detail="Could not create report")

    return new_report

# --- Admin Endpoints (protected) ---
@router.post("/admin/assign/{report_id}/{user_id}")
async def assign_report(
    report_id: str,
    user_id: int,
    current_user: dict = Depends(get_current_admin_user),
    db: AgnosticDatabase = Depends(get_database)
):
    rep = await crud.assign_report(db, report_id, user_id)
    if not rep:
        raise HTTPException(status_code=404, detail="Report not found")
    return rep

@router.post("/admin/status/{report_id}/{status}")
async def update_status(
    report_id: str,
    status: str,
    current_user: dict = Depends(get_current_admin_user),
    db: AgnosticDatabase = Depends(get_database)
):
    rep = await crud.update_report_status(db, report_id, status)
    if not rep:
        raise HTTPException(status_code=404, detail="Report not found")
    return rep

@router.delete("/admin/delete/{report_id}")
async def delete_report(
    report_id: str,
    current_user: dict = Depends(get_current_admin_user),
    db: AgnosticDatabase = Depends(get_database)
):
    ok = await crud.delete_report(db, report_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"ok": True, "deleted": report_id}

# Endpoint for voting on urgency
@router.post("/{report_id}/vote")
async def vote_urgency(
    report_id: str,
    urgency_level: int = Form(...),
    current_user: dict = Depends(get_current_user), # Use get_current_user to identify the user
    db: AgnosticDatabase = Depends(get_database)
):
    if urgency_level < 1 or urgency_level > 5:
        raise HTTPException(status_code=400, detail="Urgency level must be between 1 and 5")

    # Pass the user's ID to the CRUD function
    report = await crud.vote_urgency(db, report_id, urgency_level, current_user.get("id"))

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return {"ok": True, "report": report}