# Student Management System

A beginner-friendly full-stack CRUD project using HTML, CSS, JavaScript, Python Flask, REST API and SQLite.

## Features
- Add student records
- View all students
- Search by name, roll number, email or course
- Edit student records
- Delete student records
- SQLite database storage
- Basic validation and duplicate roll-number handling

## Folder structure
```text
student_management_system/
├── app.py
├── requirements.txt
├── students.db              # created automatically on first run
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── script.js
```

## Setup
1. Install Python 3.
2. Open this folder in VS Code.
3. Create and activate a virtual environment (optional but recommended):
   - Windows: `python -m venv venv`
   - PowerShell: `.\venv\Scripts\Activate.ps1`
4. Install dependencies:
   `pip install -r requirements.txt`
5. Start the application:
   `python app.py`
6. Open `http://127.0.0.1:5000/` in your browser.

Do not open `index.html` directly or use Live Server for this version. Flask serves the HTML and API from the same origin.

## REST API
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/students` | List students |
| POST | `/api/students` | Add a student |
| GET | `/api/students/<id>` | Get one student |
| PUT | `/api/students/<id>` | Update a student |
| DELETE | `/api/students/<id>` | Delete a student |

### Example POST body
```json
{
  "name": "Ranga",
  "roll": "101",
  "email": "ranga@example.com",
  "course": "Python Full Stack"
}
```

The SQLite database file is created automatically. This is a learning project; before deploying publicly, add authentication, CSRF protection, stronger validation, and production server configuration.
