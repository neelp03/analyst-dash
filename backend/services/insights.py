from typing import Any


def generate(analysis: dict[str, Any], anomalies: dict[str, Any]) -> list[dict[str, Any]]:
    insights: list[dict[str, Any]] = []
    summary = analysis["summary"]
    rows = analysis["shape"]["rows"]

    # High pairwise correlation
    seen: set[tuple[str, str]] = set()
    for col1, row in analysis.get("correlation", {}).items():
        for col2, val in row.items():
            pair = (min(col1, col2), max(col1, col2))
            if col1 != col2 and pair not in seen and abs(val) >= 0.7:
                seen.add(pair)
                direction = "positively" if val > 0 else "negatively"
                insights.append({
                    "type": "high_correlation",
                    "severity": "warning",
                    "message": (
                        f'"{col1}" and "{col2}" are strongly {direction} correlated '
                        f"(r = {val:.2f}). Consider dropping one for ML tasks."
                    ),
                    "columns": [col1, col2],
                })

    # Heavily skewed distributions
    for col, stats in summary.items():
        if stats["type"] == "numeric":
            skew = stats.get("skewness", 0)
            if abs(skew) >= 1.5:
                direction = "right" if skew > 0 else "left"
                insights.append({
                    "type": "high_skewness",
                    "severity": "info",
                    "message": (
                        f'"{col}" is heavily {direction}-skewed (skewness = {skew:.2f}). '
                        "A log or Box-Cox transform may improve model performance."
                    ),
                    "columns": [col],
                })

    # Significant missing values
    for col, stats in summary.items():
        rate = stats["missing"] / rows if rows else 0.0
        if rate > 0.05:
            insights.append({
                "type": "missing_values",
                "severity": "warning",
                "message": (
                    f'"{col}" has {stats["missing"]} missing values ({rate:.1%}). '
                    "Imputation or removal is recommended before modelling."
                ),
                "columns": [col],
            })

    # Likely ID columns (cardinality == row count)
    for col, stats in summary.items():
        if stats["type"] == "categorical" and stats["unique"] == rows and rows > 1:
            insights.append({
                "type": "possible_id_column",
                "severity": "info",
                "message": (
                    f'"{col}" has all unique values — it is likely an identifier '
                    "and can probably be dropped before training."
                ),
                "columns": [col],
            })

    # High anomaly rate
    if anomalies.get("anomaly_rate", 0) > 0.05:
        rate = anomalies["anomaly_rate"]
        insights.append({
            "type": "high_anomaly_rate",
            "severity": "error",
            "message": (
                f"{rate:.1%} of rows contain outliers (|Z| > 3). "
                "Review upstream data collection and preprocessing pipelines."
            ),
            "columns": [],
        })

    return insights
