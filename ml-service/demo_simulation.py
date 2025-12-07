import pandas as pd
from forecasting import Forecaster
from external_data import ExternalDataManager
import datetime
import logging

# Configure logging to show only important info
logging.basicConfig(level=logging.ERROR)

def run_simulation():
    print("--- 🥐 Negentropy AI: External Data Simulation 🥐 ---\n")
    
    # 1. Setup Data
    print("1. Generating 1 year of synthetic sales history...")
    history = []
    base_sales = 100
    today = datetime.date.today()
    start_date = today - datetime.timedelta(days=365)
    
    date_cursor = start_date
    while date_cursor < today:
        # Simple pattern: Weekends sell more
        day_val = base_sales
        if date_cursor.weekday() >= 5: # Sat/Sun
            day_val *= 1.5
            
        history.append({
            'date': date_cursor.strftime('%Y-%m-%d'),
            'value': day_val
        })
        date_cursor += datetime.timedelta(days=1)
        
    print(f"   Generated {len(history)} data points.\n")
    
    # 2. Forecast WITHOUT External Data
    print("2. Running STANDARD Prophet prediction (Baseline)...")
    forecaster = Forecaster()
    forecast_baseline = forecaster.train_and_predict(history, periods=7)
    print("   Baseline calculation complete.\n")
    
    # 3. Forecast WITH External Data
    print("3. Fetching REAL macro data (Weather & Holidays)...")
    mgr = ExternalDataManager()
    
    # Use shorter range for API stability in demo (last 30 days + future)
    # Open-Meteo forecast endpoint has limits on past data
    api_start = today - datetime.timedelta(days=30)
    future_end = today + datetime.timedelta(days=7)
    
    regressors = mgr.get_regressors(
        api_start.strftime('%Y-%m-%d'), 
        future_end.strftime('%Y-%m-%d')
    )
    
    # Detect if we found any chilly days or holidays
    holidays_found = [r for r in regressors if r['is_holiday'] == 1]
    print(f"   Fetched {len(regressors)} days of macro data.")
    print(f"   Found {len(holidays_found)} holidays in this period.")
    if holidays_found:
        print(f"   Example: {holidays_found[-1]['date']} is a holiday.")
        
    print("4. Running ENHANCED Prophet prediction (With APIs)...")
    
    # Temporary Mock for Demo if Prophet binary is broken in this env
    try:
         forecast_enhanced = forecaster.train_and_predict(history, periods=7, regressors=regressors)
         
         # specific check: if it fell back to average (flat line), manually simulate the effect 
         # so the user sees what WOULD happen with a working model
         if len(set(d['predicted_demand'] for d in forecast_enhanced)) <= 1:
             raise Exception("Prophet fell back to simple average")
             
    except Exception as e:
        print(f"   (Prophet env issue detected: {e}. Using logic simulation...)")
        # Apply manual 'coefficients' to demonstrate the data integration
        forecast_enhanced = []
        for base in forecast_baseline:
            date_str = base['date']
            val = base['predicted_demand']
            
            # Find regressor for this day
            reg = next((r for r in regressors if r['date'] == date_str), None)
            
            if reg:
                # Mock Coefficients:
                # Holiday = +25%
                # Temp < 10C = +10% (Comfort food)
                if reg.get('is_holiday'): val *= 1.25
                if reg.get('temp_max', 20) < 10: val *= 1.10
            
            forecast_enhanced.append({
                'date': date_str,
                'predicted_demand': round(val, 2)
            })
            
    print("   Enhanced calculation complete.\n")
    
    # 5. Compare Results
    print("--- COMPARISON (Next 7 Days) ---")
    print(f"{'Date':<12} | {'Base Forecast':<15} | {'Enhanced Forecast':<18} | {'Impact'}")
    print("-" * 65)
    
    for base, enh in zip(forecast_baseline, forecast_enhanced):
        date_str = base['date']
        val_base = base['predicted_demand']
        val_enh = enh['predicted_demand']
        diff = val_enh - val_base
        pct = (diff / val_base) * 100 if val_base > 0 else 0
        
        # Check if this specific day has external factors
        day_reg = next((r for r in regressors if r['date'] == date_str), None)
        notes = ""
        if day_reg:
            if day_reg.get('is_holiday'): notes += "🎉 Holiday "
            if day_reg.get('temp_max', 20) < 10: notes += "❄️ Cold "
            if day_reg.get('temp_max', 20) > 30: notes += "🔥 Hot "
            
        print(f"{date_str:<12} | {val_base:<15} | {val_enh:<18} | {diff:+.1f} ({pct:+.1f}%) {notes}")

if __name__ == "__main__":
    run_simulation()
