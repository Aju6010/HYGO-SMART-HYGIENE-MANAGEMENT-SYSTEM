from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from datetime import datetime, timedelta
import joblib
import numpy as np
model= joblib.load("hygo_model.pkl")


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
def get_db():
    return mysql.connector.connect(
        host="crossover.proxy.rlwy.net",
        user="root",
        password="QLjtrYTSMVzNNhNRWJmoJHghylJOVzSi",  # from Railway
        database="railway",
        port=40219,
        autocommit=True
    )


def get_cursor():

    db = get_db()

    return db, db.cursor(dictionary=True)
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
    cursor = get_cursor()

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
# Login API
# --------------------
@app.route("/api/login", methods=["POST"])
def login():

    data = request.json
    username = data.get("username")
    password = data.get("password")

    db, cursor = get_cursor()

    # -------- ADMIN LOGIN (UNCHANGED) --------
    cursor.execute("""
        SELECT role
        FROM users
        WHERE username=%s AND password=%s
    """, (username, password))

    admin = cursor.fetchone()

    if admin:
        return jsonify({
            "success": True,
            "role": "admin"
        })

    # -------- STAFF LOGIN --------
    cursor.execute("""
        SELECT staff_id
        FROM staff
        WHERE TRIM(username)=%s AND TRIM(password)=%s
    """, (username.strip(), password.strip()))

    staff = cursor.fetchone()

    if staff:
        return jsonify({
            "success": True,
            "role": "staff",
            "staff_id": staff["staff_id"]
        })

    # -------- LOGIN FAILED --------
    return jsonify({
        "success": False,
        "message": "Invalid username or password"
    }), 401


# --------------------
# Cleaning alerts
# --------------------
@app.route("/api/cleaning-alerts")
def cleaning_alerts():

    db, cursor = get_cursor()
    alerts = []

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


# --------------------
# Staff API
# --------------------
@app.route("/api/staff")
def get_staff():

    db, cursor = get_cursor()

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


# --------------------
# Toilets API
# --------------------
@app.route("/api/toilets")
def get_toilets():

    db, cursor = get_cursor()

    cursor.execute("SELECT * FROM toilet")

    data = cursor.fetchall()

    return jsonify(data)


# --------------------
# Alerts API
# --------------------
@app.route("/api/alerts")
def get_alerts():

    db, cursor = get_cursor()

    query = """
    SELECT 
        CONCAT('T-', toilet_id) AS id,

        CASE 
            WHEN odour_level > 6 THEN 'critical'
            WHEN usage_count > 40 THEN 'medium'
            ELSE 'low'
        END AS severity,

        'Open' AS status,
        'Sensor' AS type,

        CONCAT('Odour level ', odour_level,
               ', usage ', usage_count) AS message,

        DATE_FORMAT(timestamp,'%b %d, %H:%i') AS time

    FROM sensor_data s1

    WHERE timestamp = (
        SELECT MAX(timestamp)
        FROM sensor_data s2
        WHERE s1.toilet_id = s2.toilet_id
    )

    AND (odour_level > 6 OR usage_count > 40)

    ORDER BY timestamp DESC
    """

    cursor.execute(query)

    alerts = cursor.fetchall()

    return jsonify(alerts)


# --------------------
# Feedback API
# --------------------
@app.route("/api/feedback")
def get_feedback():

    global db

    if not db.is_connected():
        db.reconnect()

    db, cursor = get_cursor()

    query = """
    SELECT
        CONCAT('T-', toilet_id) AS id,
        'low' AS severity,
        verification_status AS status,
        'Feedback' AS type,
        CONCAT('Cleaning ', verification_status, ' by staff ', staff_id) AS message,
        4 AS rating,
        DATE_FORMAT(cleaned_time,'%b %d, %H:%i') AS time
    FROM cleaning_log
    WHERE cleaned_time IS NOT NULL
    ORDER BY cleaned_time DESC
    """

    cursor.execute(query)

    feedback = cursor.fetchall()

    return jsonify(feedback)


