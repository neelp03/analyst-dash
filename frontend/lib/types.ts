export interface NumericStats {
  type: "numeric";
  count: number;
  missing: number;
  mean: number;
  std: number;
  min: number;
  q25: number;
  median: number;
  q75: number;
  max: number;
  skewness: number;
}

export interface CategoricalStats {
  type: "categorical";
  count: number;
  missing: number;
  unique: number;
  top_values: Record<string, number>;
}

export type ColumnStats = NumericStats | CategoricalStats;

export interface Distribution {
  counts: number[];
  bin_edges: number[];
}

export interface AnalysisResult {
  shape: { rows: number; columns: number };
  numeric_columns: string[];
  categorical_columns: string[];
  summary: Record<string, ColumnStats>;
  correlation: Record<string, Record<string, number>>;
  distributions: Record<string, Distribution>;
}

export interface AnomalyResult {
  total_rows: number;
  anomaly_count: number;
  anomaly_rate: number;
  column_details: Record<string, {
    outlier_count: number;
    mean: number;
    std: number;
    upper_threshold: number;
    lower_threshold: number;
  }>;
  anomaly_sample: Record<string, unknown>[];
}

export interface Insight {
  type: string;
  severity: "error" | "warning" | "info";
  message: string;
  columns: string[];
}

export interface AnalysisResponse {
  filename: string;
  analysis: AnalysisResult;
  anomalies: AnomalyResult;
  insights: Insight[];
}
