"""Upload to / download from Cloudflare R2."""

import os

import boto3
from botocore.exceptions import ClientError

from . import config


def _r2_client():
    return boto3.client(
        "s3",
        endpoint_url=config.R2_ENDPOINT,
        aws_access_key_id=config.R2_ACCESS_KEY,
        aws_secret_access_key=config.R2_SECRET_KEY,
    )


def download_from_r2(dest_path: str) -> bool:
    """Download existing data from R2. Returns True if successful."""
    if not config.R2_ENDPOINT:
        print("R2 not configured, skipping download")
        return False

    s3 = _r2_client()
    try:
        s3.download_file(config.R2_BUCKET, config.OUTPUT_FILE, dest_path)
        size_mb = os.path.getsize(dest_path) / (1024 * 1024)
        print(f"Downloaded existing data from R2 ({size_mb:.1f} MB)")
        return True
    except ClientError as e:
        code = e.response["Error"]["Code"]
        if code in ("404", "NoSuchKey"):
            print("No existing data in R2, will run as full build")
            return False
        raise


def upload_to_r2(file_path: str) -> None:
    """Upload a file to Cloudflare R2 bucket."""
    if not config.R2_ENDPOINT:
        print("R2 not configured, skipping upload")
        return

    s3 = _r2_client()
    key = config.OUTPUT_FILE
    s3.upload_file(
        file_path,
        config.R2_BUCKET,
        key,
        ExtraArgs={"ContentType": "application/json"},
    )
    print(f"Uploaded {file_path} to R2 bucket '{config.R2_BUCKET}' as '{key}'")
