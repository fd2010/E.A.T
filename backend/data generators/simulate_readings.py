import sqlite3
import random
import time
import os
from datetime import datetime
from create_database import create_database

import firebase_admin
from firebase_admin import credentials, db

# Load Firebase Admin credentials
cred = credentials.Certificate(r"C:\Users\karan\OneDrive\Documents\GitHub\E.A.T\config\serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://energy-analysis-tool-default-rtdb.europe-west1.firebasedatabase.app'
})

# Reference to the root of the database
ref = db.reference('/')

# Retrieve data
data = ref.get()
print("Database data:", data)

# Write data
ref.child("test").set({"message": "Hello from Python!"})

# Read back
print("Test Data:", ref.child("test").get())


class SmartMeterSimulator:
    def __init__(self, db_name='smart_meter.db'):
        self.db_name = os.path.abspath(db_name)
        self.devices = {
            'Desktop Computer': {'watts_range': (80, 175)},
            'Laptop': {'watts_range': (20, 50)},
            'Printer': {'watts_range': (30, 350)},
            'Coffee Machine': {'watts_range': (200, 1200)},
            'Monitor': {'watts_range': (20, 40)},
            'Server': {'watts_range': (200, 500)},
            'A/C': {'watts_range': (500, 1500)},  # Renamed from 'Air Conditioner'
            'Lights': {'watts_range': (10, 100)},  # Added Lights
            'Projector': {'watts_range': (150, 300)},  # Added Projector
            'Speakers': {'watts_range': (15, 80)},  # Added Speakers
            'Electric Hoover': {'watts_range': (30, 70)}
        }
    
    def check_database(self):
        if not os.path.exists(self.db_name):
            print(f"Database not found at: {self.db_name}")
            print("Creating new database...")
            if not create_database(self.db_name):
                return False
            print(f"Database created successfully at: {self.db_name}")
            return True
            
        print(f"Using existing database at: {self.db_name}")
        return True
    
    def generate_reading(self):
        voltage = random.uniform(215, 225)
        
        # Get current month to determine which range to use
        current_month = datetime.now().month
        
        total_watts = 0
        for device, specs in self.devices.items():
            if random.random() < 0.7:  # 70% chance device is active
                min_watts, max_watts = specs['watts_range']
                range_width = max_watts - min_watts
                
                # Determine which portion of the range to use based on the month
                if current_month in [11, 12, 1, 2]:  # Nov, Dec, Jan, Feb - upper 25%
                    device_min = min_watts + 0.75 * range_width
                    device_max = max_watts
                elif current_month in [3, 4, 5]:  # Mar, Apr, May - lower 25%
                    device_min = min_watts
                    device_max = min_watts + 0.25 * range_width
                else:  # Jun, Jul, Aug, Sep, Oct - middle 50%
                    device_min = min_watts + 0.25 * range_width
                    device_max = min_watts + 0.75 * range_width
            
                device_watts = random.uniform(device_min, device_max)
                total_watts += device_watts
         
        return voltage, total_watts
    
    def save_reading(self, voltage, watts):
        try:
            conn = sqlite3.connect(self.db_name)
            cursor = conn.cursor()
            
            current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            cursor.execute('''
                INSERT INTO tblReadings (timestamp, volts, watts)
                VALUES (?, ?, ?)
            ''', (current_time, voltage, watts))
            
            conn.commit()
            conn.close()
            return True
            
        except sqlite3.Error as e:
            print(f"Error saving reading: {e}")
            return False
    
    def run(self, interval=10):
        # Check if the database exists
        if not self.check_database():
            print("Failed to initialise database. Exiting...")
            return
        
        print("\nSmart Meter Simulator Started")
        print("Recording readings every", interval, "seconds")
        print("Press Ctrl+C to stop")
        
        try:
            while True:
                voltage, watts = self.generate_reading()
                if self.save_reading(voltage, watts):
                    print(f"Recorded: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - "
                          f"Voltage: {voltage:.2f}V, Power: {watts:.2f}W")
                else:
                    print("Failed to save reading!")
                
                time.sleep(interval)
                
        except KeyboardInterrupt:
            print("\nSimulator stopped by user")

if __name__ == "__main__":
    simulator = SmartMeterSimulator()
    simulator.run()