import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import pandas as pd
import numpy as np
from statsforecast import StatsForecast
from statsforecast.models import AutoARIMA, ETS

# Initialize Firebase (Auto-discovery of credentials or use explicit path)
try:
    if not firebase_admin._apps:
        cred = None
        # Check for local service account key
        json_file = 'service-account.json'
        if os.path.exists(json_file):
            print(f"🔑 Found {json_file}, using it for auth...")
            cred = credentials.Certificate(json_file)
            firebase_admin.initialize_app(cred)
        else:
            print("☁️ No service-account.json found, trying Default Credentials...")
            firebase_admin.initialize_app()
        json_file = 'service-account.json'
        if os.path.exists(json_file):
            print(f"🔑 Found {json_file}, using it for auth...")
            cred = credentials.Certificate(json_file)
            firebase_admin.initialize_app(cred)
        else:
            print("☁️ No service-account.json found, trying Default Credentials...")
            files = [f for f in os.listdir('.') if f.endswith('.json')]
            if files:
                print(f"👉 Did you mean one of these? {files}")
            firebase_admin.initialize_app()

    db = firestore.client()
    print("✅ Connected to Firestore")
except Exception as e:
    print(f"❌ Failed to connect to Firestore: {e}")
    print("👉 HINT: Download your service account key from project settings and save it as 'functions/service-account.json'")
    exit(1)

def fetch_sales_data(tenant_id):
    """
    Fetches sales history from Firestore and formats it for StatsForecast.
    Expected Firestore Structure: 'sales_history' collection with documents containing:
    { 'product_id': '...', 'date': 'YYYY-MM-DD', 'quantity': 10, 'tenant_id': '...' }
    """
    print(f"📥 Fetching sales data for tenant: {tenant_id}")
    
    # In a real app, query by tenant_id
    # docs = db.collection('sales_history').where('tenant_id', '==', tenant_id).stream()
    
    # Using 'transactions' collection for demo if 'sales_history' is empty
    docs = db.collection('transactions').stream()
    
    data = []
    for doc in docs:
        d = doc.to_dict()
        # Ensure we have date and amount
        if 'created_at' in d and 'total_amount' in d:
             data.append({
                'unique_id': 'total_sales', # Aggregating total sales for now. Or use d.get('product_id')
                'ds': d['created_at'].split('T')[0], # Date
                'y': d['total_amount'] # Metric to predict
            })

    if not data:
        print("⚠️ No data found. Generating mock data for demonstration.")
        # Generate dummy data for testing if DB is empty
        dates = pd.date_range(start='2024-01-01', end='2024-03-01')
        data = [{'unique_id': 'total_sales', 'ds': d.strftime('%Y-%m-%d'), 'y': np.random.randint(50, 200)} for d in dates]

    df = pd.DataFrame(data)
    # Convert 'ds' to datetime
    df['ds'] = pd.to_datetime(df['ds'])
    # Group by date to handle multiple transactions per day
    df = df.groupby(['unique_id', 'ds']).sum().reset_index()
    
    return df

def generate_forecast(df, horizon=7):
    """
    Runs StatsForecast (AutoARIMA + ETS)
    """
    print(f"🤖 Training StatsForecast models (Horizon: {horizon} days)...")
    
    models = [
        AutoARIMA(season_length=7),
        ETS(season_length=7, model='ZMZ')
    ]
    
    sf = StatsForecast(
        models=models,
        freq='D',
        n_jobs=-1
    )
    
    sf.fit(df)
    forecast_df = sf.predict(h=horizon, level=[90])
    
    return forecast_df

def save_forecasts(forecast_df, tenant_id):
    """
    Saves predictions back to Firestore
    """
    print("💾 Saving forecasts to Firestore...")
    
    batch = db.batch()
    collection_ref = db.collection('forecasts')
    
    # Reset index to make 'ds' a column
    forecast_df = forecast_df.reset_index()
    
    for index, row in forecast_df.iterrows():
        # Create a document ID based on date and product
        doc_id = f"{tenant_id}_{row['unique_id']}_{row['ds'].strftime('%Y-%m-%d')}"
        doc_ref = collection_ref.document(doc_id)
        
        payload = {
            'tenant_id': tenant_id,
            'product_id': row['unique_id'],
            'date': row['ds'].strftime('%Y-%m-%d'),
            'predicted_mean': float(row['AutoARIMA']), # Using AutoARIMA as primary, or average
            'prediction_low': float(row['AutoARIMA-lo-90']),
            'prediction_high': float(row['AutoARIMA-hi-90']),
            'model_used': 'StatsForecast (AutoARIMA)',
            'updated_at': firestore.SERVER_TIMESTAMP
        }
        
        batch.set(doc_ref, payload)
        
    batch.commit()
    print("✅ Forecasts saved successfully!")

if __name__ == "__main__":
    print("🚀 Starting Batch Forecasting Worker...")
    
    # Fetch all tenants (users) from Firestore
    # In a real scenario, you might filter by 'subscription_status' == 'active'
    users_ref = db.collection('users')
    docs = users_ref.stream()
    
    tenant_ids = [doc.id for doc in docs]
    
    # If no users found, use demo user for testing
    if not tenant_ids:
        print("⚠️ No users found in 'users' collection. Using 'demo-user'.")
        tenant_ids = ["demo-user"]
    
    print(f"📋 Found {len(tenant_ids)} tenants to process: {tenant_ids}")
    
    for tenant_id in tenant_ids:
        try:
            print(f"\n--- Processing Tenant: {tenant_id} ---")
            
            # 1. ETL
            df = fetch_sales_data(tenant_id)
            
            if df.empty:
                print(f"⚠️ Skipping {tenant_id}: No sales data found.")
                continue

            print(f"📊 Prepared {len(df)} data points")
            
            # 2. Predict
            forecasts = generate_forecast(df)
            print(f"🔮 Generated {len(forecasts)} prediction points")
            
            # 3. Load
            save_forecasts(forecasts, tenant_id)
            
        except Exception as e:
            print(f"❌ Error processing tenant {tenant_id}: {e}")
            # Continue to next tenant even if one fails
            continue
            
    print("\n✅ Batch Forecasting Job Complete.")
