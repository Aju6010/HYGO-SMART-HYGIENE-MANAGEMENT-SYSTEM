from app import get_cursor
db, cursor = get_cursor()
try:
    cursor.execute("ALTER TABLE toilet ADD COLUMN assigned_staff_id INT DEFAULT NULL")
    db.commit()
    print("Column assigned_staff_id added successfully")
except Exception as e:
    print(f"Error: {e}")
db.close()
