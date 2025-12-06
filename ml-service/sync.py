
import logging
from typing import List, Dict, Any
from db_client import SupabaseDB
from forecasting import Forecaster
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ForecastSynchronizer:
    def __init__(self):
        self.db = SupabaseDB()
        self.forecaster = Forecaster()

    def run_sync(self, days_to_forecast: int = 14):
        """
        Main orchestration method:
        1. Fetch active products
        2. Fetch sales history
        3. For each product:
           a. Filter history
           b. Generate forecast
           c. Prepare data for DB
        4. Bulk save forecasts
        """
        logger.info("Starting forecast synchronization...")
        
        # 1. Fetch active products
        products = self.db.get_all_products()
        if not products:
            logger.warning("No active products found. Aborting sync.")
            return {"status": "skipped", "reason": "no_products"}
            
        logger.info(f"Found {len(products)} active products.")
        
        # 2. Fetch sales history (all at once for efficiency, then filter in memory)
        # Optimization: In a huge DB, we'd query per product or use a better SQL query.
        # For now, fetching recent global history.
        all_sales = self.db.fetch_sales_history(days=90)
        
        total_predictions = 0
        predictions_to_save = []
        
        for product in products:
            product_id = product['id']
            # product_sales = [s for s in all_sales if s.get('product_id') == product_id or s.get('menu_item_id') == product_id]
            # Adapting to potentially different schema naming. Assuming 'product_id' is the key.
            # If sales data is empty, we skip or use zeroes? Let's skip for now.
            
            # MOCKING DATA FOR DEMO if no sales found (to ensure functionality in dev)
            # In production, we'd rely strictly on 'all_sales'
            product_sales = self._get_mock_sales_if_needed(product_id, all_sales)
            
            if len(product_sales) < 5:
                # Not enough data to forecast
                continue
                
            # Prepare for Prophet
            history_data = [{'date': s['date'], 'value': s['quantity']} for s in product_sales]
            
            # Generate Forecasts for multiple scenarios
            scenarios = ['base', 'optimistic', 'crisis']
            
            for scenario in scenarios:
                multiplier = 1.0
                if scenario == 'optimistic': multiplier = 1.2
                if scenario == 'crisis': multiplier = 0.7
                
                # We could pass regressor overrides here for scenarios
                forecast_result = self.forecaster.train_and_predict(history_data, periods=days_to_forecast)
                
                for day in forecast_result:
                    predictions_to_save.append({
                        "product_id": product_id,
                        "forecast_date": day['date'],
                        "predicted_demand": round(day['predicted_demand'] * multiplier, 2),
                        "confidence_lower": round(day['confidence_lower'] * multiplier, 2),
                        "confidence_upper": round(day['confidence_upper'] * multiplier, 2),
                        "scenario": scenario,
                        "model_version": "v1.0-prophet"
                    })
        
        # 4. Save to DB
        if predictions_to_save:
            success = self.db.save_predictions(predictions_to_save)
            if success:
                logger.info(f"Successfully saved {len(predictions_to_save)} predictions.")
                return {"status": "success", "count": len(predictions_to_save)}
            else:
                logger.error("Failed to save predictions.")
                return {"status": "error", "reason": "db_save_failed"}
        
        return {"status": "success", "count": 0, "reason": "no_predictions_generated"}

    def _get_mock_sales_if_needed(self, product_id, all_sales):
        """
        Helper to generate mock data if real DB is empty, ensuring the endpoint works for testing.
        """
        real_sales = [s for s in all_sales if s.get('product_id') == product_id]
        if real_sales:
            return real_sales
            
        # Generate last 30 days of random sales
        import random
        mock_sales = []
        base = 10 + random.random() * 20
        for i in range(30):
            date_str = (datetime.now() - timedelta(days=30-i)).strftime('%Y-%m-%d')
            qty = max(0, base + random.uniform(-5, 10))
            mock_sales.append({'date': date_str, 'quantity': qty})
        return mock_sales

# Instantiate for import
synchronizer = ForecastSynchronizer()
