import os
from datetime import datetime

folder_path = r"C:\\Users\\TalAb\Downloads\\videos_barilan"
picked_date = '2023-10-21 14:30:00'
last_file_time = datetime.strptime(picked_date, '%Y-%m-%d %H:%M:%S').timestamp()
print(last_file_time)

# Faster file listing using os.scandir()
newer_files = []
with os.scandir(folder_path) as entries:
    for entry in entries:
        print(entry.stat().st_mtime)
        if entry.is_file() and entry.stat().st_mtime > last_file_time:
            newer_files.append(entry.path)
            

print("Files newer than", picked_date, "are:", newer_files)