# create_database.py
import sqlite3
import os

def create_database(db_name='smart_meter.db'):
    
    # Check if database already exists or not
    if os.path.exists(db_name):
        print(f"Database {db_name} already exists!")
        return False
        
    try:
        # we create database and connect to it
        conn = sqlite3.connect(db_name)
        cursor = conn.cursor()
        
        # here we create the readings table for now i have reduced the complexity. but can easily be adjusted
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tblReadings (
                num INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME,
                volts REAL,
                watts REAL
            )
        ''')
        
        conn.commit()
        conn.close()
        
        print(f"Database {db_name} created successfully!")
        return True
        
    except sqlite3.Error as e:
        print(f"Error creating database: {e}")
        return False

if __name__ == "__main__":
    create_database()

# this is not really needed but its a fail safe to help ensure that all of the create database is imported.
__all__ = ['create_database']