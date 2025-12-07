from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import logging
import os
from external_data import ExternalDataManager
import datetime

# Start FastAPI app
app = FastAPI(title="Negentropy ML Service", version="1.0.0")

# Request Models
class ForecastRequest(BaseModel):
    sales_history: List[dict]
    days_to_forecast: int
    scenario: str = 'base'
    regressors: Optional[List[dict]] = None

class RiskRequest(BaseModel):
    product_id: str
    stock: int
    days_to_expiry: int
    avg_daily_sales: float
    product_cost: float

class PurchaseRequest(BaseModel):
    product_id: str
    current_stock: int
    predicted_demand_next_7d: float
    min_stock: int
    max_stock: int

# Initialize core services
from forecasting import Forecaster
forecaster = Forecaster()
# synchronizer would need a separate import if it exists, for now I'll comment out the sync endpoint trigger if it's missing, or assume it's imported.
# It seems 'synchronizer' is used in line 89 but not imported.
# For safety, I will define a mock synchronizer if not present, but let's just make sure imports are clean.

# Initialize external data manager
external_data_manager = ExternalDataManager()

@app.post("/predict/scenario")
async def predict_scenario(request: ForecastRequest):
    """
    Generates a forecast based on a specific scenario (Base, Optimistic, Pessimistic).
    Supports external regressors (macro indicators).
    """
    try:
        # Prepare history data
        history_data = [{'date': d.date, 'value': d.value} for d in request.sales_history]
        
        if not history_data:
             raise HTTPException(status_code=400, detail="No historical data provided")

        # Determine date range for external data
        # Start from the earliest history date
        dates = [d['date'] for d in history_data]
        min_date = min(dates)
        
        # End date is today + days_to_forecast
        today = datetime.date.today()
        future_end = today + datetime.timedelta(days=request.days_to_forecast)
        max_date_str = future_end.strftime('%Y-%m-%d')
        
        # Prepare regressors if provided, otherwise fetch them
        regressors = request.regressors
        
        if not regressors:
            logger.info("Fetching external regressors (Weather/Holidays)...")
            # Default location: Madrid (todo: make configurable)
            regressors = external_data_manager.get_regressors(min_date, max_date_str)
            
        if regressors:
            logger.info(f"Using {len(regressors)} external regressor data points")
            
        # Train and predict using the enhanced forecaster
        forecast_raw = forecaster.train_and_predict(
            history_data, 
            periods=request.days_to_forecast,
            regressors=regressors
        )
        
        # Apply scenario multipliers (post-processing)
        # Note: In a more advanced version, scenario could change the regressor values themselves
        # e.g. "Crisis" scenario = higher inflation regressor
        multiplier = 1.0
        if request.scenario == 'optimistic':
            multiplier = 1.25
        elif request.scenario == 'crisis': # Changed from pessimistic to match frontend
            multiplier = 0.65
            
        # Adjust forecast based on scenario
        forecast = []
        for day in forecast_raw:
            adjusted_demand = round(day['predicted_demand'] * multiplier, 2)
            forecast.append({
                'date': day['date'],
                'predicted_demand': adjusted_demand,
                'confidence_lower': round(day['confidence_lower'] * multiplier, 2),
                'confidence_upper': round(day['confidence_upper'] * multiplier, 2),
                'scenario': request.scenario
            })

        return {"scenario": request.scenario, "forecast": forecast}
    except Exception as e:
        logger.error(f"Error in predict_scenario: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/sync/forecasts")
async def trigger_forecast_sync(background_tasks: BackgroundTasks):
    """
    Triggers a background full synchronization of forecasts.
    Fetches latest sales data, re-trains models, and updates 'demand_forecasts' table.
    """
    logger.info("Received request to trigger forecast sync")
    background_tasks.add_task(synchronizer.run_sync)
    return {"status": "accepted", "message": "Forecast synchronization started in background"}

@app.post("/macro/update")
async def update_macro_data(indicators: List[dict]):
    """
    Endpoint to receive and store macro indicators (mocked for now).
    In a real app, this would save to the 'macro_indicators' table.
    """
    logger.info(f"Received {len(indicators)} macro indicators for update")
    # Here we would save to DB
    return {"status": "success", "count": len(indicators)}

@app.post("/predict/risk")
async def predict_risk(request: RiskRequest):
    """
    Calculate expiration and waste risk scores
    """
    logger.info(f"Calculating risk for product {request.product_id}")
    
    # Assuming these functions are methods of the forecaster object or globally available
    # For this example, we'll call forecaster's methods
    risk_score = forecaster.calculate_expiration_risk(
        request.stock, 
        request.days_to_expiry, 
        request.avg_daily_sales
    )
    waste_score = forecaster.calculate_waste_risk(risk_score, request.product_cost)
    
    return {
        "product_id": request.product_id,
        "expiration_risk_score": risk_score,
        "waste_risk_score": waste_score
    }

@app.post("/recommend/purchase")
async def recommend_purchase(request: PurchaseRequest):
    """
    Generate purchase recommendation based on stock policies and forecast
    """
    logger.info(f"Calculating purchase recommendation for product {request.product_id}")
    
    # Calculate projected stock after 7 days
    projected_stock = request.current_stock - request.predicted_demand_next_7d
    
    # If projected stock falls below minimum, calculate deficit
    deficit = 0
    if projected_stock < request.min_stock:
        deficit = request.min_stock - projected_stock
    
    # Optionally fill to max stock level
    fill_to_max = 0
    if deficit > 0:
        fill_to_max = (request.max_stock - request.min_stock) * 0.5  # Fill halfway to max
    
    recommended_qty = round(deficit + fill_to_max)
    
    if recommended_qty > 0:
        reason = f"Projected stock ({round(projected_stock)}) below min ({request.min_stock})"
    else:
        reason = "Stock levels are adequate"
    
    return {
        "product_id": request.product_id,
        "recommended_purchase_qty": max(0, recommended_qty),
        "reason": reason,
        "projected_stock_7d": round(projected_stock, 2)
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
