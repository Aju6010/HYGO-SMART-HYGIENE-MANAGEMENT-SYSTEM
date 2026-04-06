from app import get_cursor
db, cursor = get_cursor()
try:
    # 1. Add assigned_staff_id to toilet table (if not exists)
    try:
        cursor.execute("ALTER TABLE toilet ADD COLUMN assigned_staff_id INT DEFAULT NULL")
        print("Column assigned_staff_id added to toilet table")
    except:
        pass

    # 2. Add cleanliness_score to cleaning_log table
    try:
        cursor.execute("ALTER TABLE cleaning_log ADD COLUMN cleanliness_score INT DEFAULT 0")
        print("Column cleanliness_score added to cleaning_log table")
    except:
        pass

    db.commit()
except Exception as e:
    print(f"Schema update error: {e}")
finally:
    db.close()
