import { useState } from "react";
import { Calendar, Clock, ToggleLeft, ToggleRight } from "lucide-react";
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
  const [schedule, setSchedule] = useState<WeeklySchedule>(defaultSchedule);

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
            Organizar las horas para recoger pedidos - Configure your weekly pickup schedule and select specific dates.
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Schedule Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(schedule).map(([day, daySchedule]) => (
                <div key={day} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="min-w-[80px]">
                      <Label className="font-medium">{day}</Label>
                    </div>
                    
                    <button
                      onClick={() => toggleDay(day as keyof WeeklySchedule)}
                      className="flex items-center gap-2"
                    >
                      {daySchedule.enabled ? (
                        <>
                          <ToggleRight className="w-8 h-8 text-primary" />
                          <span className="text-sm text-primary font-medium">Collection</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-8 h-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">No collection</span>
                        </>
                      )}
                    </button>

                    {daySchedule.enabled && (
                      <>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={daySchedule.collections}
                            onChange={(e) => updateDaySchedule(day as keyof WeeklySchedule, 'collections', parseInt(e.target.value) || 1)}
                            className="w-16 h-8 text-center border rounded-md"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={daySchedule.startTime}
                            onChange={(e) => updateDaySchedule(day as keyof WeeklySchedule, 'startTime', e.target.value)}
                            className="w-20 h-8 text-xs"
                          />
                          <span className="text-xs text-muted-foreground">-</span>
                          <Input
                            type="time"
                            value={daySchedule.endTime}
                            onChange={(e) => updateDaySchedule(day as keyof WeeklySchedule, 'endTime', e.target.value)}
                            className="w-20 h-8 text-xs"
                          />
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Sales stop at {daySchedule.endTime}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
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