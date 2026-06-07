from typing import Any

import numpy as np
import pandas as pd


def detect(df: pd.DataFrame, threshold: float = 3.0) -> dict[str, Any]:
    numeric = df.select_dtypes(include=[np.number]).columns.tolist()
    if not numeric:
        return {"total_rows": len(df), "anomaly_count": 0, "anomaly_rate": 0.0,
                "column_details": {}, "anomaly_sample": []}

    anomaly_mask = pd.Series(False, index=df.index)
    col_details: dict[str, Any] = {}

    for col in numeric:
        s = df[col].dropna()
        mean, std = float(s.mean()), float(s.std())
        if std == 0:
            continue
        z = ((df[col] - mean) / std).abs()
        is_outlier = z > threshold
        anomaly_mask |= is_outlier.fillna(False)
        col_details[col] = {
            "outlier_count": int(is_outlier.sum()),
            "mean": round(mean, 4),
            "std": round(std, 4),
            "upper_threshold": round(mean + threshold * std, 4),
            "lower_threshold": round(mean - threshold * std, 4),
        }

    anomaly_df = df[anomaly_mask]
    count = int(anomaly_mask.sum())

    return {
        "total_rows": len(df),
        "anomaly_count": count,
        "anomaly_rate": round(count / len(df), 4) if len(df) else 0.0,
        "column_details": col_details,
        "anomaly_sample": _safe_records(anomaly_df.head(50)),
    }


def _safe_records(df: pd.DataFrame) -> list[dict]:
    records = []
    for row in df.to_dict(orient="records"):
        records.append({k: (None if isinstance(v, float) and np.isnan(v) else v)
                        for k, v in row.items()})
    return records
