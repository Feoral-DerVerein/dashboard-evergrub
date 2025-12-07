import requests
import datetime
import logging

logger = logging.getLogger(__name__)

class ExternalDataManager:
    def __init__(self):
        self.weather_url = "https://api.open-meteo.com/v1/forecast"
        self.holidays_url = "https://date.nager.at/api/v3/PublicHolidays"

    def fetch_weather_data(self, latitude, longitude, start_date, end_date):
        """
        Fetch max temperature from Open-Meteo for a date range.
        Includes historical and forecast if possible, or just forecast.
        Note: Open-Meteo splits historical and forecast into different APIs.
        For simplicity, we'll use the 'forecast' API which often includes some past days or
        we might need to check the archive API for history.
        """
        try:
            # Open-Meteo Forecast API
            # For 2024, fetching forecast + past_days
            params = {
                "latitude": latitude,
                "longitude": longitude,
                "daily": "temperature_2m_max",
                "timezone": "auto",
                "start_date": start_date,
                "end_date": end_date
            }
            response = requests.get(self.weather_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            daily = data.get('daily', {})
            dates = daily.get('time', [])
            temps = daily.get('temperature_2m_max', [])
            
            result = []
            for d, t in zip(dates, temps):
                if t is not None:
                    result.append({"date": d, "temp_max": t})
                    
            return result
        except Exception as e:
            logger.error(f"Error fetching weather data: {e}")
            return []

    def fetch_holidays(self, country_code, start_date, end_date):
        """
        Fetch public holidays from Nager.Date.
        Nager.Date takes year and country code.
        """
        try:
            start = datetime.datetime.strptime(start_date, "%Y-%m-%d")
            end = datetime.datetime.strptime(end_date, "%Y-%m-%d")
            years = range(start.year, end.year + 1)
            
            holidays = []
            for year in years:
                url = f"{self.holidays_url}/{year}/{country_code}"
                response = requests.get(url)
                if response.status_code == 200:
                    data = response.json()
                    for h in data:
                        h_date = h.get('date')
                        if start_date <= h_date <= end_date:
                            holidays.append({
                                "date": h_date,
                                "is_holiday": 1,
                                "holiday_name": h.get('name')
                            })
            return holidays
        except Exception as e:
            logger.error(f"Error fetching holidays: {e}")
            return []

    def get_regressors(self, start_date, end_date, lat=40.4168, lon=-3.7038, country='ES'):
        """
        Orchestrates fetching of all external data and merges them.
        Default lat/lon is Madrid, Spain.
        """
        weather = self.fetch_weather_data(lat, lon, start_date, end_date)
        holidays = self.fetch_holidays(country, start_date, end_date)
        
        # Merge by date
        merged = {}
        
        # Initialize with weather
        for w in weather:
            merged[w['date']] = {"date": w['date'], "temp_max": w['temp_max'], "is_holiday": 0}
            
        # Merge holidays
        for h in holidays:
            d = h['date']
            if d in merged:
                merged[d]['is_holiday'] = 1
            else:
                # If we have a holiday but no weather (rare if ranges match), create entry
                # We might miss temp here, so careful with Prophet NaNs (Prophet fills them or we fill them)
                merged[d] = {"date": d, "temp_max": 20.0, "is_holiday": 1} # Default temp
                
        return list(merged.values())
