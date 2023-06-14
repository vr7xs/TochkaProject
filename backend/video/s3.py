from config import AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, BUCKET_NAME, REGION_NAME
from db_core.exceptions import S3Error
import boto3


class S3Client:
    def __init__(self):
        self.client = boto3.client(
            's3',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=REGION_NAME,
            endpoint_url='https://storage.yandexcloud.net'
        )

    def upload_file(self, file, filename):
        try:
            self.client.put_object(Body=file, Bucket=BUCKET_NAME, Key=filename)
        except:
            raise S3Error()

    def get_object_url(self, filename):
        try:
            return self.client.generate_presigned_url(
                ClientMethod='get_object',
                Params={'Bucket': BUCKET_NAME, 'Key': filename},
                ExpiresIn=60 * 5
            )
        except Exception as e:
            print(e)
            return None

    def delete_object(self, filename):
        try:
            self.client.delete_object(
                Bucket=BUCKET_NAME,
                Key=filename
            )
        except:
            raise S3Error()


def generate_unique_filename(filename: str):
    extension = filename[filename.rfind('.') + 1:]
    from os import urandom
    return f'{urandom(16).hex()}.{extension}'


