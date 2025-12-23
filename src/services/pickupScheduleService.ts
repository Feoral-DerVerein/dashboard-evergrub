import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, setDoc, orderBy } from 'firebase/firestore';

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
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    // Convert schedule to database format
    const scheduleEntries = Object.entries(schedule).map(([day, daySchedule]) => ({
      user_id: user.uid,
      day_of_week: DAY_MAP[day],
      enabled: daySchedule.enabled,
      collections: daySchedule.collections,
      start_time: daySchedule.startTime,
      end_time: daySchedule.endTime,
    }));

    // Use setDoc with merge to handle existing schedules
    // Firestore ID strategy: userId_dayOfWeek
    for (const entry of scheduleEntries) {
      try {
        const docId = `${entry.user_id}_${entry.day_of_week}`;
        await setDoc(doc(db, 'pickup_schedules', docId), entry, { merge: true });
      } catch (error: any) {
        throw new Error(`Failed to save schedule for day ${entry.day_of_week}: ${error.message}`);
      }
    }
  },

  async getWeeklySchedule(): Promise<WeeklySchedule | null> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    try {
      const q = query(
        collection(db, 'pickup_schedules'),
        where('user_id', '==', user.uid)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const data = snapshot.docs.map(d => d.data());

      // Convert database format to WeeklySchedule
      const schedule: Partial<WeeklySchedule> = {};
      const dayNames = Object.keys(DAY_MAP);

      data.forEach((entry: any) => {
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

    } catch (e: any) {
      throw new Error(`Failed to fetch schedule: ${e.message}`);
    }
  },

  async saveSpecialDate(date: Date, enabled: boolean, collections?: number, startTime?: string, endTime?: string, note?: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const dateStr = date.toISOString().split('T')[0];
    const docId = `${user.uid}_${dateStr}`;

    try {
      await setDoc(doc(db, 'pickup_special_dates', docId), {
        user_id: user.uid,
        date: dateStr, // YYYY-MM-DD format
        enabled,
        collections: collections || 1,
        start_time: startTime || null,
        end_time: endTime || null,
        note: note || null,
      }, { merge: true });
    } catch (error: any) {
      throw new Error(`Failed to save special date: ${error.message}`);
    }
  },

  async getPickupAvailability(userId: string, date: Date): Promise<PickupAvailability | null> {
    // Replaces RPC call with client-side logic lookup
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();

    try {
      // Check special dates first
      const specialDocId = `${userId}_${dateStr}`;
      const specialSnap = await getDoc(doc(db, 'pickup_special_dates', specialDocId));
      if (specialSnap.exists()) {
        const d = specialSnap.data();
        return {
          is_available: d.enabled,
          collections: d.collections,
          start_time: d.start_time,
          end_time: d.end_time,
          is_special_date: true
        };
      }

      // Check weekly schedule
      const scheduleDocId = `${userId}_${dayOfWeek}`;
      const scheduleSnap = await getDoc(doc(db, 'pickup_schedules', scheduleDocId));
      if (scheduleSnap.exists()) {
        const d = scheduleSnap.data();
        return {
          is_available: d.enabled,
          collections: d.collections,
          start_time: d.start_time,
          end_time: d.end_time,
          is_special_date: false
        };
      }

      // Default: not available if no schedule found
      return null;

    } catch (error: any) {
      throw new Error(`Failed to check pickup availability: ${error.message}`);
    }
  },

  async getStorePickupTimes(storeUserId: string): Promise<WeeklySchedule | null> {
    try {
      const q = query(
        collection(db, 'pickup_schedules'),
        where('user_id', '==', storeUserId)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const data = snapshot.docs.map(d => d.data());

      // Convert database format to WeeklySchedule
      const schedule: Partial<WeeklySchedule> = {};
      const dayNames = Object.keys(DAY_MAP);

      data.forEach((entry: any) => {
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
    } catch (e) {
      return null;
    }
  }
};