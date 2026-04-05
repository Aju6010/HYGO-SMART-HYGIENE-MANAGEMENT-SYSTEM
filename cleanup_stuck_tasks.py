from app import get_cursor
db, cursor = get_cursor()
try:
    # Mark all currently 'Assigned' tasks as 'Completed' to clear the dashboard
    cursor.execute("""
        UPDATE cleaning_log 
        SET attendance_status = 'Completed', 
            verification_status = 'Verified', 
            cleaned_time = NOW() 
        WHERE attendance_status = 'Assigned'
    """)
    db.commit()
    print("Cleanup successful: All old tasks have been moved to 'Completed' status.")
except Exception as e:
    print(f"Cleanup Error: {e}")
db.close()
