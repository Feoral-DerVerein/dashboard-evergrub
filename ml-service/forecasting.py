import pandas as pd
import numpy as np
import logging
from datetime import timedelta

logger = logging.getLogger(__name__)

# Nixtla Imports
try:
    from statsforecast import StatsForecast
    from statsforecast.models import AutoARIMA, SeasonalNaive
    NIXTLA_AVAILABLE = True
except ImportError:
    NIXTLA_AVAILABLE = False
    logger.warning("StatsForecast not available. Using Lightweight Heuristic Forecaster.")

class Forecaster:
    def __init__(self):
        self.model = None

    def train_and_predict(self, history, periods=7, regressors=None):
        """
        Trains a model (StatsForecast or Heuristic) and returns predictions.
        """
        if not history:
            return []

        # Prepare Data
        df = pd.DataFrame(history)
        df['ds'] = pd.to_datetime(df['date'])
        df['y'] = df['value']
        df['unique_id'] = 'series1' 
        
        future_x_df = None
        
        # Handle Regressors (Simplified for demo)
        if regressors:
            reg_df = pd.DataFrame(regressors)
            reg_df['ds'] = pd.to_datetime(reg_df['date'])
            # We would merge here, but for simplicity/robustness in demo we skip advanced regressor merging
            # unless we are sure about data alignment.
            # But let's try basic future regressor setup if possible.
            last_date = df['ds'].max()
            future_dates = [last_date + timedelta(days=i+1) for i in range(periods)]
            future_x_df = reg_df[reg_df['ds'].isin(future_dates)].copy()
            future_x_df['unique_id'] = 'series1'
            if future_x_df.empty or len(future_x_df) < periods:
                future_x_df = None

        # --- NIXTLA LOGIC ---
        if NIXTLA_AVAILABLE:
            try:
                # logger.info("Using Nixtla StatsForecast (AutoARIMA)")
                models = [AutoARIMA(season_length=7)]
                sf = StatsForecast(models=models, freq='D', n_jobs=1)
                sf.fit(df)
                
                if future_x_df is not None:
                    # Filter only known columns
                    available_cols = [c for c in future_x_df.columns if c not in ['ds', 'unique_id', 'date']]
                    if available_cols:
                        forecast_df = sf.predict(h=periods, X_df=future_x_df)
                    else:
                        forecast_df = sf.predict(h=periods)
                else:
                    forecast_df = sf.predict(h=periods)
                
                result = []
                for _, row in forecast_df.iterrows():
                    pred = max(0, row['AutoARIMA'])
                    result.append({
                        'date': row['ds'].strftime('%Y-%m-%d'),
                        'predicted_demand': pred,
                        'confidence_lower': pred * 0.9,
                        'confidence_upper': pred * 1.1
                    })
                return result
            except Exception as e:
                logger.error(f"Nixtla failed: {e}. Falling back.")

        # --- HEURISTIC FALLBACK ---
        # logger.info("Using Heuristic")
        last_value = df['y'].iloc[-1] if not df.empty else 0
        avg_value = df['y'].mean() if not df.empty else 0
        last_date = df['ds'].iloc[-1] if not df.empty else pd.to_datetime('today')
        
        forecast = []
        for i in range(periods):
            date = last_date + timedelta(days=i+1)
            # Simple logic: mean + small trend towards last value
            base = (avg_value * 0.7) + (last_value * 0.3)
            if date.weekday() >= 5: base *= 1.1 # Weekend
            
            forecast.append({
                'date': date.strftime('%Y-%m-%d'),
                'predicted_demand': round(base, 2),
                'confidence_lower': round(base*0.8, 2),
                'confidence_upper': round(base*1.2, 2)
            })
        return forecast

    # Keep the risk calculation methods as they are pure math
    def calculate_expiration_risk(self, stock, days_to_expiry, avg_daily_sales):
        if avg_daily_sales <= 0: avg_daily_sales = 0.1
        days_inv = stock / avg_daily_sales
        if days_to_expiry <= 0: return 1.0
        if days_inv > days_to_expiry: return min(1.0, (days_inv - days_to_expiry)/days_inv + 0.5)
        if days_to_expiry < 3: return 0.7
        return 0.1

    def calculate_waste_risk(self, risk_score, product_cost):
        return min(1.0, risk_score * min(2.0, 1 + product_cost/100))
