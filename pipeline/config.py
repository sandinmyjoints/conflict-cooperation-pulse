"""Configuration for the GDELT data pipeline."""

import os
from datetime import datetime, timedelta

# BigQuery — data source (public GDELT dataset)
BQ_DATA_PROJECT = "gdelt-bq"
BQ_DATASET = "gdeltv2"
BQ_TABLE = f"{BQ_DATA_PROJECT}.{BQ_DATASET}.events_partitioned"

# BigQuery — billing project (your own GCP project)
GCP_PROJECT = os.environ.get("GCP_PROJECT", "")

# Pipeline
TOP_PAIRS = 100
WEEKS_HISTORY = 260  # ~5 years
RECENT_WEEKS = 12
OUTPUT_DIR = os.environ.get("OUTPUT_DIR", os.path.join(os.path.dirname(__file__), "..", "data"))
OUTPUT_FILE = "pulse_data.json"

# R2 / S3
R2_ENDPOINT = os.environ.get("R2_ENDPOINT", "")
R2_BUCKET = os.environ.get("R2_BUCKET", "pulse-data")
R2_ACCESS_KEY = os.environ.get("R2_ACCESS_KEY", "")
R2_SECRET_KEY = os.environ.get("R2_SECRET_KEY", "")

# Mode
PIPELINE_MODE = os.environ.get("PIPELINE_MODE", "incremental")  # "full" or "incremental"

# Date range
INCREMENTAL_DAYS = 7


def backfill_start_date() -> str:
    """Start date for full backfill: ~5 years ago."""
    dt = datetime.utcnow() - timedelta(weeks=WEEKS_HISTORY)
    return dt.strftime("%Y-%m-%d")


def incremental_start_date() -> str:
    """Start date for incremental update: last 7 days."""
    dt = datetime.utcnow() - timedelta(days=INCREMENTAL_DAYS)
    return dt.strftime("%Y-%m-%d")
