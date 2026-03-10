from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

ODOUR_THRESHOLD = 70
USAGE_THRESHOLD = 30
CLEANING_TIME_LIMIT_HOURS = 6

# --------------------
# App setup
# --------------------
app = Flask(__name__)
CORS(app)

# --------------------
# Database connection
# --------------------
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="helloworld@123",
    database="hygo"
)

# --------------------
# Test API
# --------------------
@app.route("/api/test")
def test():
    return jsonify({"message": "Flask connected!"})

# --------------------
# Add staff API
# --------------------
@app.route("/add_staff", methods=["POST"])
def add_staff():
    data = request.json
    cursor = db.cursor()

    query = """
    INSERT INTO staff (staff_id, name, status)
    VALUES (%s, %s, %s)
    """
    cursor.execute(
        query,
        (data["id"], data["name"], data["status"])
    )

    db.commit()
    return jsonify({"message": "Staff added successfully"})

# --------------------
# Run server
# --------------------
# ---------------- Login API ----------------
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT role FROM users WHERE username=%s AND password=%s",
        (username, password)
    )
    user = cursor.fetchone()

    if user:
        return jsonify({
            "success": True,
            "role": user["role"]
        })
    else:
        return jsonify({
            "success": False,
            "message": "Invalid username or password"
        }), 401

from datetime import datetime, timedelta

@app.route("/api/cleaning-alerts")
def cleaning_alerts():
    cursor = db.cursor(dictionary=True)
    alerts = []

    # 1️⃣ High odour / usage alerts
    cursor.execute("""
        SELECT s.toilet_id, s.odour_level, s.usage_count, t.location
        FROM sensor_data s
        JOIN toilet t ON s.toilet_id = t.toilet_id
        ORDER BY s.timestamp DESC
    """)

    sensor_rows = cursor.fetchall()

    for row in sensor_rows:
        if row["odour_level"] > ODOUR_THRESHOLD:
            alerts.append({
                "toilet_id": row["toilet_id"],
                "location": row["location"],
                "type": "HIGH_ODOUR",
                "message": "High odour detected. Cleaning required."
            })

        if row["usage_count"] > USAGE_THRESHOLD:
            alerts.append({
                "toilet_id": row["toilet_id"],
                "location": row["location"],
                "type": "HIGH_USAGE",
                "message": "High usage detected. Cleaning required."
            })

    # 2️⃣ Not cleaned recently
    time_limit = datetime.now() - timedelta(hours=CLEANING_TIME_LIMIT_HOURS)

    cursor.execute("""
        SELECT toilet_id, location, last_cleaned_time
        FROM toilet
        WHERE last_cleaned_time IS NULL
           OR last_cleaned_time < %s
    """, (time_limit,))

    toilets = cursor.fetchall()

    for t in toilets:
        alerts.append({
            "toilet_id": t["toilet_id"],
            "location": t["location"],
            "type": "NOT_CLEANED",
            "message": "Toilet not cleaned for a long time."
        })

    return jsonify(alerts)

@app.route("/api/staff")
def get_staff():
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT 
            staff_id,
            name,
            status,
            score
        FROM staff
    """)
    staff = cursor.fetchall()
    return jsonify(staff)

@app.route("/api/toilets")
def get_toilets():
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM toilet")
    data = cursor.fetchall()
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)