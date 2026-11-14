from flask import Flask, render_template, request, jsonify
import sqlite3
from pathlib import Path

app = Flask(__name__)
DATABASE = Path(__file__).with_name("students.db")


def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def create_table():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                roll TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL,
                course TEXT NOT NULL
            )
        """)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/students", methods=["GET", "POST"])
def students():
    if request.method == "GET":
        with get_db() as conn:
            rows = conn.execute(
                "SELECT * FROM students ORDER BY id DESC"
            ).fetchall()
        return jsonify([dict(row) for row in rows])

    data = request.get_json(silent=True) or {}
    fields = {
        "name": str(data.get("name", "")).strip(),
        "roll": str(data.get("roll", "")).strip(),
        "email": str(data.get("email", "")).strip(),
        "course": str(data.get("course", "")).strip()
    }

    if not all(fields.values()):
        return jsonify({"error": "Please fill in all fields."}), 400

    if "@" not in fields["email"] or "." not in fields["email"].split("@")[-1]:
        return jsonify({"error": "Please enter a valid email address."}), 400

    try:
        with get_db() as conn:
            cursor = conn.execute("""
                INSERT INTO students (name, roll, email, course)
                VALUES (:name, :roll, :email, :course)
            """, fields)
            new_id = cursor.lastrowid
        return jsonify({
            "message": "Student added successfully.",
            "id": new_id
        }), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "That roll number already exists."}), 409


@app.route("/api/students/<int:student_id>", methods=["GET", "PUT", "DELETE"])
def student_detail(student_id):
    if request.method == "GET":
        with get_db() as conn:
            row = conn.execute(
                "SELECT * FROM students WHERE id = ?", (student_id,)
            ).fetchone()
        if row is None:
            return jsonify({"error": "Student not found."}), 404
        return jsonify(dict(row))

    if request.method == "PUT":
        data = request.get_json(silent=True) or {}
        fields = {
            "name": str(data.get("name", "")).strip(),
            "roll": str(data.get("roll", "")).strip(),
            "email": str(data.get("email", "")).strip(),
            "course": str(data.get("course", "")).strip()
        }
        if not all(fields.values()):
            return jsonify({"error": "Please fill in all fields."}), 400
        if "@" not in fields["email"] or "." not in fields["email"].split("@")[-1]:
            return jsonify({"error": "Please enter a valid email address."}), 400

        try:
            with get_db() as conn:
                cursor = conn.execute("""
                    UPDATE students
                    SET name = :name, roll = :roll,
                        email = :email, course = :course
                    WHERE id = :id
                """, {**fields, "id": student_id})
                if cursor.rowcount == 0:
                    return jsonify({"error": "Student not found."}), 404
            return jsonify({"message": "Student updated successfully."})
        except sqlite3.IntegrityError:
            return jsonify({"error": "That roll number already exists."}), 409

    with get_db() as conn:
        cursor = conn.execute(
            "DELETE FROM students WHERE id = ?", (student_id,)
        )
        if cursor.rowcount == 0:
            return jsonify({"error": "Student not found."}), 404
    return jsonify({"message": "Student deleted successfully."})


if __name__ == "__main__":
    create_table()
    app.run(debug=True)
