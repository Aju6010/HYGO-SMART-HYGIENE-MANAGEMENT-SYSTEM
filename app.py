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
    db = None
    try:
        data = request.json
        print(f"DEBUG: Login attempt for user: {data.get('username')}")

        if not data:
            return jsonify({"success": False, "message": "No data received"}), 400

        username = data.get("username")
        password = data.get("password")

        db, cursor = get_cursor()

        # Check ADMIN
        cursor.execute("SELECT role FROM users WHERE username=%s AND password=%s", (username, password))
        admin = cursor.fetchone()

        if admin:
            print("DEBUG: Admin login successful")
            return jsonify({"success": True, "role": "admin"})

        # Check STAFF
        safe_username = (username or "").strip()
        safe_password = (password or "").strip()

        cursor.execute("SELECT staff_id FROM staff WHERE TRIM(username)=%s AND TRIM(password)=%s", (safe_username, safe_password))
        staff = cursor.fetchone()

        if staff:
            print(f"DEBUG: Staff login successful for ID: {staff['staff_id']}")
            return jsonify({"success": True, "role": "staff", "staff_id": staff["staff_id"]})

        print("DEBUG: Login failed - invalid credentials")
        return jsonify({"success": False, "message": "Invalid username or password"}), 401

    except Exception as e:
        print(f"DEBUG: LOGIN ERROR: {str(e)}")
        return jsonify({"success": False, "message": f"Server Error: {str(e)}"}), 500
    finally:
        if db:
            db.close()


