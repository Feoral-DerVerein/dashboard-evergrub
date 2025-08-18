import { useState } from "react";
import { Calendar, Clock, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DaySchedule {
  enabled: boolean;
  collections: number;
  startTime: string;
  endTime: string;
}

interface WeeklySchedule {
  Monday: DaySchedule;
  Tuesday: DaySchedule;
  Wednesday: DaySchedule;
  Thursday: DaySchedule;
  Friday: DaySchedule;
  Saturday: DaySchedule;
  Sunday: DaySchedule;
}

const defaultSchedule: WeeklySchedule = {
  Monday: { enabled: true, collections: 3, startTime: "18:00", endTime: "19:30" },
  Tuesday: { enabled: false, collections: 2, startTime: "18:00", endTime: "19:00" },
  Wednesday: { enabled: false, collections: 1, startTime: "17:30", endTime: "18:00" },
  Thursday: { enabled: false, collections: 2, startTime: "18:00", endTime: "19:00" },
  Friday: { enabled: true, collections: 4, startTime: "17:00", endTime: "20:00" },
  Saturday: { enabled: true, collections: 2, startTime: "10:00", endTime: "12:00" },
  Sunday: { enabled: false, collections: 1, startTime: "10:00", endTime: "11:00" },
};

export function ScheduleDialog({ open, onOpenChange }: ScheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [schedule, setSchedule] = useState<WeeklySchedule>(defaultSchedule);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    
    // Adjust to start from Monday
    const dayOfWeek = (firstDay.getDay() + 6) % 7;
    startDate.setDate(firstDay.getDate() - dayOfWeek);
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || days.length % 7 !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getDayStatus = (date: Date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }) as keyof WeeklySchedule;
    const daySchedule = schedule[dayName];
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
    
    if (!isCurrentMonth) return 'disabled';
    if (daySchedule.enabled) return 'collection';
    return 'no-collection';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const updateDaySchedule = (day: keyof WeeklySchedule, field: keyof DaySchedule, value: any) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const toggleDay = (day: keyof WeeklySchedule) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled
      }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule Pickup Times
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Organise the times to collect orders - Configure your weekly pickup schedule and select specific dates.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Schedule Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(schedule).map(([day, daySchedule]) => (
                <div key={day} className="grid grid-cols-6 gap-4 items-center p-4 border rounded-lg">
                  {/* Day Column */}
                  <div className="col-span-1">
                    <Label className="font-medium">{day}</Label>
                  </div>
                  
                  {/* Toggle Column */}
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => toggleDay(day as keyof WeeklySchedule)}
                      className="flex items-center gap-2"
                    >
                      {daySchedule.enabled ? (
                        <ToggleRight className="w-8 h-8 text-primary" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-muted-foreground" />
                      )}
                    </button>
                  </div>

                  {/* Collections Column */}
                  <div className="col-span-1 flex justify-center">
                    {daySchedule.enabled && (
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={daySchedule.collections}
                        onChange={(e) => updateDaySchedule(day as keyof WeeklySchedule, 'collections', parseInt(e.target.value) || 1)}
                        className="w-16 h-8 text-center"
                      />
                    )}
                  </div>

                  {/* Start Time Column */}
                  <div className="col-span-1 flex justify-center">
                    {daySchedule.enabled && (
                      <Input
                        type="time"
                        value={daySchedule.startTime}
                        onChange={(e) => updateDaySchedule(day as keyof WeeklySchedule, 'startTime', e.target.value)}
                        className="w-20 h-8 text-xs text-center"
                      />
                    )}
                  </div>

                  {/* End Time Column */}
                  <div className="col-span-1 flex justify-center">
                    {daySchedule.enabled && (
                      <Input
                        type="time"
                        value={daySchedule.endTime}
                        onChange={(e) => updateDaySchedule(day as keyof WeeklySchedule, 'endTime', e.target.value)}
                        className="w-20 h-8 text-xs text-center"
                      />
                    )}
                  </div>

                  {/* Status Column */}
                  <div className="col-span-1 text-center">
                    {daySchedule.enabled ? (
                      <span className="text-xs text-primary font-medium">Collection</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">No Collection</span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Calendar Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Calendar</CardTitle>
              <p className="text-sm text-muted-foreground">
                The calendar gives you an overview of the days customers can come by your store and 
                collect a Surprise Bag. The days shown in the calendar match your weekly schedule, but if 
                there are temporary changes to your schedule, you can add these as special days here.
              </p>
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-sm text-blue-800">
                  Click on a date to see details about the day or to make changes.
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-semibold">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {getDaysInMonth(currentMonth).map((date, index) => {
                  const status = getDayStatus(date);
                  const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                  const isSelected = selectedDate && 
                    date.getDate() === selectedDate.getDate() && 
                    date.getMonth() === selectedDate.getMonth() &&
                    date.getFullYear() === selectedDate.getFullYear();

                  return (
                    <button
                      key={index}
                      onClick={() => isCurrentMonth && setSelectedDate(date)}
                      className={`
                        relative h-12 w-full border border-gray-200 text-sm font-medium
                        ${isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'}
                        ${isSelected ? 'ring-2 ring-primary' : ''}
                      `}
                    >
                      <span className={isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}>
                        {date.getDate()}
                      </span>
                      {isCurrentMonth && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                          {status === 'collection' && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                          {status === 'no-collection' && (
                            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Collection</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  <span>No collection</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>Collection (special day)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-800 rounded-full"></div>
                  <span>No collection (special day)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-gray-400 rounded-full"></div>
                  <span>Confirmation needed</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Save Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}