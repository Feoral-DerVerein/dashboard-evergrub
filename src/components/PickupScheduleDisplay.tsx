import { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pickupScheduleService, type WeeklySchedule } from "@/services/pickupScheduleService";

interface PickupScheduleDisplayProps {
  storeUserId: string;
  compact?: boolean;
  className?: string;
}

export function PickupScheduleDisplay({ storeUserId, compact = false, className = "" }: PickupScheduleDisplayProps) {
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSchedule();
  }, [storeUserId]);

  const loadSchedule = async () => {
    try {
      setIsLoading(true);
      const storeSchedule = await pickupScheduleService.getStorePickupTimes(storeUserId);
      setSchedule(storeSchedule);
    } catch (error) {
      console.error('Failed to load store schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableDays = () => {
    if (!schedule) return [];
    
    return Object.entries(schedule)
      .filter(([_, daySchedule]) => daySchedule.enabled)
      .map(([day, daySchedule]) => ({
        day,
        ...daySchedule
      }));
  };

  const getTodayAvailability = () => {
    if (!schedule) return null;
    
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }) as keyof WeeklySchedule;
    const todaySchedule = schedule[dayName];
    
    if (!todaySchedule?.enabled) return null;
    
    return todaySchedule;
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-16 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className={`text-muted-foreground text-sm ${className}`}>
        <Clock className="w-4 h-4 inline mr-1" />
        Pickup schedule not available
      </div>
    );
  }

  const availableDays = getAvailableDays();
  const todayAvailability = getTodayAvailability();

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        {todayAvailability && (
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-green-100 text-green-800">
              Today Available
            </Badge>
            <span className="text-sm text-muted-foreground">
              {todayAvailability.startTime} - {todayAvailability.endTime}
            </span>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          <Clock className="w-3 h-3 inline mr-1" />
          {availableDays.length === 0 
            ? "No pickup days scheduled"
            : `${availableDays.length} pickup days/week`
          }
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Pickup Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        {todayAvailability && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="default" className="bg-green-600">
                Available Today
              </Badge>
            </div>
            <div className="text-sm text-green-800">
              <Clock className="w-4 h-4 inline mr-1" />
              {todayAvailability.startTime} - {todayAvailability.endTime}
              <span className="ml-2">
                ({todayAvailability.collections} collection{todayAvailability.collections !== 1 ? 's' : ''})
              </span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Weekly Schedule:</h4>
          {availableDays.length === 0 ? (
            <p className="text-muted-foreground text-sm">No pickup days scheduled</p>
          ) : (
            <div className="grid gap-2">
              {availableDays.map(({ day, startTime, endTime, collections }) => (
                <div
                  key={day}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                >
                  <span className="font-medium">{day}</span>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{startTime} - {endTime}</span>
                    <Badge variant="outline" className="text-xs">
                      {collections} pickup{collections !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}