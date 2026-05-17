# TIPS-26 Offline-Scripts

## `train_aggregator.py` — XGBoost-Training + ONNX-Export

Trainiert das ML-Aggregator-Modell für **TIPS-26.4** (Phase 8) und exportiert es
als ONNX-Datei, die der Browser via `onnxruntime-web` direkt lädt.

### Installation (Python 3.10+)

```bash
pip install xgboost scikit-learn onnxmltools onnx skl2onnx onnxruntime numpy
```

### Lokales Training

```bash
# Aus dem frontend/-Ordner heraus
python scripts/train_aggregator.py
# → public/models/aggregator.onnx (~50–200 KB)
```

Nach dem Schreiben des Modells findet der Browser-Loader (`lib/algorithms/mlAggregator.ts`)
es automatisch beim nächsten Reload und schaltet die XGBoost-Inferenz frei.
Solange das Modell nicht existiert, fällt TIPS-26.4 transparent auf den
v4-Stacker (linear gewichtete v1+v2+v3-Stärken) zurück.

### Echte Trainingsdaten

Das aktuelle Skript verwendet **synthetische Trainings-Daten** als Pipeline-Demo.
Für eine produktive Variante:

1. Sammle ≥2 000 historische Internationals (z.B. via `football-data.co.uk`,
   `engsoccerdata`, oder eigene Match-DB)
2. Berechne pro Match die 30 Features (9 TIPS A + 9 TIPS B + 6 Player A + 6 Player B)
   zum jeweiligen **Pre-Match-Zeitpunkt** (nicht in-game, nicht post-game!)
3. Label = Outcome (0 = Heimsieg, 1 = Remis, 2 = Auswärtssieg) nach 90 Minuten
4. Ersetze `synthetic_training_data()` durch deinen Daten-Loader
5. Tuning via `optuna` oder `GridSearchCV` über `n_estimators`, `max_depth`,
   `learning_rate`, `min_child_weight`, `subsample`, `colsample_bytree`
6. Hold-out-Validation mit Brier/Log-Loss/RPS auf einem zeitlich
   ausgeschlossenen Set (z.B. nur EM/WM-Spiele 2024+ als Test)
