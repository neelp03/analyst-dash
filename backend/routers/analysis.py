import io

import pandas as pd
from fastapi import APIRouter, File, HTTPException, UploadFile

from services.analyzer import analyze
from services.anomaly import detect

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

    return {
        "filename": file.filename,
        "analysis": analyze(df),
        "anomalies": detect(df),
    }
