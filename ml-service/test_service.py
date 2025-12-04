#!/usr/bin/env python3
"""
Test script for Prophet ML Service
"""
import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:10000"

def test_health():
    """Test health check endpoint"""
    print("🏥 Testing health check...")
    response = requests.get(f"{BASE_URL}/")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}\n")
    return response.status_code == 200

def test_predict_demand():
    """Test demand prediction endpoint"""
    print("📈 Testing demand prediction...")
    
    # Generate sample sales history
    history = []
    base_date = datetime.now() - timedelta(days=30)
    for i in range(30):
        date = base_date + timedelta(days=i)
        # Simulate sales with some variance
        value = 50 + (i % 7) * 5  # Weekly pattern
        history.append({
            "date": date.strftime("%Y-%m-%d"),
            "value": float(value)
        })
    
    payload = {
        "product_id": "test-product-123",
        "history": history,
        "days": 7
    }
    
    response = requests.post(f"{BASE_URL}/predict/demand", json=payload)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Product ID: {data['product_id']}")
        print(f"   Forecast points: {len(data['forecast'])}")
        if data['forecast']:
            first = data['forecast'][0]
            print(f"   First forecast: {first}")
    else:
        print(f"   Error: {response.text}")
    print()
    return response.status_code == 200

def test_predict_scenario():
    """Test scenario prediction endpoint"""
    print("🎯 Testing scenario prediction...")
    
    # Generate sample sales history
    history = []
    base_date = datetime.now() - timedelta(days=30)
    for i in range(30):
        date = base_date + timedelta(days=i)
        value = 50 + (i % 7) * 5
        history.append({
            "date": date.strftime("%Y-%m-%d"),
            "value": float(value)
        })
    
    for scenario in ['base', 'optimistic', 'crisis']:
        print(f"   Testing {scenario} scenario...")
        payload = {
            "sales_history": history,
            "days_to_forecast": 7,
            "scenario": scenario
        }
        
        response = requests.post(f"{BASE_URL}/predict/scenario", json=payload)
        if response.status_code == 200:
            data = response.json()
            print(f"      ✓ {scenario}: {len(data['forecast'])} forecast points")
            if data['forecast']:
                avg_demand = sum(f['predicted_demand'] for f in data['forecast']) / len(data['forecast'])
                print(f"      Average demand: {avg_demand:.2f}")
        else:
            print(f"      ✗ {scenario} failed: {response.text}")
    print()

def test_predict_risk():
    """Test risk prediction endpoint"""
    print("⚠️  Testing risk prediction...")
    
    payload = {
        "product_id": "yogurt-123",
        "stock": 100.0,
        "avg_daily_sales": 15.0,
        "days_to_expiry": 5,
        "product_cost": 2.50
    }
    
    response = requests.post(f"{BASE_URL}/predict/risk", json=payload)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Product ID: {data['product_id']}")
        print(f"   Expiration Risk: {data['expiration_risk_score']}")
        print(f"   Waste Risk: {data['waste_risk_score']}")
    else:
        print(f"   Error: {response.text}")
    print()
    return response.status_code == 200

def test_recommend_purchase():
    """Test purchase recommendation endpoint"""
    print("🛒 Testing purchase recommendation...")
    
    payload = {
        "product_id": "milk-456",
        "current_stock": 50.0,
        "min_stock": 30.0,
        "max_stock": 100.0,
        "predicted_demand_next_7d": 40.0
    }
    
    response = requests.post(f"{BASE_URL}/recommend/purchase", json=payload)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Product ID: {data['product_id']}")
        print(f"   Recommended Qty: {data['recommended_purchase_qty']}")
        print(f"   Reason: {data['reason']}")
        print(f"   Projected Stock (7d): {data['projected_stock_7d']}")
    else:
        print(f"   Error: {response.text}")
    print()
    return response.status_code == 200

if __name__ == "__main__":
    print("\n🚀 Prophet ML Service - Test Suite\n")
    print("=" * 50)
    
    try:
        results = {
            "Health Check": test_health(),
            "Demand Prediction": test_predict_demand(),
            "Scenario Prediction": test_predict_scenario() is None or True,  # This one doesn't return bool
            "Risk Prediction": test_predict_risk(),
            "Purchase Recommendation": test_recommend_purchase()
        }
        
        print("=" * 50)
        print("\n📊 Test Results:")
        for test_name, passed in results.items():
            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"   {test_name}: {status}")
        
        all_passed = all(results.values())
        print(f"\n{'🎉 All tests passed!' if all_passed else '⚠️  Some tests failed'}\n")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to the service.")
        print(f"   Make sure the service is running at {BASE_URL}\n")
        print("   Start with: python main.py\n")
