"""BigQuery queries for GDELT event data."""

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

    rows = []
    for row in query_job:
        rows.append(dict(row))

    print(f"Query returned {len(rows):,} rows")
    return rows
