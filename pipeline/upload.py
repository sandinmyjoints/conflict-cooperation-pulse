"""Upload generated JSON to Cloudflare R2."""

import os

import boto3

from . import config


def upload_to_r2(file_path: str) -> None:
    """Upload a file to Cloudflare R2 bucket."""
    if not config.R2_ENDPOINT:
        print("R2 not configured, skipping upload")
        return

    s3 = boto3.client(
        "s3",
        endpoint_url=config.R2_ENDPOINT,
        aws_access_key_id=config.R2_ACCESS_KEY,
        aws_secret_access_key=config.R2_SECRET_KEY,
    )

    key = config.OUTPUT_FILE
    s3.upload_file(
        file_path,
        config.R2_BUCKET,
        key,
        ExtraArgs={"ContentType": "application/json"},
    )
    print(f"Uploaded {file_path} to R2 bucket '{config.R2_BUCKET}' as '{key}'")
