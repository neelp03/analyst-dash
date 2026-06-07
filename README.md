# analyst-dash

A full-stack data exploration and anomaly detection dashboard. Upload any CSV and instantly get summary statistics, distribution histograms, a correlation heatmap, and Z-score–based outlier detection — no configuration needed.

## Features

- **Automatic EDA** — count, mean, std, min/max, quartiles, and skewness for every numeric column; unique-value counts and top values for categoricals
- **Distribution histograms** — 20-bin histograms for up to 8 numeric columns, rendered with Recharts
- **Correlation heatmap** — full pairwise Pearson correlation matrix rendered as a color-coded CSS grid (no extra library)
- **Anomaly detection** — Z-score threshold (|Z| > 3) across all numeric columns; reports per-column outlier counts and surfaces a sample of anomalous rows
- **Missing value tracking** — missing counts surfaced per column in the summary table

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts |
| Backend | Python 3.12, FastAPI, pandas, NumPy |
| Container | Docker Compose |

## Quick Start

### Local

```bash
# Backend (from analyst-dash/backend/)
pip install -r requirements.txt
uvicorn main:app --port 8001 --reload

# Frontend (from analyst-dash/frontend/)
npm install
npm run dev
# → http://localhost:3000
```

### Docker

```bash
docker-compose up
```

## Usage

1. Open `http://localhost:3000`
2. Drop or click to upload a `.csv` file
3. Results appear in four tabs:
   - **Summary Stats** — per-column type, count, missing, mean/std/min/median/max
   - **Distributions** — histogram per numeric column
   - **Correlation** — heatmap; blue = positive, red = negative
   - **Anomalies** — outlier count, rate, per-column detail, and a sample row table

## API Reference

### `POST /analyze`

Accepts a multipart CSV upload. Returns the full analysis in a single response.

```bash
curl -X POST http://localhost:8001/analyze \
  -F "file=@your_data.csv"
```

**Response shape:**

```json
{
  "filename": "your_data.csv",
  "analysis": {
    "shape": { "rows": 1000, "columns": 8 },
    "numeric_columns": ["age", "salary", "score"],
    "categorical_columns": ["department", "status"],
    "summary": {
      "age": { "type": "numeric", "mean": 34.2, "std": 8.1, "min": 18, "max": 65, ... }
    },
    "correlation": { "age": { "salary": 0.42, "score": -0.11 } },
    "distributions": { "age": { "counts": [...], "bin_edges": [...] } }
  },
  "anomalies": {
    "total_rows": 1000,
    "anomaly_count": 12,
    "anomaly_rate": 0.012,
    "column_details": {
      "salary": { "outlier_count": 8, "mean": 72000, "std": 15000, "upper_threshold": 117000, "lower_threshold": 27000 }
    },
    "anomaly_sample": [...]
  }
}
```

## Project Structure

```
backend/
├── main.py                  # FastAPI app + CORS
├── routers/analysis.py      # POST /analyze endpoint
├── services/
│   ├── analyzer.py          # pandas EDA: summary stats, correlations, distributions
│   └── anomaly.py           # Z-score anomaly detection
└── requirements.txt

frontend/
├── app/
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page (upload + tabbed results)
├── components/
│   ├── FileUpload.tsx        # Drag-and-drop CSV input
│   ├── OverviewCards.tsx     # Top-level stat cards
│   ├── StatsTable.tsx        # Per-column summary table
│   ├── DistributionCharts.tsx# Recharts histograms (SSR-disabled)
│   ├── CorrelationHeatmap.tsx# CSS-grid heatmap
│   └── AnomalySection.tsx   # Outlier stats + sample table
└── lib/
    ├── api.ts               # Typed fetch wrapper
    └── types.ts             # Shared TypeScript interfaces
```
