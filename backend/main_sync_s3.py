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
from unittest.mock import MagicMock

#load_dotenv('.env')
logging.basicConfig(filename='s3_copy_errors.log', level=logging.ERROR)
logging.info("Starting the S3 Sync Handler")

s3 = boto3.client('s3')
lock = threading.Lock()
folder_path = r"C:\\Users\\TalAb\\Downloads\\videos_barilan"
df_files_waiting_validation = pd.read_csv("files_waiting_validation.csv")
df_last_file_uploaded = pd.read_csv("last_file_uploaded.csv")



class S3SyncHandler(FileSystemEventHandler):
    def __init__(self, folder_path, s3_bucket, wait_time=10):
        self.folder_path = folder_path
        self.s3_bucket = s3_bucket
        self.wait_time = wait_time

    def is_file_stable(self, file_path):
        """Check if the file size remains stable over the wait time."""
        while True:
            initial_size = os.path.getsize(file_path)
            time.sleep(self.wait_time)
            if initial_size == os.path.getsize(file_path):
                print(f"File {file_path} is stable.")
                return True
            print(f"File {file_path} is still changing. Retrying...")

    def upload_to_s3_with_folder_prefix(self, file_path):
        """Upload file to S3 with a unique session folder prefix."""
        try:
            global df_files_waiting_validation
            global df_last_file_uploaded
            file_name = os.path.basename(file_path)
            session_name = file_name.split(" ")[0]
            s3_key = f"sessions/{session_name}/{file_name.replace(' ', '-')}"
            print(file_path)
            print(s3_key)
            print(df_files_waiting_validation,"---before-1--------------------------------------")
            df_files_waiting_validation.loc[
                df_files_waiting_validation['file_path'] == file_path,
                's3_file_key_waiting_for_check'
            ] = s3_key
            df_files_waiting_validation.loc[
                df_files_waiting_validation['file_path'] == file_path,
                's3_bucket'
            ] = self.s3_bucket
            df_files_waiting_validation.to_csv("files_waiting_validation.csv", index=False)
            print(df_files_waiting_validation,"--after-1--------------------------------------")
            s3.upload_file(file_path, self.s3_bucket, s3_key)
            print(f"Uploaded {file_name} to s3://{self.s3_bucket}/{s3_key} at {datetime.now()}")
        except Exception as e:
            logging.error(f"Failed to upload {file_path}. Error: {str(e)}")

    def on_created(self, event):
        with lock:
            try:
                if event.is_directory:
                    return
                global df_files_waiting_validation
                global df_last_file_uploaded
                file_path = event.src_path
                file_timestamp = os.path.getmtime(file_path)
                file_datetime = datetime.fromtimestamp(file_timestamp).strftime("%d-%m-%Y %H:%M:%S")
                print(df_last_file_uploaded)
                prev_file_timestamp = df_last_file_uploaded['filetimestamp'].values[0]

                if self.is_file_stable(file_path):
                    print(df_files_waiting_validation,"---before-2--------------------------------------")
                    file_data_dict = {'file_path': file_path, 'filetimestamp': file_timestamp, 'datetime': file_datetime}
                    if file_timestamp > prev_file_timestamp:
                        df_last_file_uploaded = df_last_file_uploaded[[False]]
                        df_last_file_uploaded = pd.concat([df_last_file_uploaded, pd.DataFrame([file_data_dict])], ignore_index=True)
                        df_last_file_uploaded.to_csv("last_file_uploaded.csv", index=False)
                    
                    df_files_waiting_validation = pd.concat([df_files_waiting_validation, pd.DataFrame([file_data_dict])], ignore_index=True)
                    df_files_waiting_validation.to_csv("files_waiting_validation.csv", index=False)
                    print(df_files_waiting_validation,"--after-2--------------------------------------")
                    self.upload_to_s3_with_folder_prefix(file_path)
            except Exception as e:
                logging.error(f"Unexpected error in on_created for {event.src_path}: {e}")
                


def check_for_missed_files(event_handler, df_last_file_uploaded=df_last_file_uploaded):
    newer_files = []
    try:
        last_file_time = df_last_file_uploaded['filetimestamp'].values[0]
        with os.scandir(folder_path) as entries:
            for entry in entries:
                if entry.is_file() and entry.stat().st_mtime > last_file_time:
                    newer_files.append(entry.path)
        
        fake_event = MagicMock()
        fake_event.is_directory = False
        for file_path in newer_files:
            fake_event.src_path = file_path
            
            event_handler.on_created(fake_event)
    except Exception as e:
        logging.error(f"Unexpected error in validation_job for {row['file_path']}: {e}")

def validation_job(event_handler):
    global df_files_waiting_validation
    while True:
        time.sleep(5)
        if df_files_waiting_validation.empty is False:
            with lock:
                indices_to_drop = []
                print(df_files_waiting_validation,"---before-3--------------------------------------")
                for index, row in df_files_waiting_validation.iterrows():
                    try:
                        response_meta_data = s3.head_object(Bucket=event_handler.s3_bucket, Key=row['s3_file_key_waiting_for_check'])
                        file_size_s3 = response_meta_data['ContentLength']
                        file_size_local = os.path.getsize(row['file_path'])

                        if file_size_s3 != file_size_local:
                            print(f"Reuploading {row['file_path']} to s3://{row['s3_bucket']}/{row['s3_file_key_waiting_for_check']} at {datetime.now()}")
                            event_handler.upload_to_s3_with_folder_prefix(row['file_path'])
                        else:
                            print(df_files_waiting_validation,index)
                            indices_to_drop.append(index)
                            print(f"successfully verifing {row['file_path']} to s3://{row['s3_bucket']}/{row['s3_file_key_waiting_for_check']} at {datetime.now()}")
                    except ClientError as e:
                        if e.response['Error']['Code'] == '404':
                            print(f"The file '{row['s3_file_key_waiting_for_check']}' does not exist in bucket '{event_handler.s3_bucket}'.")
                            event_handler.upload_to_s3_with_folder_prefix(row['file_path'])
                        else:
                            logging.error(f"An error occurred: {e}")
                    except Exception as e:
                        logging.error(f"Unexpected error for {row['file_path']}: {e}")
                try:
                    if len(indices_to_drop)!=0:
                        df_files_waiting_validation.drop(index=indices_to_drop, inplace=True)
                        df_files_waiting_validation.reset_index(drop=True, inplace=True)
                        df_files_waiting_validation.to_csv("files_waiting_validation.csv", index=False)
                except Exception as e:
                    logging.error(f"Unexpected error in updating df_files_waiting_validation in validation_job for {row['file_path']}: {e}")
        time.sleep(3)
        print(df_files_waiting_validation,"--after-3--------------------------------------")


if __name__ == "__main__":
    s3_bucket = "barilanbucket"
    event_handler = S3SyncHandler(folder_path, s3_bucket)
    check_for_missed_files(event_handler)

    observer = Observer()
    observer.schedule(event_handler, path=folder_path, recursive=True)
    print(f"Watching for changes in {folder_path} and syncing to s3://{s3_bucket}")
    observer.start()

    sync_thread = threading.Thread(target=validation_job, args=(event_handler,))
    sync_thread.daemon = True
    sync_thread.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()

    observer.join()
