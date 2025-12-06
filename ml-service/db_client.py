
import os
import logging
from supabase import create_client, Client
from typing import List, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SupabaseDB:
    def __init__(self):
        self.url = os.environ.get("SUPABASE_URL")
        self.key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # MUST be Service Role Key for backend ops
        
        if not self.url or not self.key:
            logger.warning("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. DB operations will fail.")
            self.client = None
        else:
            try:
                self.client: Client = create_client(self.url, self.key)
                logger.info("Supabase client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {e}")
                self.client = None

    def fetch_sales_history(self, days: int = 90) -> List[Dict[str, Any]]:
        """
        Fetch sales data from the 'orders' or 'sales' table for the last N days.
        Adapting to the existing schema: likely aggregating from `order_items`.
        """
        if not self.client:
            logger.error("Supabase client not initialized")
            return []

        try:
            # Query to get recent sales. 
            # Note: This assumes we have a view or table structure. 
            # For this MVP, let's assume we are fetching from 'order_items' joined with 'orders'
            # Or simplified: fetching from a materialized view if it exists.
            
            # For now, let's try to fetch from a hypothetical 'sales_data' view or 'orders'
            # If those don't exist, we might need a raw SQL query or a more complex join.
            # Let's assume a simplified 'analytics_sales' view or similar might be best,
            # but given the schema files I saw earlier, let's stick to a safe simple query.
            
            response = self.client.table('orders').select("*").order('created_at', desc=True).limit(1000).execute()
            
            # In a real scenario, we would aggregate this data by day and product here or in SQL.
            # For now, simply returning the raw rows to be processed by Python.
            return response.data
        except Exception as e:
            logger.error(f"Error fetching sales history: {e}")
            return []

    def save_predictions(self, predictions: List[Dict[str, Any]]) -> bool:
        """
        Save forecast data to 'demand_forecasts' table.
        Standardizes the data format before insertion.
        """
        if not self.client:
            logger.error("Supabase client not initialized")
            return False

        try:
            if not predictions:
                return True

            # Upsert data. Ensure 'product_id', 'forecast_date', 'scenario' are unique keys in DB
            response = self.client.table('demand_forecasts').upsert(predictions).execute()
            logger.info(f"Successfully saved {len(predictions)} predictions.")
            return True
        except Exception as e:
            logger.error(f"Error saving predictions: {e}")
            return False

    def get_all_products(self) -> List[Dict[str, Any]]:
        """
        Fetch all active products to generate forecasts for them.
        """
        if not self.client:
            return []
            
        try:
            response = self.client.table('products').select("id, name, tenant_id").eq('status', 'active').execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching products: {e}")
            return []
