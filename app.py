from flask import Flask, request, jsonify
from flask_cors import cross_origin
from flask_cors import CORS
import mysql.connector
from datetime import datetime, timedelta
import joblib
import numpy as np
model= joblib.load("hygo_model.pkl")


ODOUR_THRESHOLD_DIRTY = 2.5
ODOUR_THRESHOLD_MODERATE = 1.2
USAGE_THRESHOLD = 30
CLEANING_TIME_LIMIT_HOURS = 6

# --------------------
# App setup
# --------------------
app = Flask(__name__)
CORS(app,resources={r"/api/*":{"origins":"*"}},
 supports_credentials=True)

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
    safe_username = (username or "").strip()
    safe_password = (password or "").strip()

    cursor.execute("""
        SELECT staff_id
        FROM staff
        WHERE TRIM(username)=%s AND TRIM(password)=%s
    """, (safe_username, safe_password))

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
        SELECT t.toilet_id, s1.odour_level, s1.usage_count, s1.status as sensor_status, t.location
        FROM toilet t
        LEFT JOIN sensor_data s1 ON t.toilet_id = s1.toilet_id
        AND s1.timestamp = (
            SELECT MAX(timestamp)
            FROM sensor_data s2
            WHERE s1.toilet_id = s2.toilet_id
        )
        ORDER BY t.toilet_id ASC
    """)

    sensor_rows = cursor.fetchall()

    alerts_dict = {}

    for row in sensor_rows:
        tid = row["toilet_id"]
        s_status = (row["sensor_status"] or "").lower()
        
        # Combine if BOTH are true, else pick one
        if (row["odour_level"] > ODOUR_THRESHOLD_DIRTY or s_status == "dirty") and row["usage_count"] > USAGE_THRESHOLD:
            alerts_dict[tid] = {
                "toilet_id": tid,
                "location": row["location"],
                "type": "URGENT_CLEANING",
                "message": "High odour/status and usage detected. Cleaning required."
            }
        elif row["odour_level"] > ODOUR_THRESHOLD_DIRTY or s_status == "dirty":
            alerts_dict[tid] = {
                "toilet_id": tid,
                "location": row["location"],
                "type": "HIGH_ODOUR",
                "message": "High odour or dirty status detected. Cleaning required."
            }
        elif row["odour_level"] > ODOUR_THRESHOLD_MODERATE or s_status == "moderate":
            alerts_dict[tid] = {
                "toilet_id": tid,
                "location": row["location"],
                "type": "MODERATE_ODOUR",
                "message": "Moderate odour or status detected. Consider inspection."
            }
        elif row["usage_count"] > USAGE_THRESHOLD:
            alerts_dict[tid] = {
                "toilet_id": tid,
                "location": row["location"],
                "type": "HIGH_USAGE",
                "message": "High usage detected. Cleaning required."
            }

    time_limit = datetime.now() - timedelta(hours=CLEANING_TIME_LIMIT_HOURS)

    cursor.execute("""
        SELECT toilet_id, location, last_cleaned_time
        FROM toilet
        WHERE last_cleaned_time IS NULL
        OR last_cleaned_time < %s
    """, (time_limit,))

    toilets = cursor.fetchall()

    for t in toilets:
        tid = t["toilet_id"]
        # Only add 'NOT_CLEANED' alert if there wasn't already a sensor alert for it
        if tid not in alerts_dict:
            alerts_dict[tid] = {
                "toilet_id": tid,
                "location": t["location"],
                "type": "NOT_CLEANED",
                "message": "Toilet not cleaned for a long time."
            }

    alerts = list(alerts_dict.values())

    return jsonify(alerts)


# --------------------
# Staff API
# --------------------
@app.route("/api/staff", methods=["GET", "POST", "OPTIONS"])
@cross_origin()
def staff():

    db, cursor = get_cursor()

    # =========================
    # OPTIONS (CORS FIX)
    # =========================
    if request.method == "OPTIONS":
        response = jsonify({"message": "OK"})
        return response, 200

    # =========================
    # GET → FETCH STAFF
    # =========================
    if request.method == "GET":
        try:
            cursor.execute("""
                SELECT staff_id, name, score, status, gender, dob, aadhar, mother_tongue,
                       category, address
                FROM staff
                ORDER BY staff_id DESC
            """)
            staff = cursor.fetchall()
            return jsonify(staff), 200

        except Exception as e:
            print("GET ERROR:", e)
            return jsonify({"error": str(e)}), 500

    # =========================
    # POST → ADD STAFF
    # =========================
    if request.method == "POST":
        try:
            data = request.json

            name = data.get("name")
            score = data.get("score", 0)
            status = data.get("status", "off")
            gender = data.get("gender")
            dob = data.get("dob")
            aadhar = data.get("aadhar")
            mother_tongue = data.get("mother_tongue")
            category = data.get("category")
            address = data.get("address")

            if not name:
                return jsonify({"error": "Name is required"}), 400

            query = """
            INSERT INTO staff 
            (name, score, status, gender, dob, aadhar, mother_tongue, category, address)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """

            cursor.execute(query, (
                name, score, status, gender, dob,
                aadhar, mother_tongue, category, address
            ))

            db.commit()

            return jsonify({"message": "Staff added successfully"}), 201

        except Exception as e:
            print("POST ERROR:", e)
            return jsonify({"error": str(e)}), 500
# --------------------
# Toilets API
# --------------------
@app.route("/api/toilets", methods=["GET", "POST"])
def toilets():

    db, cursor = get_cursor()

    # ======================
    # GET
    # ======================
    if request.method == "GET":
        try:
            cursor.execute("""
