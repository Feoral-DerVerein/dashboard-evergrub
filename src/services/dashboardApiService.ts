export interface DashboardApiConfig {
  apiUrl: string;
  apiKey: string;
  enabled: boolean;
}

export interface InsightData {
  type: 'ai_recommendation' | 'smart_bag_suggestion' | 'inventory_alert';
  title: string;
  description: string;
  data: any;
  timestamp: string;
}

export const sendInsightToDashboard = async (insight: InsightData): Promise<boolean> => {
  try {
    // Get API settings from localStorage
    const savedApiSettings = localStorage.getItem('apiSettings');
    if (!savedApiSettings) {
      console.log('No API settings configured');
      return false;
    }

    const apiConfig: DashboardApiConfig = JSON.parse(savedApiSettings);
    
    if (!apiConfig.enabled || !apiConfig.apiUrl || !apiConfig.apiKey) {
      console.log('API integration not enabled or missing credentials');
      return false;
    }

    const response = await fetch(apiConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiConfig.apiKey}`,
        'X-API-Key': apiConfig.apiKey,
      },
      body: JSON.stringify({
        ...insight,
        source: 'wisebite-pos',
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    console.log('Insight sent successfully to dashboard API');
    return true;
  } catch (error) {
    console.error('Error sending insight to dashboard API:', error);
    return false;
  }
};

export const testApiConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const savedApiSettings = localStorage.getItem('apiSettings');
    if (!savedApiSettings) {
      return { success: false, message: 'No API settings configured' };
    }

    const apiConfig: DashboardApiConfig = JSON.parse(savedApiSettings);
    
    if (!apiConfig.apiUrl || !apiConfig.apiKey) {
      return { success: false, message: 'Missing API URL or API Key' };
    }

    // Test connection with a simple ping
    const response = await fetch(`${apiConfig.apiUrl}/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiConfig.apiKey}`,
        'X-API-Key': apiConfig.apiKey,
      },
    });

    if (response.ok) {
      return { success: true, message: 'Connection successful' };
    } else {
      return { success: false, message: `Connection failed: ${response.status}` };
    }
  } catch (error) {
    return { success: false, message: `Connection error: ${error.message}` };
  }
};