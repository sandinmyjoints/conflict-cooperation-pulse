"""Main entry point for the GDELT data pipeline."""

import json
import os
import sys

from google.cloud import bigquery

from . import config
from .aggregate import aggregate_to_json
from .query import run_query
from .upload import upload_to_r2


def load_countries() -> dict[str, str]:
    """Load CAMEO country code → name mapping."""
    path = os.path.join(os.path.dirname(__file__), "cameo_countries.json")
    with open(path) as f:
        return json.load(f)


def load_existing_data(output_path: str) -> dict | None:
    """Load existing JSON data for incremental merge."""
    if os.path.exists(output_path):
        with open(output_path) as f:
            return json.load(f)
    return None


def main() -> None:
    mode = config.PIPELINE_MODE
    print(f"Pipeline mode: {mode}")

    # Ensure output directory exists
    os.makedirs(config.OUTPUT_DIR, exist_ok=True)
    output_path = os.path.join(config.OUTPUT_DIR, config.OUTPUT_FILE)

    # Load country names
    countries = load_countries()

    # Query BigQuery
    client = bigquery.Client()
    rows = run_query(client, mode=mode)

    if not rows:
        print("No rows returned, exiting")
        sys.exit(0)

    # Load existing data for incremental merge
    existing = None
    if mode == "incremental":
        existing = load_existing_data(output_path)

    # Aggregate
    result = aggregate_to_json(rows, countries, existing_data=existing)

    # Write JSON
    with open(output_path, "w") as f:
        json.dump(result, f, separators=(",", ":"))

    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"Wrote {output_path} ({size_mb:.1f} MB, {len(result['pairs'])} pairs, {len(result['weeks'])} weeks)")

    # Upload to R2
    upload_to_r2(output_path)


if __name__ == "__main__":
    main()
