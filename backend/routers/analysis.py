import io

import pandas as pd
from fastapi import APIRouter, File, HTTPException, UploadFile

from services.analyzer import analyze
from services.anomaly import detect
from services.insights import generate as gen_insights

router = APIRouter()


@router.post("/analyze")
async def analyze_csv(file: UploadFile = File(...)):
    if not (file.filename or "").lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are accepted")

    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV: {exc}")

    if df.empty:
        raise HTTPException(status_code=400, detail="The CSV file is empty")

    analysis_result = analyze(df)
    anomaly_result = detect(df)

    return {
        "filename": file.filename,
        "analysis": analysis_result,
        "anomalies": anomaly_result,
        "insights": gen_insights(analysis_result, anomaly_result),
    }
