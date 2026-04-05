from app import get_cursor
db, cursor = get_cursor()
cursor.execute("DESCRIBE toilet")
for row in cursor.fetchall():
    print(row)
db.close()
