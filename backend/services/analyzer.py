from typing import Any

import numpy as np
import pandas as pd


def analyze(df: pd.DataFrame) -> dict[str, Any]:
    numeric = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical = df.select_dtypes(exclude=[np.number]).columns.tolist()

    summary: dict[str, Any] = {}
    for col in numeric:
        s = df[col]
        summary[col] = {
            "type": "numeric",
            "count": int(s.count()),
            "missing": int(s.isna().sum()),
            "mean": _f(s.mean()),
            "std": _f(s.std()),
            "min": _f(s.min()),
            "q25": _f(s.quantile(0.25)),
            "median": _f(s.median()),
            "q75": _f(s.quantile(0.75)),
            "max": _f(s.max()),
            "skewness": _f(s.skew()),
        }
    for col in categorical:
        counts = df[col].value_counts().head(10)
        summary[col] = {
            "type": "categorical",
            "count": int(df[col].count()),
            "missing": int(df[col].isna().sum()),
            "unique": int(df[col].nunique()),
            "top_values": {str(k): int(v) for k, v in counts.items()},
        }

    correlation: dict[str, dict[str, float]] = {}
    if len(numeric) >= 2:
        cm = df[numeric].corr()
        for col in numeric:
            correlation[col] = {c: round(float(v), 4) for c, v in cm[col].items()}

    distributions: dict[str, Any] = {}
    for col in numeric[:8]:
        data = df[col].dropna().to_numpy()
        hist, edges = np.histogram(data, bins=20)
        distributions[col] = {
            "counts": hist.tolist(),
            "bin_edges": [round(float(e), 4) for e in edges.tolist()],
        }

    return {
        "shape": {"rows": len(df), "columns": len(df.columns)},
        "numeric_columns": numeric,
        "categorical_columns": categorical,
        "summary": summary,
        "correlation": correlation,
        "distributions": distributions,
    }


def _f(v) -> float:
    return round(float(v), 4) if v is not None and not (isinstance(v, float) and np.isnan(v)) else 0.0
