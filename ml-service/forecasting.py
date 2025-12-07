import pandas as pd
import numpy as np
import logging
from datetime import timedelta

logger = logging.getLogger(__name__)

try:
    from prophet import Prophet
    PROPHET_AVAILABLE = True
except ImportError:
    PROPHET_AVAILABLE = False
    logger.warning("Prophet not available. Using Lightweight Heuristic Forecaster.")

class Forecaster:
    def __init__(self):
        self.model = None

    def train_and_predict(self, history_data, periods=30, regressors=None):
        """
        Trains a Prophet model on historical data and predicts future demand.
        
        Args:
            history_data (list of dict): List of {'date': 'YYYY-MM-DD', 'value': float}
            periods (int): Number of days to forecast
            regressors (list of dict, optional): List of {'date': 'YYYY-MM-DD', 'name': str, 'value': float}
            
        Returns:
            list of dict: Forecasted values [{'date': 'YYYY-MM-DD', 'predicted_demand': float, ...}]
        """
        if not history_data or len(history_data) < 5:
            logger.warning("Not enough data to train model. Returning simple average.")
            return self._simple_average_forecast(history_data, periods)

        try:
            df = pd.DataFrame(history_data)
            df = df.rename(columns={'date': 'ds', 'value': 'y'})
            df['ds'] = pd.to_datetime(df['ds'])
            
            # Initialize Prophet model
            m = Prophet(daily_seasonality=True, yearly_seasonality=False, weekly_seasonality=True)
            
            # Add regressors if provided
            regressor_df = None
            if regressors:
                reg_data = []
                for r in regressors:
                    reg_data.append({'ds': r['date'], r['name']: r['value']})
                
                regressor_df = pd.DataFrame(reg_data)
                regressor_df['ds'] = pd.to_datetime(regressor_df['ds'])
                
                # Pivot to have columns for each regressor
                # This assumes we might have multiple rows per date if multiple regressors
                # Better approach: organize input as list of dicts where keys are regressor names
                # But let's stick to the simple structure and pivot
                
                # Group by date and merge
                # Simplified: Assuming input regressors are already structured or we process them
                # Let's assume regressors is a list of dicts: [{'date': '...', 'inflation': 0.05, 'temp': 25}, ...]
                
                # Re-processing based on assumption: regressors is a list of dicts with 'date' and other keys
                regressor_df = pd.DataFrame(regressors)
                regressor_df['ds'] = pd.to_datetime(regressor_df['date'])
                
                # Add each column that is not date/ds as a regressor
                for col in regressor_df.columns:
                    if col not in ['ds', 'date']:
                        m.add_regressor(col)
                        
                # Merge regressors into main df
                df = pd.merge(df, regressor_df, on='ds', how='left')
                
                # Fill missing values if any (Prophet doesn't like NaNs in regressors)
                df = df.ffill().fillna(0)

            m.fit(df)
            
            # Create future dataframe
            future = m.make_future_dataframe(periods=periods)
            
            # If we have regressors, we need to add them to the future dataframe too
            if regressors and regressor_df is not None:
                # We need future values for regressors. 
                # In a real app, we'd fetch weather forecasts etc.
                # Here we'll assume the 'regressors' input INCLUDES future dates
                
                future = pd.merge(future, regressor_df, on='ds', how='left')
                
                # Fill missing future regressor values (e.g. with last known value)
                future = future.ffill().fillna(0)

            # Predict
            forecast = m.predict(future)
            
            # Filter only future dates
            last_date = df['ds'].max()
            future_forecast = forecast[forecast['ds'] > last_date].copy()
            
            # Format result
            result = []
            for _, row in future_forecast.iterrows():
                result.append({
                    'date': row['ds'].strftime('%Y-%m-%d'),
                    'predicted_demand': max(0, round(row['yhat'], 2)), # No negative demand
                    'confidence_lower': max(0, round(row['yhat_lower'], 2)),
                    'confidence_upper': max(0, round(row['yhat_upper'], 2))
                })
                
            return result
            
        except Exception as e:
            logger.error(f"Error in Prophet forecasting: {e}")
            import traceback
            traceback.print_exc()
            return self._simple_average_forecast(history_data, periods)

    def _simple_average_forecast(self, history_data, periods):
        """Fallback method using simple moving average"""
        if not history_data:
            return []
            
        values = [d['value'] for d in history_data]
        avg = sum(values) / len(values)
        
        import datetime
        start_date = datetime.date.today()
        
        result = []
        for i in range(periods):
            date = start_date + datetime.timedelta(days=i+1)
            result.append({
                'date': date.strftime('%Y-%m-%d'),
                'predicted_demand': round(avg, 2),
                'confidence_lower': round(avg * 0.8, 2),
                'confidence_upper': round(avg * 1.2, 2)
            })
            
        return result

    def calculate_risk_scores(self, product_data):
        """
        Calculates expiration and waste risk scores.
        
        Args:
            product_data (dict): {
                'stock': float,
                'avg_daily_sales': float,
                'days_to_expiry': int
            }
        """
        stock = product_data.get('stock', 0)
        avg_sales = product_data.get('avg_daily_sales', 1) # Avoid div by zero
        days_to_expiry = product_data.get('days_to_expiry', 365)
        
        if avg_sales <= 0: avg_sales = 0.1
        
        days_of_inventory = stock / avg_sales
        
        # Expiration Risk: Probability that stock > 0 when expiry date hits
        # Simple heuristic: if we have more days of stock than days to expiry, risk is high
        
        if days_to_expiry <= 0:
            expiration_risk = 1.0
        elif days_of_inventory > days_to_expiry:
            # We have more stock than we can sell in time
            expiration_risk = min(1.0, (days_of_inventory - days_to_expiry) / days_of_inventory + 0.5)
        elif days_to_expiry < 3:
            expiration_risk = 0.7 # Close to expiry
        else:
            expiration_risk = 0.1 # Safe
            
        # Waste Risk: Combined score of value at risk
        # Could incorporate cost/price here if available
        waste_risk = expiration_risk # For now, closely tied to expiration
        
        return {
            'expiration_risk_score': round(expiration_risk, 2),
            'waste_risk_score': round(waste_risk, 2),
            'days_of_inventory': round(days_of_inventory, 1)
        }
    
    def calculate_expiration_risk(self, stock: float, days_to_expiry: int, avg_daily_sales: float) -> float:
        """
        Calculate expiration risk score (0-1) based on stock levels and expiry date
        
        Args:
            stock: Current stock quantity
            days_to_expiry: Days until product expires
            avg_daily_sales: Average daily sales rate
            
        Returns:
            float: Risk score between 0 and 1
        """
        if avg_daily_sales <= 0:
            avg_daily_sales = 0.1  # Avoid division by zero
        
        days_of_inventory = stock / avg_daily_sales
        
        if days_to_expiry <= 0:
            return 1.0  # Already expired
        elif days_of_inventory > days_to_expiry:
            # We have more stock than we can sell in time
            return min(1.0, (days_of_inventory - days_to_expiry) / days_of_inventory + 0.5)
        elif days_to_expiry < 3:
            return 0.7  # Close to expiry
        else:
            return 0.1  # Safe
    
    def calculate_waste_risk(self, risk_score: float, product_cost: float) -> float:
        """
        Calculate waste risk considering the value at risk
        
        Args:
            risk_score: Expiration risk score
            product_cost: Cost per unit of product
            
        Returns:
            float: Waste risk score weighted by cost
        """
        # Weight risk by cost (higher cost items get higher waste risk scores)
        cost_multiplier = min(2.0, 1 + (product_cost / 100))  # Cap at 2x
        waste_risk = risk_score * cost_multiplier
        
        return min(1.0, round(waste_risk, 2))  # Cap at 1.0
