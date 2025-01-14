import pandas as pd

data_frame = pd.DataFrame(columns=['s3_file_key_waiting_for_check','s3_bucket','file_path','filetimestamp','datetime'])

data_frame.to_csv("files_waiting_validation.csv")

data_frame = pd.DataFrame(columns=['file_path','filetimestamp','datetime'])
data_frame = pd.concat([data_frame, pd.DataFrame([{'file_path': 'test', 'filetimestamp': 0, 'datetime': 0}])], ignore_index=True)
data_frame.to_csv("last_file_uploaded.csv")