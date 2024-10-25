import os
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from datetime import datetime
import pandas as pd
import threading
import boto3
from botocore.exceptions import ClientError
import logging
from dotenv import load_dotenv

load_dotenv('.env')
# Configure logging
logging.basicConfig(filename='s3_copy_errors.log', level=logging.ERROR)

# Initialize the S3 client
s3 = boto3.client('s3')
lock = threading.Lock()
folder_path = r"C:\\Users\\TalAb\\Downloads\\videos_barilan"
df_files_waiting_validation = pd.read_csv("files_waiting_validation.csv")
df_last_file_uploaded = pd.read_csv("last_file_uploaded.csv")


class S3SyncHandler(FileSystemEventHandler):
    def __init__(self, folder_path, s3_bucket, wait_time=10):
        """
        Initialize S3SyncHandler

        Args:
            folder_path (str): Local folder to watch
            s3_bucket (str): S3 bucket to sync to
            wait_time (int): Time to wait before checking file stability
        """
        self.folder_path = folder_path
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

        df_files_waiting_validation.loc[df_files_waiting_validation['file_path'] == file_path, 's3_file_key_waiting_for_check'] = s3_key
        df_files_waiting_validation.to_csv("files_waiting_validation.csv")
        
        try:
            s3.copy_object(CopySource=file_path, Bucket=self.s3_bucket, Key=s3_key)
            print(f"Uploaded {file_name_fixed} to s3://{self.s3_bucket}/{s3_key} in {datetime.now()}")
        except Exception as e:
            error_message = f"Failed to copy {file_path} to {s3_key}. Error: {str(e)}"
            logging.error(error_message)
            print(f"Error occurred: {error_message}")

        

    def on_created(self, event):
        with lock:
            if event.is_directory:
                return

            file_path = event.src_path
            file_timestamp = os.path.getmtime(file_path)
            file_datetime = datetime.fromtimestamp(file_timestamp).strftime("%d-%m-%Y %H:%M:%S")
            
            if file_timestamp>df_last_file_uploaded['filetimestamp'].values[0]:
                file_data_dict = {'file_path': file_path,'filetimestamp':file_timestamp,'datetime':file_datetime}
                df_last_file_uploaded.loc[0] = file_data_dict
                df_last_file_uploaded.to_csv("df_last_file_uploaded.csv")
            
            df_files_waiting_validation = df_files_waiting_validation.append(file_data_dict, ignore_index=True)
            df_files_waiting_validation.to_csv("files_waiting_validation.csv")
            
            if self.is_file_stable(file_path):
                self.upload_to_s3_with_folder_prefix(file_path)


def check_for_missed_files(event_handler):
    newer_files = []
    last_file_time = df_last_file_uploaded['filetimestamp'].values[0]
    with os.scandir(folder_path) as entries:
        for entry in entries:
            print(entry.stat().st_mtime)
            if entry.is_file() and entry.stat().st_mtime > last_file_time:
                newer_files.append(entry.path)
    for file_path in newer_files:
        event_handler.on_created(file_path)


def validation_job(event_handler):
    time.sleep(300)
    
    while True:
        with lock:
            for index, row in df_files_waiting_validation.iterrows():
                try:
                    # Use head_object to get metadata, including file size
                    response_meta_data = s3.head_object(Bucket=row['s3_bucket'], Key=row['s3_file_key_waiting_for_check'])
                    
                    # Get the size of the object in bytes
                    file_size_s3 = response_meta_data['ContentLength']
                    
                    file_size_local = os.path.getsize(row['file_path'])
                    
                    if file_size_s3!=file_size_local:
                        event_handler.upload_to_s3_with_folder_prefix(row['file_path'])
                    else:
                        df_files_waiting_validation.drop(index=index, inplace=True)
                        df_files_waiting_validation.reset_index(drop=True, inplace=True)
                        df_files_waiting_validation.to_csv("files_waiting_validation.csv")
                        
                except ClientError as e:
                    # Check if the error is a 404 Not Found (file doesn't exist)
                    if e.response['Error']['Code'] == '404':
                        print(f"Error: The file '{row['s3_file_key_waiting_for_check']}' does not exist in bucket '{row['s3_bucket']}'.")
                    else:
                        print(f"An error occurred: {e}")
    
    


if __name__ == "__main__":
    s3_bucket = "barilanbucket"

    event_handler = S3SyncHandler(folder_path, s3_bucket)
    check_for_missed_files(event_handler=event_handler,)
    
    observer = Observer()
    observer.schedule(event_handler, path=folder_path, recursive=True)

    print(f"Watching for changes in {folder_path} and syncing to s3://{s3_bucket}")
    observer.start()

    # Start the sync_job in a separate thread to run independently, but using the same lock
    sync_thread = threading.Thread(target=validation_job,args=(event_handler,))
    sync_thread.daemon = True  # Daemonize the thread so it exits when the main program ends
    sync_thread.start()

    try:
        while True:
            time.sleep(1)  # Keep the script running
    except KeyboardInterrupt:
        observer.stop()  # Stop the observer when interrupted

    observer.join()