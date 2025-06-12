
// Points calculation utilities
export const POINTS_CONFIG = {
  CASHBACK_PERCENTAGE: 0.01, // 1%
  POINT_VALUE: 0.005, // $0.005 AUD per point (2,000 points = $10)
};

/**
 * Calculate points earned for a product based on its price
 * Formula: Points = (Price × Cashback Percentage) / Point Value
 * @param price Product price in AUD
 * @returns Number of points earned
 */
export const calculateProductPoints = (price: number): number => {
  const pointsEarned = (price * POINTS_CONFIG.CASHBACK_PERCENTAGE) / POINTS_CONFIG.POINT_VALUE;
  return Math.floor(pointsEarned); // Round down to whole points
};

/**
 * Calculate the monetary value of points
 * @param points Number of points
 * @returns Monetary value in AUD
 */
export const calculatePointsValue = (points: number): number => {
  return points * POINTS_CONFIG.POINT_VALUE;
};

/**
 * Format points for display
 * @param points Number of points
 * @returns Formatted string
 */
export const formatPoints = (points: number): string => {
  return `${points.toLocaleString()} pts`;
};

/**
 * Format points value for display
 * @param points Number of points
 * @returns Formatted monetary value string
 */
export const formatPointsValue = (points: number): string => {
  const value = calculatePointsValue(points);
  return `$${value.toFixed(2)}`;
};
