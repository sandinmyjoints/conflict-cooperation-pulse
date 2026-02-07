"""BigQuery queries for GDELT event data."""

import time

from google.cloud import bigquery

from . import config


QUERY_TEMPLATE = """
SELECT
    SQLDATE,
    Actor1CountryCode,
    Actor2CountryCode,
    GoldsteinScale,
    QuadClass,
    NumMentions,
    AvgTone
FROM `{table}`
WHERE
    _PARTITIONTIME >= TIMESTAMP('{start_date}')
    AND Actor1CountryCode IS NOT NULL
    AND Actor2CountryCode IS NOT NULL
    AND Actor1CountryCode != ''
    AND Actor2CountryCode != ''
    AND Actor1CountryCode != Actor2CountryCode
"""


def build_query(mode: str = "incremental") -> str:
    """Build the BigQuery SQL query based on pipeline mode."""
    if mode == "full":
        start_date = config.backfill_start_date()
    else:
        start_date = config.incremental_start_date()

    return QUERY_TEMPLATE.format(
        table=config.BQ_TABLE,
        start_date=start_date,
    )


def run_query(client: bigquery.Client, mode: str = "incremental", dry_run: bool = False) -> list[dict]:
    """Execute BigQuery query and return rows as list of dicts."""
    sql = build_query(mode)

    job_config = bigquery.QueryJobConfig(dry_run=dry_run, use_query_cache=True)
    query_job = client.query(sql, job_config=job_config)

    if dry_run:
        mb = query_job.total_bytes_processed / (1024 * 1024)
        print(f"Dry run: query would process {mb:.1f} MB")
        return []

    # Wait for query to finish, showing progress
    print("Running query...", end="", flush=True)
    t0 = time.time()
    while not query_job.done():
        time.sleep(2)
        elapsed = time.time() - t0
        print(f"\rRunning query... {elapsed:.0f}s", end="", flush=True)
    elapsed = time.time() - t0
    print(f"\rQuery finished in {elapsed:.0f}s" + " " * 20)

    total = query_job.result().total_rows
    print(f"Fetching {total:,} rows...")

    rows = []
    t0 = time.time()
    for row in query_job:
        rows.append(dict(row))
        if len(rows) % 500_000 == 0:
            elapsed = time.time() - t0
            pct = len(rows) / total * 100 if total else 0
            print(f"  {len(rows):>12,} / {total:,} rows ({pct:.0f}%) [{elapsed:.0f}s]", flush=True)

    elapsed = time.time() - t0
    print(f"Fetched {len(rows):,} rows in {elapsed:.0f}s")
    return rows
