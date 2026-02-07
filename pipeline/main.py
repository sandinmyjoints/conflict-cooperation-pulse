"""Main entry point for the GDELT data pipeline."""

import argparse
import json
import os
import sys
import time

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


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="GDELT data pipeline")
    parser.add_argument(
        "--project",
        default=config.GCP_PROJECT,
        help="GCP project ID for BigQuery billing (or set GCP_PROJECT env var)",
    )
    parser.add_argument(
        "--mode",
        choices=["full", "incremental"],
        default=config.PIPELINE_MODE,
        help="Pipeline mode: full backfill or incremental update",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Estimate query cost without running",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    mode = args.mode
    print(f"Pipeline mode: {mode}")

    if not args.project:
        print("Error: No GCP project specified. Use --project or set GCP_PROJECT.", file=sys.stderr)
        print("  This is YOUR GCP project for billing — not the GDELT data project.", file=sys.stderr)
        print("  The public GDELT dataset is free to query within BigQuery's 1TB/mo free tier.", file=sys.stderr)
        sys.exit(1)

    # Ensure output directory exists
    os.makedirs(config.OUTPUT_DIR, exist_ok=True)
    output_path = os.path.join(config.OUTPUT_DIR, config.OUTPUT_FILE)

    pipeline_t0 = time.time()

    # Step 1: Load country names
    print("[1/5] Loading country names...")
    countries = load_countries()

    # Step 2: Query BigQuery
    print(f"[2/5] Querying BigQuery ({mode})...")
    client = bigquery.Client(project=args.project)
    rows = run_query(client, mode=mode, dry_run=args.dry_run)

    if args.dry_run or not rows:
        if args.dry_run:
            print("Dry run complete")
        else:
            print("No rows returned, exiting")
        sys.exit(0)

    # Step 3: Load existing data for incremental merge
    existing = None
    if mode == "incremental":
        print("[3/5] Loading existing data for merge...")
        existing = load_existing_data(output_path)
    else:
        print("[3/5] Full mode, skipping existing data")

    # Step 4: Aggregate
    print(f"[4/5] Aggregating {len(rows):,} rows...")
    t0 = time.time()
    result = aggregate_to_json(rows, countries, existing_data=existing)
    print(f"  Aggregated in {time.time() - t0:.1f}s")

    # Step 5: Write JSON + upload
    print("[5/5] Writing output...")
    with open(output_path, "w") as f:
        json.dump(result, f, separators=(",", ":"))

    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"  Wrote {output_path} ({size_mb:.1f} MB, {len(result['pairs'])} pairs, {len(result['weeks'])} weeks)")

    upload_to_r2(output_path)

    total_elapsed = time.time() - pipeline_t0
    print(f"Done in {total_elapsed:.0f}s")


if __name__ == "__main__":
    main()
