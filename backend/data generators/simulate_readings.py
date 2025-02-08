import sqlite3
import random
import time
import os
from datetime import datetime
from create_database import create_database

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
            'Air Conditioner': {'watts_range': (500, 1500)}
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
        
        total_watts = 0
        for device, specs in self.devices.items():
            if random.random() < 0.7:  # 70% chance device is active
                device_watts = random.uniform(*specs['watts_range'])
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
        # Check if th databse exists
        if not self.check_database():
            print("Failed to initialize database. Exiting...")
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