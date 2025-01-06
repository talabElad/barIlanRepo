import os
import time
from datetime import datetime
import pandas as pd
import boto3
import shutil
from botocore.exceptions import ClientError
import logging
from dotenv import load_dotenv

#load_dotenv('.env')
logging.basicConfig(filename='s3_copy_errors.log', level=logging.ERROR)
logging.info("Starting the S3 Sync Handler")
endpoint_url = "https://bucket.vpce-0349dcdbe6c602d19-q7bx3wyh.s3.eu-west-1.vpce.amazonaws.com"

s3_client = boto3.client(
    's3',
    endpoint_url=endpoint_url
)
df_files_waiting_validation = pd.read_csv("files_waiting_validation.csv")
df_last_file_uploaded = pd.read_csv("last_file_uploaded.csv")


class S3SyncHandler():
    def __init__(self, folder_src,folder_dest, s3_bucket):
        self.folder_src = folder_src
        self.folder_dest = folder_dest
        self.s3_bucket = s3_bucket

    def upload_to_s3_with_folder_prefix(self, file_path):
        """Upload file to S3 with a unique session folder prefix."""
        try:
            global df_files_waiting_validation
            global df_last_file_uploaded

            file_timestamp = os.path.getmtime(file_path)
            file_datetime = datetime.fromtimestamp(file_timestamp).strftime("%d-%m-%Y %H:%M:%S")
            prev_file_timestamp = df_last_file_uploaded['filetimestamp'].values[0]

            file_data_dict = {'file_path': file_path, 'filetimestamp': file_timestamp, 'datetime': file_datetime}
            if file_timestamp > prev_file_timestamp:
                df_last_file_uploaded = df_last_file_uploaded[[False]]
                df_last_file_uploaded = pd.concat([df_last_file_uploaded, pd.DataFrame([file_data_dict])], ignore_index=True)
                df_last_file_uploaded.to_csv("last_file_uploaded.csv", index=False)
            
            df_files_waiting_validation = pd.concat([df_files_waiting_validation, pd.DataFrame([file_data_dict])], ignore_index=True)
            df_files_waiting_validation.to_csv("files_waiting_validation.csv", index=False)
            file_name = os.path.basename(file_path)
            session_name, camera_name, date_txt, time_txt, ext_txt = file_name.split(" ")
            date_txt = date_txt.replace('_','-')
            time_txt = time_txt.replace('_','-')
            new_file_name = session_name + '_' + camera_name + '_' + date_txt + '_' + time_txt + '_' + ext_txt
            print(new_file_name)
            s3_key = f"sessions/{session_name}/{new_file_name}"
            print(file_path)
            print(s3_key)
            df_files_waiting_validation.loc[
                df_files_waiting_validation['file_path'] == file_path,
                's3_file_key_waiting_for_check'
            ] = s3_key
            df_files_waiting_validation.loc[
                df_files_waiting_validation['file_path'] == file_path,
                's3_bucket'
            ] = self.s3_bucket
            df_files_waiting_validation.to_csv("files_waiting_validation.csv", index=False)
            s3_client.upload_file(file_path, self.s3_bucket, s3_key)
            print(f"Uploaded {file_name} to s3://{self.s3_bucket}/{s3_key} at {datetime.now()}")
        except Exception as e:
            print(f"Failed to upload {file_path}. Error: {str(e)}")
            logging.error(f"Failed to upload {file_path}. Error: {str(e)}")

    def validation_handler(self):
        global df_files_waiting_validation
        time.sleep(10)
        if df_files_waiting_validation.empty is False:
            indices_to_drop = []
            for index, row in df_files_waiting_validation.iterrows():
                try:
                    response_meta_data = s3_client.head_object(Bucket=self.s3_bucket, Key=row['s3_file_key_waiting_for_check'])
                    file_size_s3 = response_meta_data['ContentLength']
                    file_size_local = os.path.getsize(row['file_path'])

                    if file_size_s3 != file_size_local:
                        print(f"Reuploading {row['file_path']} to s3://{row['s3_bucket']}/{row['s3_file_key_waiting_for_check']} at {datetime.now()}")
                        self.upload_to_s3_with_folder_prefix(row['file_path'])
                    else:
                        print(df_files_waiting_validation,index)
                        indices_to_drop.append(index)
                        print(f"successfully verifing {row['file_path']} to s3://{row['s3_bucket']}/{row['s3_file_key_waiting_for_check']} at {datetime.now()}")
                except ClientError as e:
                    if e.response['Error']['Code'] == '404':
                        print(f"The file '{row['s3_file_key_waiting_for_check']}' does not exist in bucket '{self.s3_bucket}'.")
                        self.upload_to_s3_with_folder_prefix(row['file_path'])
                    else:
                        print(f"An error occurred: {e}")
                        logging.error(f"An error occurred: {e}")
                except Exception as e:
                    print(f"Unexpected error for {row['file_path']}: {e}")
                    logging.error(f"Unexpected error for {row['file_path']}: {e}")
            try:
                if len(indices_to_drop)!=0:
                    
                    for idx in indices_to_drop:
                        source_file_path = df_files_waiting_validation.loc[idx, 'file_path']  # Get file path from DataFrame
                        
                        if os.path.exists(source_file_path):
                            destination_file_path = os.path.join(self.folder_dest, os.path.basename(source_file_path))
                            shutil.move(source_file_path, destination_file_path)
                            print(f"Moved: {source_file_path} to {self.folder_dest}")
                        else:
                            print(f"File not found in src dir: {source_file_path}")
                    
                    df_files_waiting_validation.drop(index=indices_to_drop, inplace=True)
                    df_files_waiting_validation.reset_index(drop=True, inplace=True)
                    df_files_waiting_validation.to_csv("files_waiting_validation.csv", index=False)
            except Exception as e:
                print(f"Unexpected error in updating df_files_waiting_validation in validation_job for {row['file_path']}: {e}")
                logging.error(f"Unexpected error in updating df_files_waiting_validation in validation_job for {row['file_path']}: {e}")


    def run(self):
        # Iterate through all files in the directory
        for filename in os.listdir(self.folder_src):
            file_path = os.path.join(self.folder_src, filename)
            
            # Check if it's a file (not a directory)
            if os.path.isfile(file_path):
                print(f"Processing file: {filename}")
                self.upload_to_s3_with_folder_prefix(file_path)
        self.validation_handler()

if __name__ == "__main__":
    s3_bucket = "barilanbucketprod"
    folder_src = "D:\\ELAD_recordings\\src"
    folder_dest = "D:\\ELAD_recordings\\dest"
    sync_handler = S3SyncHandler(folder_src,folder_dest, s3_bucket)
    sync_handler.run()
