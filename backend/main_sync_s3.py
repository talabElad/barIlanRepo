import os
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from datetime import datetime

class S3SyncHandler(FileSystemEventHandler):
    def __init__(self, local_folder, s3_bucket, wait_time=10):
        """
        Initialize S3SyncHandler

        Args:
            local_folder (str): Local folder to watch
            s3_bucket (str): S3 bucket to sync to
            wait_time (int): Time to wait before checking file stability
        """
        self.local_folder = local_folder
        self.s3_bucket = s3_bucket
        self.wait_time = wait_time

    def is_file_stable(self, file_path):
        """Keep checking if the file size remains the same over time."""
        while True:
            initial_size = os.path.getsize(file_path)
            time.sleep(self.wait_time)
            new_size = os.path.getsize(file_path)

            if initial_size == new_size:
                print(f"File {file_path} is stable.")
                return True
            else:
                print(f"File {file_path} is still changing. Retrying...")

    def upload_to_s3_with_folder_prefix(self, file_path):
        """Upload the file to S3 with a folder-like prefix based on the video file name."""
        file_name = os.path.basename(file_path)
        splitted_file_name = file_name.split(" ")
        unique_session_name = splitted_file_name[0]
        file_name_fixed = splitted_file_name[0]
        for text_part in splitted_file_name[1:]:
            file_name_fixed += '-' + text_part
        s3_key_prefix = f"sessions/{unique_session_name}/"
        s3_key = f"{s3_key_prefix}{file_name_fixed}"

        os.system(f'aws s3 cp "{file_path}" s3://{self.s3_bucket}/{s3_key}')
        print(f"Uploaded {file_name_fixed} to s3://{self.s3_bucket}/{s3_key} in {datetime.now()}")

    def on_created(self, event):
        if event.is_directory:
            return

        file_path = event.src_path
        if self.is_file_stable(file_path):
            self.upload_to_s3_with_folder_prefix(file_path)

if __name__ == "__main__":
    local_folder = r"C:\\Users\\TalAb\Downloads\\videos_barilan"
    s3_bucket = "barilanbucket"

    event_handler = S3SyncHandler(local_folder, s3_bucket)
    observer = Observer()
    observer.schedule(event_handler, path=local_folder, recursive=True)

    print(f"Watching for changes in {local_folder} and syncing to s3://{s3_bucket}")
    observer.start()

    try:
        while True:
            time.sleep(10)
    except KeyboardInterrupt:
        observer.stop()

    observer.join()
