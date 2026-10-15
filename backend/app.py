
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from pathlib import Path

app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "productivity.db"


def get_db_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    connection = get_db_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            priority TEXT NOT NULL,
            completed INTEGER NOT NULL DEFAULT 0
        )
    """)

    connection.execute("""
        CREATE TABLE IF NOT EXISTS assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            subject TEXT NOT NULL,
            deadline TEXT NOT NULL
        )
    """)

    connection.commit()
    connection.close()


@app.route("/")
def home():
    return jsonify({
        "message": "Student Productivity Dashboard API is running!"
    })


@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    connection = get_db_connection()
    rows = connection.execute(
        "SELECT * FROM tasks ORDER BY id DESC"
    ).fetchall()
    connection.close()

    return jsonify([dict(row) for row in rows])


@app.route("/api/tasks", methods=["POST"])
def add_task():
    data = request.get_json(silent=True) or {}

    text = data.get("text", "").strip()
    priority = data.get("priority", "Medium")

    if not text:
        return jsonify({"error": "Task text is required"}), 400

    if priority not in ("Low", "Medium", "High"):
        return jsonify({"error": "Invalid priority"}), 400

    connection = get_db_connection()
    cursor = connection.execute(
        "INSERT INTO tasks (text, priority) VALUES (?, ?)",
        (text, priority)
    )
    connection.commit()
    task_id = cursor.lastrowid
    connection.close()

    return jsonify({
        "id": task_id,
        "text": text,
        "priority": priority,
        "completed": 0
    }), 201


@app.route("/api/tasks/<int:task_id>", methods=["PATCH"])
def update_task(task_id):
    data = request.get_json(silent=True) or {}

    if "completed" not in data:
        return jsonify({"error": "Completed status is required"}), 400

    completed = data["completed"]

    if completed not in (True, False, 0, 1):
        return jsonify({"error": "Invalid completed status"}), 400

    connection = get_db_connection()
    cursor = connection.execute(
        "UPDATE tasks SET completed = ? WHERE id = ?",
        (int(completed), task_id)
    )
    connection.commit()
    connection.close()

    if cursor.rowcount == 0:
        return jsonify({"error": "Task not found"}), 404

    return jsonify({"message": "Task updated successfully"})


@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    connection = get_db_connection()
    cursor = connection.execute(
        "DELETE FROM tasks WHERE id = ?", (task_id,)
    )
    connection.commit()
    connection.close()

    if cursor.rowcount == 0:
        return jsonify({"error": "Task not found"}), 404

    return jsonify({"message": "Task deleted successfully"})


@app.route("/api/assignments", methods=["GET"])
def get_assignments():
    connection = get_db_connection()
    rows = connection.execute(
        "SELECT * FROM assignments ORDER BY id DESC"
    ).fetchall()
    connection.close()

    return jsonify([dict(row) for row in rows])


@app.route("/api/assignments", methods=["POST"])
def add_assignment():
    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    subject = data.get("subject", "").strip()
    deadline = data.get("deadline", "").strip()

    if not name or not subject or not deadline:
        return jsonify({
            "error": "Name, subject and deadline are required"
        }), 400

    connection = get_db_connection()
    cursor = connection.execute(
        """INSERT INTO assignments (name, subject, deadline)
           VALUES (?, ?, ?)""",
        (name, subject, deadline)
    )
    connection.commit()
    assignment_id = cursor.lastrowid
    connection.close()

    return jsonify({
        "id": assignment_id,
        "name": name,
        "subject": subject,
        "deadline": deadline
    }), 201


@app.route("/api/assignments/<int:assignment_id>", methods=["DELETE"])
def delete_assignment(assignment_id):
    connection = get_db_connection()
    cursor = connection.execute(
        "DELETE FROM assignments WHERE id = ?", (assignment_id,)
    )
    connection.commit()
    connection.close()

    if cursor.rowcount == 0:
        return jsonify({"error": "Assignment not found"}), 404

    return jsonify({"message": "Assignment deleted successfully"})


initialize_database()

if __name__ == "__main__":
    app.run(debug=True)
