import boto3
import json
import uuid
import re
import os
from datetime import datetime
import urllib.parse  # for URL decoding


def extract_data_from_file_name(full_video_name):
    file_suffix = full_video_name.split('.')[-1]

    video_info_splitted = full_video_name.split("-")

    if file_suffix == 'mp4':
        therapist_code = video_info_splitted[1]
        room_num = video_info_splitted[2]
        patient_code = video_info_splitted[3]
        meeting_num = video_info_splitted[4]
        camera_name = video_info_splitted[5]
        date = video_info_splitted[6]
        time = video_info_splitted[7]
        is_video = True
    else:
        therapist_code = video_info_splitted[1]
        room_num = video_info_splitted[2]
        patient_code = video_info_splitted[3]
        meeting_num = video_info_splitted[4]
        camera_name = ''

        date_str = video_info_splitted[5]
        year = date_str[0:4]
        month = date_str[4:6]
        day = date_str[6:8]
        hour = date_str[8:10]
        min = date_str[10:12]
        sec = date_str[12:14]

        date = day + '_' + month + '_' + year
        time = hour + '_' + min + '_' + sec
        is_video = False

    return therapist_code, room_num, patient_code, meeting_num, camera_name, date, time, is_video


def put_data_in_dynamodb(full_video_name, video_s3_key, transcribe_ouput_s3_key):
    try:
        dynamodb_client = boto3.resource('dynamodb')
        table_sessions_files = dynamodb_client.Table('BarIlanSessionsFiles')
        table_transcriptions = dynamodb_client.Table('BarIlanTranscriptions')

        therapist_code, room_num, patient_code, meeting_num, camera_name, date, time, is_video = extract_data_from_file_name(
            full_video_name)

        try:
            response_trancriptions = table_transcriptions.get_item(
                Key={
                    'unique_session_name': os.path.basename(os.path.dirname(video_s3_key)),
                    'therapist_code': therapist_code
                },
                ProjectionExpression='unique_session_name'
            )
            if 'Item' in response_trancriptions:
                print("Transcription record exists")
                is_transcription_exists = True
            else:
                print("Transcription record does not exist")
                is_transcription_exists = False

        except Exception as e:
            return {"IsSuccessfull": False, "body": f"Error checking item existence in DynamoDB: {e}"}

        table_sessions_files.put_item(
            Item={
                'full_video_name': full_video_name,
                'therapist_code': therapist_code,
                'file_key_to_s3': video_s3_key,
                'room_num': int(room_num),
                'patient_code': patient_code,
                'meeting_num': int(meeting_num),
                'camera_name': camera_name,
                'date': date,
                'time': time,
                'unique_session_name': os.path.basename(os.path.dirname(video_s3_key)),
                'is_video': is_video
            }
        )

        if not is_transcription_exists:
            table_transcriptions.put_item(
                Item={
                    'unique_session_name': os.path.basename(os.path.dirname(video_s3_key)),
                    'therapist_code': therapist_code,
                    'meeting_num': int(meeting_num),
                    'patient_code': patient_code,
                    'transcribe_outputkey_s3': transcribe_ouput_s3_key,
                    'room_num': int(room_num),
                    'date': date,
                    'time': time,
                    'camera_name': camera_name,
                    'is_video': is_video
                }
            )

        print("Succesfully added metadata to dynamodb")
        return {"IsSuccessfull": True, "IsTranscriptionExists": is_transcription_exists}

    except Exception as e:
        print(f"An error occurred: {e}")
        # Return or re-raise to stop further execution
        return {"IsSuccessfull": False, "body": f"An error occurred {e}"}
        # You can also re-raise if you want the exception to propagate


def lambda_handler(event, context):
    print(json.dumps(event))

    # Get the S3 bucket and object information from the event
    record = event['Records'][0]
    s3bucket = record['s3']['bucket']['name']
    s3object = record['s3']['object']['key']

    # URL decode the object key to handle special characters
    s3object_decoded = urllib.parse.unquote(s3object)

    # Create the full S3 path for the input media
    s3Path = f"s3://{s3bucket}/{s3object_decoded}"
    full_video_name = s3object_decoded.split('/')[-1]
    full_video_name_without_ext = full_video_name.split(".")[0]
    # Log the S3 path for debugging
    print(f"S3 Path: {s3Path}")

    # Create a valid job name by replacing invalid characters
    jobName = full_video_name_without_ext + '-' + "transcribe_output"

    # Get the directory of the video to replicate the folder structure for transcription output
    s3object_dir = os.path.dirname(s3object_decoded)  # Extract the folder path

    outputkey_transcribe = s3object_dir + '/transcriptions/' + jobName + '.json'
    # Create the Transcribe client
    transcribe_client = boto3.client('transcribe')

    is_put_data_succesfull = put_data_in_dynamodb(full_video_name, s3object_decoded, outputkey_transcribe)
    # Start the transcription job
    if is_put_data_succesfull['IsSuccessfull']:
        if not is_put_data_succesfull["IsTranscriptionExists"]:
            response = transcribe_client.start_transcription_job(
                TranscriptionJobName=jobName,
                LanguageCode='he-IL',
                MediaFormat='mp4',
                Media={
                    'MediaFileUri': s3Path
                },
                OutputBucketName=s3bucket,
                OutputKey=outputkey_transcribe
            )

            print(json.dumps(response, default=str))

            return {
                'TranscriptionJobName': response['TranscriptionJob']['TranscriptionJobName']
            }
        else:
            print("Transcription already exists, saved file meta data succesfully.")
            return {"iutput": "Transcription already exists, saved file meta data succesfully."}
    else:
        print(is_put_data_succesfull)
        return {'error': is_put_data_succesfull['body']}

