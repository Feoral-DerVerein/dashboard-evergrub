import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { predictiveAnalyticsService, EventData } from '@/services/predictiveAnalyticsService';
import { Calendar, TrendingUp, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const EventsCalendar = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const eventsData = await predictiveAnalyticsService.getUpcomingEvents();
      setEvents(eventsData);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const getImpactColor = (impact: number) => {
    if (impact > 40) return 'destructive';
    if (impact > 25) return 'default';
    return 'secondary';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <CardTitle>Events Calendar</CardTitle>
        </div>
        <CardDescription>Holidays and events that affect demand</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.map((event, index) => (
            <div
              key={index}
              className="p-4 border border-border rounded-lg space-y-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">{event.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <Badge variant={getImpactColor(event.impact)}>
                  +{event.impact}% demand
                </Badge>
              </div>

              <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-md">
                <Package className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-foreground">
                    Suggested Stock
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {event.suggestedStock}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {events.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No upcoming events registered</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventsCalendar;
