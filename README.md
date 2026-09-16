# Student Management System — CRUD Mini Web Application

A complete CRUD web application built to follow the SOP: **HTML/CSS/JavaScript frontend → Django REST Framework backend → SQLite database.**

## 1. Project Overview
A management system for adding, viewing, searching, updating, and deleting student records — built as a demonstrable full-stack mini project.

## 2. Problem Statement
Colleges need a simple, reliable way to maintain student records (name, email, department, year, phone) with validation and no duplicate/invalid entries.

## 3. Objectives
- Implement full CRUD (Create, Read, Update, Delete) for a Student entity.
- Provide a REST API with client-side and server-side validation.
- Provide a responsive frontend with search and department filtering.

## 4. Technology Stack
| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, vanilla JavaScript (fetch API) |
| Backend | Django + Django REST Framework |
| Database | SQLite |
| API Testing | Postman (`postman_collection.json`) |
| Version Control | Git |

## 5. System Architecture
```
Browser (HTML/CSS/JS, frontend/)
        │  fetch() → JSON
        ▼
Django REST Framework API (backend/, /api/students/)
        │  Django ORM
        ▼
SQLite Database (db.sqlite3)
```

## 6. Database Design (ER Summary)
**Table: `students_student`**

| Field | Type | Constraints |
|---|---|---|
| id | AutoField | Primary Key |
| name | CharField(100) | NOT NULL |
| email | EmailField | NOT NULL, UNIQUE |
| department | CharField(10) | NOT NULL, choice list |
| year | PositiveSmallInteger | NOT NULL, 1–5 |
| phone | CharField(10) | NOT NULL, 10-digit regex |
| created_at | DateTime | auto-set on create |
| updated_at | DateTime | auto-set on update |

Single entity, no foreign keys required for this scope.

## 7. API Endpoints
| Operation | Method | Endpoint | Result |
|---|---|---|---|
| Create | POST | `/api/students/` | New record created |
| Read All | GET | `/api/students/` | List of records (supports `?search=` and `?department=`) |
| Read One | GET | `/api/students/{id}/` | Single record |
| Update | PUT/PATCH | `/api/students/{id}/` | Existing record updated |
| Delete | DELETE | `/api/students/{id}/` | Record removed |

## 8. Setup & Execution (Windows)

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser   # optional, for /admin/

python manage.py runserver
```
Backend runs at `http://127.0.0.1:8000/`. Admin panel at `/admin/`.

### Frontend
No second server and no build step needed. Django serves the frontend itself.
With `runserver` running, just open:

```
http://127.0.0.1:8000/
```

Frontend and API are on the same origin, so there are no CORS problems.
Do **not** open `frontend/index.html` by double-clicking it — a `file://` page
is blocked by the browser from calling the API.

> `CORS_ALLOW_ALL_ORIGINS` is still enabled in `settings.py` in case you later
> split the frontend onto its own port (e.g. a React dev server).

## 9. Validation Implemented
- Name: required, minimum 2 characters.
- Email: valid format, must be unique (checked both client-side and server-side).
- Department: required, chosen from a fixed list.
- Year: required, integer between 1 and 5.
- Phone: required, exactly 10 digits.
- All rules are enforced **both** in the browser (`script.js`) and in the API (`serializers.py`, `models.py`) per SOP Section 9.

## 10. Testing
- **Automated:** `backend/students/tests.py` — covers create (valid/missing/duplicate/invalid), read (existing/missing id), update (valid/invalid id), delete (valid/invalid id).
  Run with:
  ```bash
  cd backend
  python manage.py test
  ```
- **Manual/API:** `postman_collection.json` — import into Postman to exercise every endpoint, including failure cases.
- **UI:** tested manually for responsiveness at desktop and mobile widths, and for behavior when the backend is stopped (frontend shows a clear connection error instead of failing silently).

## 11. Security & Quality Notes
- `SECRET_KEY` and `DEBUG` are read from environment variables with safe local defaults — never hard-code real secrets when deploying.
- All database access goes through the Django ORM (parameterized, no raw SQL).
- Input is validated and sanitized on both client and server.
- `CORS_ALLOW_ALL_ORIGINS` and `ALLOWED_HOSTS = ["*"]` are set for local development/demo only — restrict both before any real deployment.

## 12. Version Control
```bash
git init
git add .
git commit -m "Initial commit: Student Management System CRUD app"
```
`db.sqlite3`, `venv/`, and `__pycache__/` are excluded via `.gitignore`.

## 13. Future Enhancements
- Authentication (login) so each faculty member sees only their own records.
- Pagination controls and sorting in the UI (API already supports `?ordering=`).
- Export records to CSV/Excel.
- Migrate frontend to React for component-based structure (SOP allows this as an alternative).

## 14. Folder Structure
```
student-management-system/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── studentms/        (project settings, urls, wsgi)
│   └── students/         (model, serializer, views, urls, admin, tests)
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── postman_collection.json
└── README.md
```