# --------------------
# Cleaning alerts
# --------------------
@app.route("/api/cleaning-alerts")
def cleaning_alerts():
    db = None
    try:
        db, cursor = get_cursor()
        
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
            # Default to 0/empty to prevent crashes if sensor data is missing
            odour = row["odour_level"] or 0
            usage = row["usage_count"] or 0
            s_status = (row["sensor_status"] or "").lower()
            
            # Combine logic
            is_dirty = (odour > ODOUR_THRESHOLD_DIRTY or s_status == "dirty")
            is_moderate = (odour > ODOUR_THRESHOLD_MODERATE or s_status == "moderate")
            is_high_usage = (usage > USAGE_THRESHOLD)

            if is_dirty and is_high_usage:
                alerts_dict[tid] = {
                    "toilet_id": tid,
                    "location": row["location"],
                    "type": "URGENT_CLEANING",
                    "message": "High odour/status and usage detected. Cleaning required."
                }
            elif is_dirty:
                alerts_dict[tid] = {
                    "toilet_id": tid,
                    "location": row["location"],
                    "type": "HIGH_ODOUR",
                    "message": "High odour or dirty status detected. Cleaning required."
                }
            elif is_moderate:
                alerts_dict[tid] = {
                    "toilet_id": tid,
                    "location": row["location"],
                    "type": "MODERATE_ODOUR",
                    "message": "Moderate odour or status detected. Consider inspection."
                }
            elif is_high_usage:
                alerts_dict[tid] = {
                    "toilet_id": tid,
                    "location": row["location"],
                    "type": "HIGH_USAGE",
                    "message": "High usage detected. Cleaning required."
                }

        # Check for time-based alerts (Routine maintenance)
        # We only flag 'Overdue' if the toilet isn't already reported as 'Clean' by sensors
        time_limit = datetime.now() - timedelta(hours=CLEANING_TIME_LIMIT_HOURS)
        cursor.execute("""
            SELECT t.toilet_id, t.location, t.last_cleaned_time
            FROM toilet t
            LEFT JOIN sensor_data s1 ON t.toilet_id = s1.toilet_id
            AND s1.timestamp = (
                SELECT MAX(timestamp)
                FROM sensor_data s2
                WHERE s1.toilet_id = s2.toilet_id
            )
            WHERE (t.last_cleaned_time IS NULL OR t.last_cleaned_time < %s)
            AND (s1.odour_level IS NULL OR s1.odour_level > %s OR s1.status != 'clean')
        """, (time_limit, ODOUR_THRESHOLD_MODERATE))

        toilets = cursor.fetchall()

        for t in toilets:
            tid = t["toilet_id"]
            if tid not in alerts_dict:
                alerts_dict[tid] = {
                    "toilet_id": tid,
                    "location": t["location"],
                    "type": "NOT_CLEANED",
                    "message": "Toilet not cleaned for a long time."
                }

        return jsonify(list(alerts_dict.values()))

    except Exception as e:
        print(f"DEBUG: ALERTS ERROR: {str(e)}")
        return jsonify([]) # Return empty list on error to keep UI from crashing
    finally:
        if db:
            db.close()


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
        WHEN (t.last_cleaned_time < DATE_SUB(NOW(), INTERVAL 6 HOUR) OR t.last_cleaned_time IS NULL) 
             AND (s1.odour_level IS NULL OR s1.odour_level > 1.2 OR s1.status != 'clean') THEN 'needs cleaning'
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
    db = None
    try:
        db, cursor = get_cursor()

        # Join with toilet and cleaning_log to see if there's a 'Pending' assignment
        query = """
        SELECT 
            CONCAT('T-', s1.toilet_id) AS id,
            s1.toilet_id,

            CASE 
                WHEN s1.odour_level > 2.5 THEN 'critical'
                WHEN s1.usage_count > 30 THEN 'medium'
                ELSE 'low'
            END AS severity,

            CASE
                WHEN c.attendance_status = 'Assigned' THEN 'Acknowledged'
                WHEN c.attendance_status = 'Completed' THEN 'Resolved'
                ELSE 'Open'
            END AS status,

            'Sensor' AS type,

            CONCAT('Odour level ', s1.odour_level,
                   ', usage ', s1.usage_count) AS message,

            DATE_FORMAT(s1.timestamp,'%b %d, %H:%i') AS time,
            st.name AS assigned_staff_name

        FROM sensor_data s1
        JOIN toilet t ON s1.toilet_id = t.toilet_id
        LEFT JOIN staff st ON t.assigned_staff_id = st.staff_id
        LEFT JOIN cleaning_log c ON s1.toilet_id = c.toilet_id 
        AND c.cleaned_time IS NULL 

        WHERE s1.timestamp = (
            SELECT MAX(timestamp)
            FROM sensor_data s2
            WHERE s1.toilet_id = s2.toilet_id
        )

        AND (s1.odour_level > 1.2 OR s1.usage_count > 30)

        ORDER BY s1.timestamp DESC
        """

        cursor.execute(query)
        alerts = cursor.fetchall()
        return jsonify(alerts)

    except Exception as e:
        print(f"ALERTS API ERROR: {str(e)}")
        return jsonify([])
    finally:
        if db:
            db.close()

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
        # 1. Update the designated staff for this toilet
        cursor.execute("UPDATE toilet SET assigned_staff_id = %s WHERE toilet_id = %s", (staff_id, toilet_id))

        # 2. Create the first cleaning log entry
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
    finally:
        if db:
            db.close()

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

    staff_id = request.args.get("staff_id")
    db, cursor = get_cursor()

    try:
        # Define the base filters
        where_clause = "WHERE cleaned_time IS NOT NULL"
        params = []
        if staff_id and staff_id != "undefined":
            where_clause += " AND staff_id = %s"
            params.append(staff_id)

        # Total cleanings
        cursor.execute(f"SELECT COUNT(*) AS total FROM cleaning_log {where_clause}", tuple(params))
        total = cursor.fetchone()["total"]

        # Avg duration
        cursor.execute(f"SELECT AVG(TIMESTAMPDIFF(MINUTE, assigned_time, cleaned_time)) AS avg_time FROM cleaning_log {where_clause}", tuple(params))
        avg = cursor.fetchone()["avg_time"] or 0

        # Verification rate → NOW Cleanliness Performance Index (Average Score)
        rate_where = ""
        rate_params = []
        if staff_id and staff_id != "undefined":
            rate_where = "WHERE staff_id = %s"
            rate_params.append(staff_id)

        # We only average scores for 'Verified' tasks where a score was recorded
        cursor.execute(f"""
            SELECT 
            COALESCE(AVG(cleanliness_score), 0) AS rate 
            FROM cleaning_log 
            {rate_where}
            {" AND " if rate_where else "WHERE "} verification_status = 'Verified'
        """, tuple(rate_params))

        rate = cursor.fetchone()["rate"] or 0

        # Resolved count
        res_where = "WHERE verification_status='Verified'"
        res_params = []
        if staff_id and staff_id != "undefined":
            res_where += " AND staff_id = %s"
            res_params.append(staff_id)
        
        cursor.execute(f"SELECT COUNT(*) AS resolved FROM cleaning_log {res_where}", tuple(res_params))
        resolved = cursor.fetchone()["resolved"]

        return jsonify({
            "total_cleanings": total,
            "avg_duration": str(round(avg)) + " min",
            "verification_rate": str(round(rate)) + "%",
            "alerts_resolved": resolved
        })
    finally:
        if db:
            db.close()


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
    db = None
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data received"}), 400

        gas_value = data.get("gas_value", 0)
        gas_status = data.get("gas_status", "clean")
        distance = data.get("distance", 0)
        status_raw = data.get("status", "clean")
        count = data.get("count", 0)
        alert = data.get("alert", 0)
        
        # In case ESP32 sends a toilet_id, otherwise default to 10
        toilet_id = data.get("toilet_id", 10) 

        print(f"📡 ESP32 DATA (T-{toilet_id}):", data)

        # convert gas to odour level
        odour_level = round(gas_value / 100, 2)
        status = status_raw.lower()

        db, cursor = get_cursor()

        # 1. Insert sensor_data history
        query = """
        INSERT INTO sensor_data 
        (toilet_id, odour_level, usage_count, gas_value, gas_status, distance, status, alert, timestamp)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,NOW())
        """
        cursor.execute(query, (
            toilet_id,
            odour_level,
            count,
            gas_value,
            gas_status,
            distance,
            status,
            alert
        ))

        # 2. Automated Cleaning Logic: Dirty Detection & Auto-Task Creation
        # If toilet becomes dirty, check who is assigned and create a log task
        if odour_level >= ODOUR_THRESHOLD_DIRTY or status == "dirty":
            
            # Check if there is an assigned staff for this toilet
            cursor.execute("SELECT assigned_staff_id FROM toilet WHERE toilet_id = %s", (toilet_id,))
            toilet_info = cursor.fetchone()
            
            if toilet_info and toilet_info["assigned_staff_id"]:
                staff_id = toilet_info["assigned_staff_id"]
                
                # Check if there is already an active (Assigned/Pending) log to avoid duplicates
                cursor.execute("""
                    SELECT log_id FROM cleaning_log 
                    WHERE toilet_id = %s AND staff_id = %s AND attendance_status = 'Assigned'
                """, (toilet_id, staff_id))
                
                if not cursor.fetchone():
                    print(f"🚨 AUTO-TASK: Toilet T-{toilet_id} is DIRTY. Assigning to Staff #{staff_id}")
                    cursor.execute("""
                        INSERT INTO cleaning_log (toilet_id, staff_id, assigned_time, attendance_status, verification_status)
                        VALUES (%s, %s, NOW(), 'Assigned', 'Pending')
                    """, (toilet_id, staff_id))

        # 3. Automated Cleaning Logic: Clean Detection & Auto-Verification
        # If toilet is now clean, reset the timer and check for assignments to close them
        if odour_level < ODOUR_THRESHOLD_MODERATE and status == "clean":
            
            # 🔥 ALWAYS update Toilet registry to sync 'Last Cleaned' timer
            cursor.execute("UPDATE toilet SET last_cleaned_time = NOW() WHERE toilet_id = %s", (toilet_id,))
            print(f"✨ SMART RESET: Timer reset for T-{toilet_id}")

            # Check for the most recent 'Pending' log to auto-verify staff work
            cursor.execute("""
                SELECT log_id FROM cleaning_log 
                WHERE toilet_id = %s AND verification_status = 'Pending'
                ORDER BY log_id DESC LIMIT 1
            """, (toilet_id,))
            
            pending_log = cursor.fetchone()
            
            if pending_log:
                log_id = pending_log["log_id"]
                
                # Calculate cleanliness score for trust index
                # 0.0 - 0.5 -> 100%
                # 0.5 - 1.2 -> 90%
                # 1.2 - 2.0 -> 60%
                # > 2.0 -> 30%
                if odour_level <= 0.5:
                    perf_score = 100
                elif odour_level <= 1.2:
                    perf_score = 90
                elif odour_level <= 2.0:
                    perf_score = 60
                else:
                    perf_score = 30

                print(f"✅ AUTO-VERIFY: Closing Log #{log_id} for T-{toilet_id} with Score: {perf_score}")
                
                # Update Cleaning Log to 'Completed' and 'Verified'
                cursor.execute("""
                    UPDATE cleaning_log 
                    SET attendance_status = 'Completed', 
                        verification_status = 'Verified', 
                        cleaned_time = NOW(),
                        cleanliness_score = %s 
                    WHERE log_id = %s
                """, (perf_score, log_id))

        db.commit()
        return jsonify({"message": "Data received and verified"}), 200

    except Exception as e:
        print(f"DEBUG: ESP32 DATA ERROR: {str(e)}")
        if db:
            db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if db:
            db.close()


if __name__ == "__main__":
    app.run(debug=True)