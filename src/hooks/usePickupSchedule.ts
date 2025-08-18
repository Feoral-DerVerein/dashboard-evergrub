import { useState, useEffect } from "react";
import { pickupScheduleService, type WeeklySchedule, type PickupAvailability } from "@/services/pickupScheduleService";

export function usePickupSchedule(storeUserId?: string) {
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (storeUserId) {
      loadSchedule();
    }
  }, [storeUserId]);

  const loadSchedule = async () => {
    if (!storeUserId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const storeSchedule = await pickupScheduleService.getStorePickupTimes(storeUserId);
      setSchedule(storeSchedule);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAvailability = async (date: Date): Promise<PickupAvailability | null> => {
    if (!storeUserId) return null;
    
    try {
      return await pickupScheduleService.getPickupAvailability(storeUserId, date);
    } catch (err) {
      console.error('Failed to check availability:', err);
      return null;
    }
  };

  const isAvailableToday = (): boolean => {
    if (!schedule) return false;
    
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }) as keyof WeeklySchedule;
    return schedule[dayName]?.enabled || false;
  };

  const getTodaySchedule = () => {
    if (!schedule) return null;
    
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }) as keyof WeeklySchedule;
    const todaySchedule = schedule[dayName];
    
    return todaySchedule?.enabled ? todaySchedule : null;
  };

  const getNextAvailableDay = () => {
    if (!schedule) return null;
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay();
    
    // Check for next available day starting from tomorrow
    for (let i = 1; i <= 7; i++) {
      const dayIndex = (today + i) % 7;
      const dayName = days[dayIndex] as keyof WeeklySchedule;
      
      if (schedule[dayName]?.enabled) {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + i);
        return {
          date: nextDate,
          dayName,
          schedule: schedule[dayName]
        };
      }
    }
    
    return null;
  };

  return {
    schedule,
    isLoading,
    error,
    checkAvailability,
    isAvailableToday,
    getTodaySchedule,
    getNextAvailableDay,
    refetch: loadSchedule
  };
}