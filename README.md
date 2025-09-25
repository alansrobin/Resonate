# 📘 Resonate: Crowdsourced Civic Issue Reporting & Resolution

## 📝 Problem Statement

Smart India Hackathon 2025 – Government of Jharkhand  
**Theme:** Clean & Green Technology  
**Category:** Software  
**Title:** Crowdsourced Civic Issue Reporting & Resolution System

---

## 🚀 Overview

Resonate is a **citizen-powered grievance redressal platform** that enables communities to report, track, and escalate civic issues such as potholes, garbage, and streetlight failures.  
Built on **FastAPI + MongoDB + React + Tailwind**, it empowers citizens with **real-time reporting**, prevents duplicates, and uses **crowdsourced voting** to prioritize issues. The admin dashboard integrates with **e-office workflows**, ensuring transparency and accountability.

---

## ✨ Features

### 👤 Citizen App

* Two actions: **Report Issue** & **View Status**  
* Upload photo, auto **geo-tag**, text 
* **Duplicate detection** (nearby reports)  
* Public feed + map with search & filters  
* **Vote to escalate** or **flag fake**  
* Notifications for status changes  
* Multilingual support + gamification

### 🛠️ Admin Dashboard

* Live dashboard with filters (category, ward, status, votes)  
* Assign/update/resolve issues  
* **Auto-routing engine** by category/location  
* E-office workflow integration (simulated)  
* Admin flag review queue  
* Analytics: hotspots, response times, resolution trends

---

## 🛠 Tech Stack

* **Database:** MongoDB
* **Backend:** FastAPI
* **Frontend:** React + TailwindCSS
* **Maps:** Google Maps API  
---

## 📂 Project Structure

```
working/
│── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entrypoint
│   │   ├── routers/         # API routes (auth, reports)
│   │   ├── schemas/         # Pydantic models
│   │   ├── services/        # CRUD, email, business logic
│   │   └── core/            # DB, security, dependencies
│   ├── requirements.txt
│   └── Dockerfile
│
│── frontend/
│   ├── src/ (React + Tailwind app)
│   ├── package.json
│   └── vite.config.js
│
│── docker-compose.yml
```

---

## 📡 API Endpoints

### Auth

* `POST /auth/register` → Register new user  
* `POST /auth/login` → Login, returns JWT  
* `POST /auth/reset-password` → Request reset  
* `POST /auth/change-password` → Change password

### Reports

* `POST /reports/` → Submit issue (photo + geo-tag + description)  
* `GET /reports/` → List/search issues  
* `GET /reports/{id}` → Get issue details  
* `POST /reports/{id}/vote` → Upvote issue  
* `POST /reports/{id}/flag` → Flag as fake  
* `PATCH /reports/{id}/status` (admin only) → Update issue status  
* `GET /reports/stats` (admin) → Dashboard analytics

---

## 🗂 Example MongoDB Schema

```json
{
  "_id": "ObjectId",
  "title": "Broken streetlight near A",
  "description": "Lamp post not working",
  "category": "streetlight",
  "location": { "type": "Point", "coordinates": [lng, lat] },
  "photo_urls": ["s3://..."],
  "status": "received",
  "votes": 5,
  "flags": [ { "user_id": "u1", "reason": "fake" } ],
  "reporter": { "user_id": "u2", "anon": false },
  "assigned_to": "electrical-dept-ward5",
  "history": [ { "status": "assigned", "by": "admin1", "at": "2025-09-25T12:00Z" } ],
  "created_at": "2025-09-25T12:00Z",
  "updated_at": "2025-09-25T13:00Z"
}
```

---

## 🔄 Workflows

### Citizen

1. Open app → Report issue (photo + geo-tag)  
2. Duplicate check → support existing or create new  
3. Vote/flag issues  
4. Track status, receive notifications

### Admin

1. Dashboard shows new issues  
2. Auto-routing assigns to department  
3. Admin updates status & uploads resolution proof  
4. Citizens notified in real time

---

## 🐳 Running with Docker

```bash
# Build and start services
docker-compose up --build
```

* Backend → `http://localhost:8000/docs
* Frontend → `http://localhost:3000

---

**Future Enhancements:**

* Voice notes, multilingual UI  
* AI-based auto-classification (image recognition)  
* Real e-office API integration

---

## 📊 Impact

* **Citizens:** Faster grievance resolution & transparency  
* **Government:** Prioritization, reduced duplication of issues
* **Society:** Cleaner, greener, smarter cities

---

## 👥 Team Roles

* **Frontend:** A Abhiram, Vaishnavi Sujith
* **Backend:**  Abhishek S, Alan S Robin
* **Backend + DB:** Devadevan B P
* **Documentation:** Anjosh J A

---

## 📚 References

* **KSMART (Kerala)** – Strong eGov, but lacks crowdsourcing  
* **FixMyStreet (UK)** – Community-driven, not localized for India  
* **Swachhata App (India)** – Focused only on sanitation
