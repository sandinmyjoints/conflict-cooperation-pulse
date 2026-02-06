# Conflict/Cooperation Pulse

Global bilateral relationship trends visualized from GDELT event data.

## Architecture

```
GitHub Actions (daily cron)
  → Python script queries BigQuery (GDELT partitioned table)
  → Aggregates into ~1.5MB JSON (100 country pairs × 260 weeks)
  → Uploads to Cloudflare R2 bucket

Cloudflare Pages
  → Hosts React + D3 frontend
  → Frontend fetches JSON at load time, filters in-memory
```

## Development

### Pipeline

```bash
uv venv .venv --python 3.12
uv pip install -r pipeline/requirements.txt
uv pip install pytest

# Run tests
.venv/bin/python -m pytest pipeline/tests/ -v

# Run pipeline (requires GCP credentials)
PIPELINE_MODE=full .venv/bin/python -m pipeline.main
```

### Frontend

```bash
cd frontend
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # production build to dist/
```

Sample data is included at `frontend/public/pulse_data.json` for local development.

## Project Structure

```
thnk/
├── .github/workflows/update-data.yml   # Daily data pipeline
├── pipeline/                            # Python data pipeline
│   ├── config.py                        # Configuration
│   ├── query.py                         # BigQuery queries
│   ├── aggregate.py                     # Aggregation logic
│   ├── upload.py                        # R2 upload
│   ├── main.py                          # Entry point
│   ├── cameo_countries.json             # Country code mapping
│   └── tests/
├── frontend/                            # React + D3 frontend
│   ├── src/
│   │   ├── components/                  # UI components
│   │   ├── hooks/                       # Data loading hooks
│   │   └── utils/                       # Color scales, formatters
│   └── public/pulse_data.json           # Sample data
└── data/                                # Pipeline output (gitignored)
```

## Configuration

Config lives in two places:

### Pipeline — `pipeline/config.py`

All values are read from environment variables with sensible defaults.

| Variable | Default | Description |
|----------|---------|-------------|
| `PIPELINE_MODE` | `incremental` | `full` for 5-year backfill, `incremental` for last 7 days |
| `BQ_PROJECT` | `gdelt-bq` | BigQuery project containing GDELT data |
| `OUTPUT_DIR` | `../data` (relative to pipeline/) | Where to write `pulse_data.json` |
| `R2_ENDPOINT` | _(empty — skips upload)_ | Cloudflare R2 S3-compatible endpoint URL |
| `R2_BUCKET` | `pulse-data` | R2 bucket name |
| `R2_ACCESS_KEY` | _(empty)_ | R2 API access key ID |
| `R2_SECRET_KEY` | _(empty)_ | R2 API secret access key |

Hardcoded constants (edit in `config.py` directly):

| Constant | Value | Description |
|----------|-------|-------------|
| `TOP_PAIRS` | `100` | Number of country pairs to keep (ranked by event volume) |
| `WEEKS_HISTORY` | `260` | Weeks of history (~5 years) |
| `RECENT_WEEKS` | `12` | Window for computing recent average Goldstein and trend |
| `INCREMENTAL_DAYS` | `7` | Days to query in incremental mode |
| `OUTPUT_FILE` | `pulse_data.json` | Output filename |

### Frontend — `frontend/src/config.ts`

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_DATA_URL` | `/pulse_data.json` | URL to fetch data from. Set as a Vite env var (e.g. in `.env`) to point at R2 |

Hardcoded constants (edit in `config.ts` directly):

| Constant | Value | Description |
|----------|-------|-------------|
| `STALE_THRESHOLD_MS` | `172800000` (48h) | Show stale-data warning after this many ms since `generated_at` |
| `SPARKLINE_WIDTH` | `150` | Sparkline SVG width in px |
| `SPARKLINE_HEIGHT` | `30` | Sparkline SVG height in px |
| `SPARKLINE_WEEKS` | `52` | Number of trailing weeks shown in sparklines |
| `GOLDSTEIN_MIN` / `MAX` | `-10` / `10` | Goldstein scale range for color mapping |

### GitHub Actions — `.github/workflows/update-data.yml`

These must be set as GitHub repository secrets:

| Secret | Description |
|--------|-------------|
| `GCP_SA_KEY` | GCP service account JSON key (needs `bigquery.jobUser` + `bigquery.dataViewer` roles) |
| `R2_ENDPOINT` | Cloudflare R2 S3-compatible endpoint URL |
| `R2_BUCKET` | R2 bucket name |
| `R2_ACCESS_KEY` | R2 API access key ID |
| `R2_SECRET_KEY` | R2 API secret access key |

## Deployment

1. **GCP**: Service account with `bigquery.jobUser` + `bigquery.dataViewer` roles
2. **Cloudflare**: R2 bucket for data, Pages for frontend
3. **GitHub Secrets**: See the table above