# --------------------
# Reports API
# --------------------
@app.route("/api/reports")
def get_reports():

    db, cursor = get_cursor()

    cursor.execute("""
        SELECT COUNT(*) AS total_cleanings
        FROM cleaning_log
        WHERE cleaned_time IS NOT NULL
    """)

    total = cursor.fetchone()["total_cleanings"]

    cursor.execute("""
        SELECT AVG(TIMESTAMPDIFF(MINUTE, assigned_time, cleaned_time)) AS avg_duration
        FROM cleaning_log
        WHERE cleaned_time IS NOT NULL
    """)

    avg = cursor.fetchone()["avg_duration"] or 0

    cursor.execute("""
        SELECT 
        (SUM(CASE WHEN verification_status='Verified' THEN 1 ELSE 0 END) 
        / COUNT(*)) * 100 AS rate
        FROM cleaning_log
    """)

    rate = cursor.fetchone()["rate"] or 0

    cursor.execute("""
        SELECT 
        DATE(cleaned_time) AS day,
        COUNT(*) AS count
        FROM cleaning_log
        WHERE cleaned_time IS NOT NULL
        GROUP BY DATE(cleaned_time)
        ORDER BY day
    """)

    daily = cursor.fetchall()

    return jsonify({
        "total_cleanings": total,
        "avg_duration": round(avg,1),
        "verification_rate": round(rate,1),
        "daily_activity": daily
    })


# --------------------
# Report Summary
# --------------------
@app.route("/api/report/summary")
def report_summary():

    db, cursor = get_cursor()

    cursor.execute("""
        SELECT COUNT(*) AS total
        FROM cleaning_log
        WHERE cleaned_time IS NOT NULL
    """)

    total = cursor.fetchone()["total"]

    cursor.execute("""
        SELECT AVG(TIMESTAMPDIFF(MINUTE, assigned_time, cleaned_time)) AS avg_time
        FROM cleaning_log
        WHERE cleaned_time IS NOT NULL
    """)

    avg = cursor.fetchone()["avg_time"] or 0

    cursor.execute("""
        SELECT
        (SUM(CASE WHEN verification_status='Verified' THEN 1 ELSE 0 END)/COUNT(*))*100 AS rate
        FROM cleaning_log
    """)

    rate = cursor.fetchone()["rate"] or 0

    cursor.execute("""
        SELECT COUNT(*) AS resolved
        FROM cleaning_log
        WHERE verification_status='Verified'
    """)

    resolved = cursor.fetchone()["resolved"]

    return jsonify({
        "total_cleanings": total,
        "avg_duration": str(round(avg)) + " min",
        "verification_rate": str(round(rate)) + "%",
        "alerts_resolved": resolved
    })


# --------------------
# Cleaning chart
# --------------------
@app.route("/api/report/cleanings")
def report_cleanings():

    db, cursor = get_cursor()

    cursor.execute("""
        SELECT
        DATE(cleaned_time) AS day,
        COUNT(*) AS cleanings
        FROM cleaning_log
        WHERE cleaned_time IS NOT NULL
        GROUP BY DATE(cleaned_time)
        ORDER BY day
    """)

    return jsonify(cursor.fetchall())


# --------------------
# Cleaning types chart
# --------------------
@app.route("/api/report/types")
def report_types():

    data = [
        {"name":"Routine","value":40,"color":"#22c55e"},
        {"name":"Deep","value":25,"color":"#3b82f6"},
        {"name":"Emergency","value":20,"color":"#f59e0b"},
        {"name":"Inspection","value":15,"color":"#ef4444"}
    ]

    return jsonify(data)


# --------------------
# Top staff
# --------------------
@app.route("/api/report/top-staff")
def report_staff():

    db, cursor = get_cursor()

    cursor.execute("""
        SELECT
        staff.name,
        COUNT(cleaning_log.log_id) AS cleanings
        FROM cleaning_log
        JOIN staff ON cleaning_log.staff_id = staff.staff_id
        GROUP BY staff.name
        ORDER BY cleanings DESC
        LIMIT 5
    """)

    return jsonify(cursor.fetchall())


# --------------------
# Recent logs
# --------------------
@app.route("/api/report/logs")
def report_logs():

    db, cursor = get_cursor()

    cursor.execute("""
        SELECT
        CONCAT('T-', toilet_id) AS toilet,
        CONCAT('Staff ', staff_id) AS staff,
        'Routine' AS type,
        CONCAT(
            TIMESTAMPDIFF(MINUTE, assigned_time, cleaned_time),
            ' min'
        ) AS duration,
        verification_status AS score,
        DATE_FORMAT(cleaned_time,'%b %d %H:%i') AS time
        FROM cleaning_log
        WHERE cleaned_time IS NOT NULL
        ORDER BY cleaned_time DESC
        LIMIT 10
    """)

    return jsonify(cursor.fetchall())


