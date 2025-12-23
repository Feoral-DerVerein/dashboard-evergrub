interface SquareCredentials {
  application_id: string;
  access_token: string;
  location_id: string;
}

export const testSquareConnection = async (
  credentials: SquareCredentials
): Promise<{ success: boolean; locationName?: string; error?: string }> => {
  try {
    const response = await fetch(
      `https://connect.squareup.com/v2/locations/${credentials.location_id}`,
      {
        method: 'GET',
        headers: {
          'Square-Version': '2024-12-18',
          'Authorization': `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.errors?.[0]?.detail || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      locationName: data.location?.name || 'Unknown Location',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
};

export const squareService = {
  testConnection: testSquareConnection,
  getProducts: async (credentials: SquareCredentials): Promise<{
    success: boolean;
    products?: any[];
    error?: string;
  }> => {
    try {
      const response = await fetch('https://connect.squareup.com/v2/catalog/list?types=ITEM', {
        headers: {
          'Square-Version': '2024-12-18',
          'Authorization': `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        products: data.objects || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Square products',
      };
    }
  }
};
