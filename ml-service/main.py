from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import logging
from forecasting import Forecaster

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Negentropy ML Service")
forecaster = Forecaster()

# Data Models
class SalesDataPoint(BaseModel):
    date: str
    value: float

class ForecastRequest(BaseModel):
    sales_history: List[SalesDataPoint] # Changed SalesData to SalesDataPoint to match existing model
    days_to_forecast: int = 7
    scenario: Optional[str] = 'base' # base, optimistic, pessimistic
    regressors: Optional[List[dict]] = None # List of macro indicators

class DemandRequest(BaseModel):
    product_id: str
    history: List[SalesDataPoint]
    days: Optional[int] = 30

class RiskRequest(BaseModel):
    product_id: str
    stock: float
    avg_daily_sales: float
    days_to_expiry: int
    product_cost: float # Added product_cost as it's used in predict_risk

class PurchaseRequest(BaseModel):
    product_id: str
    current_stock: float
    min_stock: float
    max_stock: float
    predicted_demand_next_7d: float

@app.get("/")
def health_check():
    return {"status": "ok", "service": "negentropy-ml-service"}

@app.post("/predict/demand")
def predict_demand(request: DemandRequest):
    """
    Generate demand forecast using Prophet
    """
    logger.info(f"Predicting demand for product {request.product_id} with {len(request.history)} data points")
    
    history_data = [{'date': d.date, 'value': d.value} for d in request.history]
    forecast = forecaster.train_and_predict(history_data, periods=request.days)
    
    return {
        "product_id": request.product_id,
        "forecast": forecast
    }

@app.post("/predict/scenario")
async def predict_scenario(request: ForecastRequest):
    """
    Generates a forecast based on a specific scenario (Base, Optimistic, Pessimistic).
    Supports external regressors (macro indicators).
    """
    try:
        # Prepare history data
        history_data = [{'date': d.date, 'value': d.value} for d in request.sales_history]
        
        # Prepare regressors if provided
        # request.regressors is expected to be a list of dicts: [{'date': '2023-01-01', 'inflation': 0.05}, ...]
        regressors = request.regressors if request.regressors else None
        
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
        
    recommended_qty = round(deficit + fill_to_max)
    reason = f"Projected stock ({round(projected_stock)}) below min ({request.min_stock})"
    
    return {
        "product_id": request.product_id,
        "recommended_purchase_qty": max(0, recommended_qty),
        "reason": reason,
        "projected_stock_7d": round(projected_stock, 2)
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