# --------------------
# Staff assigned tasks
# --------------------
@app.route("/api/staff/assigned-tasks/<int:staff_id>")
def get_assigned_tasks(staff_id):

    db, cursor = get_cursor()

    cursor.execute("""
        SELECT 
            log_id AS id,
            toilet_id AS location,
            assigned_time AS assignedTime,
            'Admin' AS authority,
            'High' AS priority,
            cleaned_time AS deadline
        FROM cleaning_log
        WHERE staff_id = %s
        AND attendance_status = 'Assigned'
    """, (staff_id,))

    tasks = cursor.fetchall()

    return jsonify(tasks)

@app.route("/api/complaints", methods=["POST"])
def add_complaint():

    data = request.json

    category = data.get("category")
    description = data.get("description")
    staff_id = data.get("staff_id", 0)

    db, cursor = get_cursor()

    query = """
    INSERT INTO complaints (category, description, staff_id)
    VALUES (%s,%s,%s)
    """

    cursor.execute(query, (category, description, staff_id))

    db.commit()

    return jsonify({"message":"Complaint submitted successfully"})

@app.route("/api/complaints")
def get_complaints():

    db, cursor = get_cursor()

    cursor.execute("""
        SELECT
        complaint_id,
        category,
        description,
        staff_id,
        DATE_FORMAT(created_at,'%b %d %H:%i') AS time
        FROM complaints
        ORDER BY created_at DESC
    """)

    data = cursor.fetchall()

    return jsonify(data)    

@app.route("/api/staff/profile/<int:staff_id>")
def get_staff_profile(staff_id):

    db, cursor = get_cursor()

    query = """
    SELECT
    staff_id,
    name,
    gender,
    DATE_FORMAT(dob,'%d/%m/%Y') as dob,
    aadhar,
    mother_tongue,
    category,
    address,
    native_place,
    nationality,
    blood_group,
    photo
    FROM staff
    WHERE staff_id = %s
    """

    cursor.execute(query,(staff_id,))
    profile = cursor.fetchone()

    return jsonify(profile)


@app.route("/api/predict-from-db")
def predict_from_db():

    db, cursor = get_cursor()

    # ✅ latest cleaning per toilet
    cursor.execute("""
        SELECT toilet_id, MAX(cleaned_time) as last_cleaned
        FROM cleaning_log
        GROUP BY toilet_id
    """)

    logs = cursor.fetchall()

    results = []

    for log in logs:

        toilet_id = log["toilet_id"]
        last_cleaned_time = log["last_cleaned"]

        # ⏱ time since cleaned (hours)
        hours_since_clean = (
            datetime.now() - last_cleaned_time
        ).total_seconds() / 3600

        # 🧪 dummy values (replace later)
        usage_count = 100
        time_of_day = datetime.now().hour

        # 🤖 model input
        features = np.array([[usage_count, time_of_day, hours_since_clean]])

        try:
            prediction = model.predict(features)[0]
        except:
            prediction = 30  # fallback

        # 🎯 convert to status
        if prediction < 30:
            status = "Clean"
        elif prediction < 60:
            status = "Moderate"
        else:
            status = "Dirty Soon"

        results.append({
            "toilet_id": toilet_id,
            "predicted_minutes": int(prediction),
            "status": status
        })

    return jsonify(results)


@app.route("/api/data", methods=["POST"])
def receive_sensor_data():

    data = request.json

    gas_value = data.get("gas_value")
    gas_status = data.get("gas_status")
    distance = data.get("distance")
    status = data.get("status")
    count = data.get("count")
    alert = data.get("alert")

    print("📡 ESP32 DATA:", data)

    # convert gas to odour level
    odour_level = round(gas_value / 100, 2)

    db, cursor = get_cursor()

    query = """
    INSERT INTO sensor_data 
    (toilet_id, odour_level, usage_count, gas_value, gas_status, distance, status, alert, timestamp)
    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,NOW())
    """

    cursor.execute(query, (
        1,                # toilet_id
        odour_level,
        count,
        gas_value,
        gas_status,
        distance,
        status,
        alert
    ))

    db.commit()

    return jsonify({"message": "Data stored successfully"})

if __name__ == "__main__":
    app.run(debug=True)