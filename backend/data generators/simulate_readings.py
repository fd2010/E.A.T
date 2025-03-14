import sqlite3
import random
import time
import os
from datetime import datetime
from create_database import create_database

import firebase_admin
from firebase_admin import credentials, db

class SmartMeterSimulator:
    def __init__(self, db_name='smart_meter.db', devices_db_name='device_readings.db'):
        # Original database for total readings
        self.db_name = os.path.abspath(db_name)
        
        # New database for device-specific readings
        self.devices_db_name = os.path.abspath(devices_db_name)
        
        # Device power specifications
        self.device_specs = {
            'Desktop Computer': {'watts_range': (80, 175)},
            'Laptop': {'watts_range': (20, 50)},
            'Printer': {'watts_range': (30, 350)},
            'Coffee Machine': {'watts_range': (200, 1200)},
            'Monitor': {'watts_range': (20, 40)},
            'Server': {'watts_range': (200, 500)},
            'A/C': {'watts_range': (500, 1500)},
            'Lights': {'watts_range': (10, 100)},
            'Projector': {'watts_range': (150, 300)},
            'Speakers': {'watts_range': (15, 80)},
            'Electric Hoover': {'watts_range': (30, 70)}
        }
        
        # Initialize Firebase connection
        try:
            # Check if already initialized
            firebase_admin.get_app()
        except ValueError:
            # Load Firebase Admin credentials
            cred = credentials.Certificate(r"C:\Users\karan\OneDrive\Documents\GitHub\E.A.T\config\serviceAccountKey.json")
            firebase_admin.initialize_app(cred, {
                'databaseURL': 'https://energy-analysis-tool-default-rtdb.europe-west1.firebasedatabase.app'
            })
        
        # Reference to the root of the database
        self.ref = db.reference('/')
        
        # Debug Firebase structure on initialization
        print("Inspecting Firebase data structure...")
        self.debug_firebase_structure()
    
    def check_database(self):
        # Check if main database exists
        if not os.path.exists(self.db_name):
            print(f"Database not found at: {self.db_name}")
            print("Creating new database...")
            if not create_database(self.db_name):
                return False
            print(f"Database created successfully at: {self.db_name}")
        else:
            print(f"Using existing database at: {self.db_name}")
        
        # Check if device readings database exists
        if not os.path.exists(self.devices_db_name):
            print(f"Device readings database not found at: {self.devices_db_name}")
            print("Creating new device readings database...")
            if not self.create_device_database():
                return False
            print(f"Device readings database created successfully at: {self.devices_db_name}")
        else:
            print(f"Using existing device readings database at: {self.devices_db_name}")
        
        return True
    
    def create_device_database(self):
        """Create a new SQLite database for device-specific readings"""
        try:
            conn = sqlite3.connect(self.devices_db_name)
            cursor = conn.cursor()
            
            # Create table for device readings
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS tblDeviceReadings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    office_id TEXT NOT NULL,
                    room_name TEXT NOT NULL,
                    device_name TEXT NOT NULL,
                    device_type TEXT NOT NULL,
                    status TEXT NOT NULL,
                    volts REAL NOT NULL,
                    watts REAL NOT NULL
                )
            ''')
            
            # Create table for room summaries
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS tblRoomSummary (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    office_id TEXT NOT NULL,
                    room_name TEXT NOT NULL,
                    total_devices INTEGER NOT NULL,
                    active_devices INTEGER NOT NULL,
                    total_watts REAL NOT NULL
                )
            ''')
            
            conn.commit()
            conn.close()
            return True
            
        except sqlite3.Error as e:
            print(f"Error creating device database: {e}")
            return False
    
    def get_devices_from_firebase(self):
        """Retrieve all devices from Firebase database"""
        try:
            # Get all offices
            offices_data = self.ref.child('offices').get()
            
            if not offices_data:
                print("No offices found in Firebase!")
                return []
            
            # Debug - print data type
            print(f"Firebase data type: {type(offices_data)}")
            
            all_devices = []
            
            # Process each office - handle both dict and list formats
            if isinstance(offices_data, dict):
                offices_items = offices_data.items()
            else:
                print("Warning: Offices data is not a dictionary. Attempting to process anyway.")
                return []
            
            for office_id, office_data in offices_items:
                if not office_data or 'rooms' not in office_data:
                    continue
                
                rooms = office_data['rooms']
                
                # Process each room - handle both dict and list formats
                if isinstance(rooms, dict):
                    room_items = rooms.items()
                    
                    for room_name, devices in room_items:
                        # Skip empty rooms
                        if not devices:
                            continue
                        
                        # Handle devices list (could be array or object)
                        if isinstance(devices, list):
                            device_list = [(idx, device) for idx, device in enumerate(devices) if device is not None]
                        else:
                            device_list = [(key, device) for key, device in devices.items() if device is not None]
                        
                        # Add each device to our list with room and office info
                        for device_id, device in device_list:
                            if isinstance(device, dict):  # Ensure device is a dictionary
                                all_devices.append({
                                    'office_id': office_id,
                                    'room_name': room_name,
                                    'device_id': device_id,
                                    'name': device.get('name', 'Unknown Device'),
                                    'type': device.get('type', 'Unknown Type'),
                                    'status': device.get('status', 'Off')
                                })
            
            print(f"Found {len(all_devices)} devices in Firebase")
            return all_devices
            
        except Exception as e:
            print(f"Error fetching devices from Firebase: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def generate_reading_for_device(self, device):
        """Generate a power reading for a specific device based on its type and status"""
        voltage = random.uniform(215, 225)
        watts = 0
        
        device_type = device['type']
        status = device['status']
        
        # If device is Off, it should use very little or no power
        if status == 'Off':
            # Standby power (0-3 watts)
            watts = random.uniform(0, 3)
        else:
            # Get power range for this device type
            if device_type in self.device_specs:
                min_watts, max_watts = self.device_specs[device_type]['watts_range']
                
                # Get current month to determine which range to use (as in original simulator)
                current_month = datetime.now().month
                
                # Determine which portion of the range to use based on the month
                if current_month in [11, 12, 1, 2]:  # Nov, Dec, Jan, Feb - upper 25%
                    device_min = min_watts + 0.75 * (max_watts - min_watts)
                    device_max = max_watts
                elif current_month in [3, 4, 5]:  # Mar, Apr, May - lower 25%
                    device_min = min_watts
                    device_max = min_watts + 0.25 * (max_watts - min_watts)
                else:  # Jun, Jul, Aug, Sep, Oct - middle 50%
                    device_min = min_watts + 0.25 * (max_watts - min_watts)
                    device_max = min_watts + 0.75 * (max_watts - min_watts)
                
                # Add some randomness
                watts = random.uniform(device_min, device_max)
            else:
                # Default range if device type is unknown
                watts = random.uniform(10, 50)
        
        return voltage, watts
    
    def save_total_reading(self, voltage, total_watts):
        """Save the total power reading to the original database"""
        try:
            conn = sqlite3.connect(self.db_name)
            cursor = conn.cursor()
            
            current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            cursor.execute('''
                INSERT INTO tblReadings (timestamp, volts, watts)
                VALUES (?, ?, ?)
            ''', (current_time, voltage, total_watts))
            
            conn.commit()
            conn.close()
            return True
            
        except sqlite3.Error as e:
            print(f"Error saving total reading: {e}")
            return False
    
    def save_device_reading(self, timestamp, device, voltage, watts):
        """Save a device-specific reading to the device readings database"""
        try:
            conn = sqlite3.connect(self.devices_db_name)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO tblDeviceReadings (
                    timestamp, office_id, room_name, device_name, 
                    device_type, status, volts, watts
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                timestamp,
                device['office_id'],
                device['room_name'],
                device['name'],
                device['type'],
                device['status'],
                voltage,
                watts
            ))
            
            conn.commit()
            conn.close()
            return True
            
        except sqlite3.Error as e:
            print(f"Error saving device reading: {e}")
            return False
    
    def save_room_summary(self, timestamp, office_id, room_data):
        """Save a summary of room power usage"""
        try:
            conn = sqlite3.connect(self.devices_db_name)
            cursor = conn.cursor()
            
            for room_name, summary in room_data.items():
                cursor.execute('''
                    INSERT INTO tblRoomSummary (
                        timestamp, office_id, room_name, 
                        total_devices, active_devices, total_watts
                    ) VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    timestamp,
                    office_id,
                    room_name,
                    summary['total_devices'],
                    summary['active_devices'],
                    summary['total_watts']
                ))
            
            conn.commit()
            conn.close()
            return True
            
        except sqlite3.Error as e:
            print(f"Error saving room summary: {e}")
            return False
            
    def debug_firebase_structure(self):
        """Debug the Firebase data structure"""
        try:
            # Get the data at the root
            data = self.ref.get()
            print("\n===== Firebase Root Structure =====")
            print(f"Root keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dictionary'}")
            
            # Inspect offices structure
            offices = self.ref.child('offices').get()
            print("\n===== Offices Structure =====")
            if isinstance(offices, dict):
                print(f"Number of offices: {len(offices)}")
                print(f"Office IDs: {list(offices.keys())}")
                
                # Pick the first office to inspect
                if offices:
                    first_office_id = next(iter(offices.keys()))
                    first_office = offices[first_office_id]
                    print(f"\n----- Office {first_office_id} Structure -----")
                    print(f"Keys in office: {list(first_office.keys()) if isinstance(first_office, dict) else 'Not a dictionary'}")
                    
                    # Inspect rooms if they exist
                    if isinstance(first_office, dict) and 'rooms' in first_office:
                        rooms = first_office['rooms']
                        print(f"\n----- Rooms in Office {first_office_id} -----")
                        print(f"Type of rooms: {type(rooms)}")
                        if isinstance(rooms, dict):
                            print(f"Number of rooms: {len(rooms)}")
                            print(f"Room names: {list(rooms.keys())}")
                            
                            # Pick the first room to inspect
                            if rooms:
                                first_room_name = next(iter(rooms.keys()))
                                first_room = rooms[first_room_name]
                                print(f"\n----- Room {first_room_name} Structure -----")
                                print(f"Type of room data: {type(first_room)}")
                                print(f"Room data: {first_room}")
                                
                                # If the room has devices, inspect the first one
                                if isinstance(first_room, list) and first_room:
                                    print(f"\n----- First Device in Room {first_room_name} -----")
                                    print(f"Type: {type(first_room[0])}")
                                    print(f"Content: {first_room[0]}")
                                elif isinstance(first_room, dict) and first_room:
                                    first_device_key = next(iter(first_room.keys()))
                                    print(f"\n----- First Device {first_device_key} in Room {first_room_name} -----")
                                    print(f"Type: {type(first_room[first_device_key])}")
                                    print(f"Content: {first_room[first_device_key]}")
            else:
                print(f"Offices is not a dictionary! Type: {type(offices)}")
                print(f"Content: {offices}")
            
            print("\n===== End of Firebase Structure Debug =====\n")
        except Exception as e:
            print(f"Error during Firebase structure debugging: {e}")
            import traceback
            traceback.print_exc()
    
    def generate_readings(self):
        """Generate readings for all devices from the database"""
        # Get devices from Firebase
        devices = self.get_devices_from_firebase()
        
        if not devices:
            print("No devices found! Using default device simulation instead.")
            return self.generate_default_reading()
        
        print(f"Found {len(devices)} devices in the database")
        
        # Initialize data structures
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        total_watts = 0
        room_data = {}
        
        # Track the average voltage across all devices
        avg_voltage = random.uniform(219, 221)
        
        # Process each device
        for device in devices:
            office_id = device['office_id']
            room_name = device['room_name']
            
            # Create room entry if it doesn't exist
            if room_name not in room_data:
                room_data[room_name] = {
                    'total_devices': 0,
                    'active_devices': 0,
                    'total_watts': 0
                }
            
            # Generate reading for this device
            voltage, device_watts = self.generate_reading_for_device(device)
            
            # Update counters
            room_data[room_name]['total_devices'] += 1
            if device['status'] == 'On':
                room_data[room_name]['active_devices'] += 1
            room_data[room_name]['total_watts'] += device_watts
            total_watts += device_watts
            
            # Save device reading
            self.save_device_reading(
                current_time, 
                device, 
                voltage, 
                device_watts
            )
        
        # Save room summaries
        self.save_room_summary(current_time, office_id, room_data)
        
        # Return the total values for the main database
        return avg_voltage, total_watts
    
    def generate_default_reading(self):
        """Generate a reading using default device list (original method)"""
        voltage = random.uniform(215, 225)
        
        # Get current month to determine which range to use
        current_month = datetime.now().month
        
        total_watts = 0
        for device, specs in self.device_specs.items():
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
    
    def run(self, interval=10):
        # Check if the databases exist
        if not self.check_database():
            print("Failed to initialise databases. Exiting...")
            return
        
        print("\nSmart Meter Simulator Started")
        print("Recording readings every", interval, "seconds")
        print("Press Ctrl+C to stop")
        
        # Try to get devices once before entering the loop
        try:
            print("Fetching initial devices from Firebase...")
            devices = self.get_devices_from_firebase()
            if not devices:
                print("No devices found in Firebase database on startup.")
                print("Will use default device simulation until devices are found.")
            else:
                print(f"Found {len(devices)} devices on startup.")
        except Exception as e:
            print(f"Error during initial device fetch: {e}")
            import traceback
            traceback.print_exc()
        
        try:
            while True:
                # Generate readings from actual devices in Firebase
                voltage, total_watts = self.generate_readings()
                
                # Save the total reading to the original database
                if self.save_total_reading(voltage, total_watts):
                    print(f"Recorded: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - "
                          f"Voltage: {voltage:.2f}V, Total Power: {total_watts:.2f}W")
                else:
                    print("Failed to save reading!")
                
                time.sleep(interval)
                
        except KeyboardInterrupt:
            print("\nSimulator stopped by user")

if __name__ == "__main__":
    simulator = SmartMeterSimulator()
    simulator.run()