# THIS FILES IS FOR MAPPING OUT THE FILE STRUCTURE FOR THE README FILES!!! - NO FUNCTIONAL USE FOR THE WEBSITE
import os

def map_directory(path, indent=""):
    # Print the current directory name
    print(f"{indent}📁 {os.path.basename(path)}/")
    
    try:
        # List everything in the directory
        for item in os.listdir(path):
            item_path = os.path.join(path, item)
            
            # Skip hidden files/folders (ones that start with '.')
            if item.startswith('.'):
                continue
                
            # If it's a directory, recursively map it
            if os.path.isdir(item_path):
                map_directory(item_path, indent + "  ")
            # If it's a file, print it
            else:
                print(f"{indent}  📄 {item}")
    except PermissionError:
        print(f"{indent}  ⚠️ Permission denied")
    except Exception as e:
        print(f"{indent}  ⚠️ Error: {str(e)}")

# Get the current directory where this script is located
current_dir = os.path.dirname(os.path.abspath(__file__))

# Map everything starting from the current directory
print("\nMapping files from current directory...")
map_directory(current_dir)