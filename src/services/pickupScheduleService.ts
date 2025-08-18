import { supabase } from "@/integrations/supabase/client";

export interface DaySchedule {
  enabled: boolean;
  collections: number;
  startTime: string;
  endTime: string;
}

export interface WeeklySchedule {
  Monday: DaySchedule;
  Tuesday: DaySchedule;
  Wednesday: DaySchedule;
  Thursday: DaySchedule;
  Friday: DaySchedule;
  Saturday: DaySchedule;
  Sunday: DaySchedule;
}

export interface PickupAvailability {
  is_available: boolean;
  collections: number;
  start_time: string | null;
  end_time: string | null;
  is_special_date: boolean;
}

const DAY_MAP: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

export const pickupScheduleService = {
  async saveWeeklySchedule(schedule: WeeklySchedule): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Convert schedule to database format
    const scheduleEntries = Object.entries(schedule).map(([day, daySchedule]) => ({
      user_id: user.id,
      day_of_week: DAY_MAP[day],
      enabled: daySchedule.enabled,
      collections: daySchedule.collections,
      start_time: daySchedule.startTime,
      end_time: daySchedule.endTime,
    }));

    // Use upsert to handle existing schedules
    for (const entry of scheduleEntries) {
      const { error } = await supabase
        .from('pickup_schedules')
        .upsert(entry, {
          onConflict: 'user_id,day_of_week'
        });

      if (error) {
        throw new Error(`Failed to save schedule for day ${entry.day_of_week}: ${error.message}`);
      }
    }
  },

  async getWeeklySchedule(): Promise<WeeklySchedule | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('pickup_schedules')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to fetch schedule: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Convert database format to WeeklySchedule
    const schedule: Partial<WeeklySchedule> = {};
    const dayNames = Object.keys(DAY_MAP);
    
    data.forEach((entry) => {
      const dayName = dayNames.find(name => DAY_MAP[name] === entry.day_of_week);
      if (dayName) {
        schedule[dayName as keyof WeeklySchedule] = {
          enabled: entry.enabled,
          collections: entry.collections,
          startTime: entry.start_time,
          endTime: entry.end_time,
        };
      }
    });

    // Fill in missing days with defaults
    dayNames.forEach(day => {
      if (!schedule[day as keyof WeeklySchedule]) {
        schedule[day as keyof WeeklySchedule] = {
          enabled: false,
          collections: 1,
          startTime: "09:00",
          endTime: "17:00",
        };
      }
    });

    return schedule as WeeklySchedule;
  },

  async saveSpecialDate(date: Date, enabled: boolean, collections?: number, startTime?: string, endTime?: string, note?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from('pickup_special_dates')
      .upsert({
        user_id: user.id,
        date: date.toISOString().split('T')[0], // YYYY-MM-DD format
        enabled,
        collections: collections || 1,
        start_time: startTime || null,
        end_time: endTime || null,
        note: note || null,
      }, {
        onConflict: 'user_id,date'
      });

    if (error) {
      throw new Error(`Failed to save special date: ${error.message}`);
    }
  },

  async getPickupAvailability(userId: string, date: Date): Promise<PickupAvailability | null> {
    const { data, error } = await supabase
      .rpc('get_pickup_availability', {
        p_user_id: userId,
        p_date: date.toISOString().split('T')[0]
      });

    if (error) {
      throw new Error(`Failed to check pickup availability: ${error.message}`);
    }

    return data && data.length > 0 ? data[0] : null;
  },

  async getStorePickupTimes(storeUserId: string): Promise<WeeklySchedule | null> {
    const { data, error } = await supabase
      .from('pickup_schedules')
      .select('*')
      .eq('user_id', storeUserId);

    if (error || !data || data.length === 0) {
      return null;
    }

    // Convert database format to WeeklySchedule
    const schedule: Partial<WeeklySchedule> = {};
    const dayNames = Object.keys(DAY_MAP);
    
    data.forEach((entry) => {
      const dayName = dayNames.find(name => DAY_MAP[name] === entry.day_of_week);
      if (dayName) {
        schedule[dayName as keyof WeeklySchedule] = {
          enabled: entry.enabled,
          collections: entry.collections,
          startTime: entry.start_time,
          endTime: entry.end_time,
        };
      }
    });

    return schedule as WeeklySchedule;
  }
};