SELECT 
    t.toilet_id,
    t.location,
    CASE 
        WHEN s1.odour_level > 2.5 OR LOWER(s1.status) = 'dirty' THEN 'dirty'
        WHEN s1.odour_level > 1.2 OR LOWER(s1.status) = 'moderate' THEN 'moderate'
        WHEN t.last_cleaned_time < DATE_SUB(NOW(), INTERVAL 6 HOUR) OR t.last_cleaned_time IS NULL THEN 'needs cleaning'
        WHEN s1.odour_level IS NOT NULL THEN 'clean'
        ELSE COALESCE(LOWER(t.status), 'online')
    END AS status,
    s1.odour_level,
    s1.gas_value,
    s1.distance
FROM toilet t
LEFT JOIN sensor_data s1 ON t.toilet_id = s1.toilet_id
AND s1.timestamp = (
    SELECT MAX(timestamp)
    FROM sensor_data s2
    WHERE s1.toilet_id = s2.toilet_id
)
""")
            data = cursor.fetchall()
            return jsonify(data), 200
        except Exception as e:
            print("GET ERROR:", e)
            return jsonify({"error": str(e)}), 500

    # ======================
    # POST
    # ======================
    if request.method == "POST":
        try:
            data = request.json

            toilet_id = data.get("toilet_id")
            location = data.get("location")
            status = data.get("status", "clean")

            if not toilet_id or not location:
                return jsonify({"error": "Toilet ID & Location required"}), 400

            query = """
            INSERT INTO toilet (toilet_id, location, status, last_cleaned_time)
            VALUES (%s, %s, %s,%s)
            """

            cursor.execute(query, (
                toilet_id, location, status, datetime.now()
            ))

            db.commit()

            return jsonify({"message": "Toilet added"}), 201

        except Exception as e:
            print("POST ERROR:", e)
            return jsonify({"error": str(e)}), 500
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
            WHEN odour_level > 2.5 THEN 'critical'
            WHEN usage_count > 30 THEN 'medium'
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

    AND (odour_level > 1.2 OR usage_count > 30)

    ORDER BY timestamp DESC
    """

    cursor.execute(query)

    alerts = cursor.fetchall()

    return jsonify(alerts)

@app.route("/api/alerts/<alert_id>/assign", methods=["POST", "OPTIONS"])
@cross_origin()
def assign_alert(alert_id):
    if request.method == "OPTIONS":
        return jsonify({"message": "OK"}), 200

    data = request.json
    staff_id = data.get("staff_id")
    
    if not staff_id:
        return jsonify({"error": "Staff ID is required"}), 400

    try:
        toilet_id_str = alert_id.replace("T-", "") if str(alert_id).startswith("T-") else alert_id
        toilet_id = int(toilet_id_str)
    except ValueError:
        return jsonify({"error": "Invalid alert ID"}), 400

    db, cursor = get_cursor()

    try:
        query = """
        INSERT INTO cleaning_log (toilet_id, staff_id, assigned_time, attendance_status, verification_status)
        VALUES (%s, %s, NOW(), 'Assigned', 'Pending')
        """
        cursor.execute(query, (toilet_id, staff_id))
        db.commit()
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": "Staff assigned successfully", "status": "Acknowledged"}), 200

# --------------------
# Feedback API
# --------------------
@app.route("/api/feedback")
def get_feedback():

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

    # ✅ Get all toilets and their latest sensor data
    query = """
    SELECT 
        t.toilet_id,
        s1.usage_count,
        s1.odour_level,
        s1.status as sensor_status,
        (SELECT MAX(cleaned_time) FROM cleaning_log WHERE toilet_id = t.toilet_id) as last_cleaned
    FROM toilet t
    LEFT JOIN sensor_data s1 ON t.toilet_id = s1.toilet_id
    AND s1.timestamp = (
        SELECT MAX(timestamp) 
        FROM sensor_data s2 
        WHERE s1.toilet_id = s2.toilet_id
    )
    """

    cursor.execute(query)
    rows = cursor.fetchall()

    results = []

    for row in rows:
        toilet_id = row["toilet_id"]
        last_cleaned_time = row["last_cleaned"]
        odour_level = row["odour_level"]
        sensor_status = row.get("sensor_status")

        # Default for toilets without sensor data
        if odour_level is None:
            results.append({
                "toilet_id": toilet_id,
                "predicted_minutes": 0,
                "status": "data pending",
                "usage_count": 0,
                "cleanliness_score": 0
            })
            continue

        # Default if never cleaned
        if not last_cleaned_time:
            last_cleaned_time = datetime.now() - timedelta(hours=24)

        hours_since_clean = (datetime.now() - last_cleaned_time).total_seconds() / 3600
        usage_count = row["usage_count"] or 0
        time_of_day = datetime.now().hour

        features = np.array([[usage_count, time_of_day, hours_since_clean]])

        try:
            prediction = model.predict(features)[0]
        except:
            prediction = 30 

        # Logic: High Odour OR Sensor explicitly says Dirty
        if odour_level > 2.5 or (sensor_status and sensor_status.lower() == "dirty"):
            status = "dirty"
            score = 30
        # Moderate Odour OR Sensor explicitly says Moderate
        elif odour_level > 1.2 or (sensor_status and sensor_status.lower() == "moderate"):
            status = "moderate"
            score = 60
        else:
            status = "clean"
            score = 90

        results.append({
            "toilet_id": toilet_id,
            "predicted_minutes": int(prediction),
            "status": status,
            "usage_count": usage_count,
            "cleanliness_score": score
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
    status = (status or "clean").lower()

    db, cursor = get_cursor()

    query = """
    INSERT INTO sensor_data 
    (toilet_id, odour_level, usage_count, gas_value, gas_status, distance, status, alert, timestamp)
    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,NOW())
    """

    cursor.execute(query, (
        10,                # toilet_id
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