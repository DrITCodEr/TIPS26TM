"""
TIPS-26.4 ML-Aggregator — XGBoost-Training + ONNX-Export.

Status: Pipeline-Demo. Trainiert ein XGBoost-Klassifikationsmodell auf
synthetischen Trainings-Daten und exportiert das Ergebnis als ONNX-Modell
unter ../public/models/aggregator.onnx. Sobald die Datei dort liegt,
lädt der Browser-Aggregator (lib/algorithms/mlAggregator.ts) sie und
nutzt sie für Inferenz statt des v4-Stacker-Fallbacks.

ECHTE Trainings-Daten:
- football-data.co.uk (Internationals 2010-2025)
- engsoccerdata (R-Paket)
- transfermarkt-Snapshots zum Pre-Turnier-Zeitpunkt

Für eine produktive Variante:
1. Sammle 2000+ historische Internationals mit Pre-Match-Features
2. Featuretabelle: 9 TIPS-Faktoren A & B + 6 Player-Aggregates A & B (30 Features)
3. Target: Outcome (Win/Draw/Loss als 0/1/2)
4. Cross-Validation mit StratifiedKFold (5-fold)
5. Hyperparameter-Tuning via Optuna oder GridSearchCV
6. Brier/Log-Loss/RPS auf Hold-Out-Set
7. ONNX-Export wie unten

Lokale Ausführung:
    pip install xgboost scikit-learn onnxmltools onnxruntime numpy
    python scripts/train_aggregator.py
    # Output: public/models/aggregator.onnx
"""
from __future__ import annotations

import os
from pathlib import Path

import numpy as np
from sklearn.model_selection import StratifiedKFold

try:
    import xgboost as xgb
except ImportError as e:
    raise SystemExit(
        "xgboost ist nicht installiert.\n"
        "Bitte: pip install xgboost scikit-learn onnxmltools onnxruntime"
    ) from e

try:
    from onnxmltools.convert.xgboost.convert import convert
    from skl2onnx.common.data_types import FloatTensorType
except ImportError as e:
    raise SystemExit(
        "ONNX-Export-Tools fehlen.\n"
        "Bitte: pip install onnxmltools onnx skl2onnx"
    ) from e


# ----------------------------------------------------------------------------
# Trainings-Daten (synthetisch — durch echte Daten ersetzen)
# ----------------------------------------------------------------------------
def synthetic_training_data(n_matches: int = 2000, seed: int = 42):
    """
    Erzeugt synthetische Trainings-Daten zur Pipeline-Validierung.

    Features pro Match (30 Werte): 9 TIPS-Faktoren Team A + 9 für Team B +
    6 Player-Aggregates jeweils. Werte zwischen 0 und 1 (normalisiert).

    Outcome wird aus einem fixed Modell (lineare Kombination + Noise)
    erzeugt — d.h. das gelernte Modell sollte das Ground-Truth-Modell
    rekonstruieren können. Bei echten Daten ist das so nicht garantiert.
    """
    rng = np.random.default_rng(seed)
    X = rng.uniform(0, 1, size=(n_matches, 30)).astype(np.float32)

    # Ground-Truth: Stärke = sum of features with chosen weights
    weights_a = np.array(
        [
            # TIPS-9 für A
            0.30, 0.10, 0.15, 0.15, 0.07, 0.05, 0.04, 0.09, 0.05,
            # Player-6 für A
            0.30, 0.15, 0.15, 0.20, -0.15, 0.05,
        ]
    )
    weights_b = -weights_a  # symmetrisch
    weights = np.concatenate([weights_a, weights_b])
    score = X @ weights + rng.normal(0, 0.5, n_matches)

    # Drei-Klassen aus dem Score: niedrig=2 (B-Sieg), mitte=1 (X), hoch=0 (A-Sieg)
    y = np.full(n_matches, 1, dtype=np.int64)
    y[score > 0.3] = 0
    y[score < -0.3] = 2

    return X, y


# ----------------------------------------------------------------------------
# Training
# ----------------------------------------------------------------------------
def train_model(X: np.ndarray, y: np.ndarray, seed: int = 42):
    """5-fold CV, dann Final-Training auf allen Daten."""
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=seed)
    losses = []
    for fold, (tr, va) in enumerate(skf.split(X, y)):
        model = xgb.XGBClassifier(
            n_estimators=200,
            max_depth=4,
            learning_rate=0.05,
            objective="multi:softprob",
            eval_metric="mlogloss",
            random_state=seed,
            n_jobs=-1,
        )
        model.fit(X[tr], y[tr], eval_set=[(X[va], y[va])], verbose=False)
        proba = model.predict_proba(X[va])
        # Multi-Class-LogLoss
        eps = 1e-15
        ll = -np.mean(np.log(np.clip(proba[np.arange(len(va)), y[va]], eps, 1)))
        losses.append(ll)
        print(f"  Fold {fold + 1}: log-loss = {ll:.4f}")

    print(f"  Mean CV log-loss: {np.mean(losses):.4f} ± {np.std(losses):.4f}")

    # Final-Training auf allen Daten
    final = xgb.XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.05,
        objective="multi:softprob",
        eval_metric="mlogloss",
        random_state=seed,
        n_jobs=-1,
    )
    final.fit(X, y, verbose=False)
    return final


# ----------------------------------------------------------------------------
# ONNX-Export
# ----------------------------------------------------------------------------
def export_onnx(model, output_path: Path, n_features: int = 30):
    initial_type = [("features", FloatTensorType([None, n_features]))]
    onnx_model = convert(
        model,
        initial_types=initial_type,
        target_opset=15,
        name="tips26_aggregator",
    )
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "wb") as f:
        f.write(onnx_model.SerializeToString())
    print(f"  Modell gespeichert: {output_path} ({output_path.stat().st_size / 1024:.1f} KB)")


# ----------------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------------
def main():
    here = Path(__file__).resolve().parent
    output = here.parent / "public" / "models" / "aggregator.onnx"

    print("→ Erzeuge Trainings-Daten ...")
    X, y = synthetic_training_data(n_matches=2000, seed=42)
    print(f"  Klassenverteilung: 0={np.sum(y == 0)}, 1={np.sum(y == 1)}, 2={np.sum(y == 2)}")

    print("→ Training XGBoost (5-fold CV) ...")
    model = train_model(X, y)

    print("→ ONNX-Export ...")
    export_onnx(model, output)

    print("→ Fertig.")
    print(
        f"\nDer Browser-Aggregator unter lib/algorithms/mlAggregator.ts lädt jetzt\n"
        f"das Modell von /models/aggregator.onnx beim ersten Aufruf von\n"
        f"loadAggregatorModel(). Aktualisiere die UI um den Status anzuzeigen."
    )


if __name__ == "__main__":
    main()
