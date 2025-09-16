import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertTriangle, Target, Calendar, TrendingUp } from 'lucide-react';

interface TimelineEvent {
  date: Date;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming' | 'overdue';
  type: 'milestone' | 'deadline' | 'recommendation' | 'mandate';
  priority: 'low' | 'medium' | 'high' | 'critical';
  daysFromNow: number;
}

const ComplianceTimeline = () => {
  const timelineEvents: TimelineEvent[] = [
    {
      date: new Date('2024-09-01'),
      title: 'Baseline Data Collection Started',
      description: 'Began tracking current waste volumes and patterns',
      status: 'completed',
      type: 'milestone',
      priority: 'medium',
      daysFromNow: -30
    },
    {
      date: new Date('2024-10-15'),
      title: 'POS Integration Completed',
      description: 'Connected Square POS for automated waste predictions',
      status: 'completed',
      type: 'milestone',
      priority: 'high',
      daysFromNow: -5
    },
    {
      date: new Date('2024-10-25'),
      title: 'Monthly Bin Trim Report Due',
      description: 'Submit monthly waste data to Bin Trim program',
      status: 'current',
      type: 'deadline',
      priority: 'critical',
      daysFromNow: 5
    },
    {
      date: new Date('2024-11-01'),
      title: 'Waste Reduction Strategy Review',
      description: 'Evaluate current practices and implement improvements',
      status: 'upcoming',
      type: 'recommendation',
      priority: 'medium',
      daysFromNow: 12
    },
    {
      date: new Date('2024-12-01'),
      title: 'Holiday Season Preparation',
      description: 'Prepare for 25% increase in organic waste during holidays',
      status: 'upcoming',
      type: 'recommendation',
      priority: 'high',
      daysFromNow: 42
    },
    {
      date: new Date('2025-03-15'),
      title: 'Predicted Threshold Breach',
      description: 'Based on current trends, may exceed 1,920L/week threshold',
      status: 'upcoming',
      type: 'milestone',
      priority: 'high',
      daysFromNow: 146
    },
    {
      date: new Date('2026-01-01'),
      title: 'FOGO Preparation Recommended',
      description: 'Begin preparing for FOGO separation system implementation',
      status: 'upcoming',
      type: 'recommendation',
      priority: 'medium',
      daysFromNow: 438
    },
    {
      date: new Date('2028-07-01'),
      title: 'FOGO Mandate Effective',
      description: 'Mandatory FOGO separation required (if exceeding 1,920L/week)',
      status: 'upcoming',
      type: 'mandate',
      priority: 'critical',
      daysFromNow: 1364
    }
  ];

  const getStatusIcon = (status: string, type: string) => {
    if (status === 'completed') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === 'overdue') return <AlertTriangle className="w-5 h-5 text-red-600" />;
    if (type === 'mandate') return <Target className="w-5 h-5 text-purple-600" />;
    if (type === 'deadline') return <Clock className="w-5 h-5 text-orange-600" />;
    return <Calendar className="w-5 h-5 text-blue-600" />;
  };

  const getStatusColor = (status: string, priority: string) => {
    if (status === 'completed') return 'border-green-200 bg-green-50';
    if (status === 'overdue') return 'border-red-200 bg-red-50';
    if (status === 'current' && priority === 'critical') return 'border-red-200 bg-red-50';
    if (status === 'current') return 'border-orange-200 bg-orange-50';
    if (priority === 'critical') return 'border-purple-200 bg-purple-50';
    if (priority === 'high') return 'border-yellow-200 bg-yellow-50';
    return 'border-gray-200 bg-gray-50';
  };

  const getPriorityBadge = (priority: string, type: string) => {
    if (type === 'mandate') return 'bg-purple-100 text-purple-700';
    if (priority === 'critical') return 'bg-red-100 text-red-700';
    if (priority === 'high') return 'bg-orange-100 text-orange-700';
    if (priority === 'medium') return 'bg-yellow-100 text-yellow-700';
    return 'bg-blue-100 text-blue-700';
  };

  const formatDaysFromNow = (days: number) => {
    if (days < 0) return `${Math.abs(days)} days ago`;
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 30) return `In ${days} days`;
    if (days < 365) return `In ${Math.round(days / 30)} months`;
    return `In ${Math.round(days / 365)} years`;
  };

  // Calculate overall progress
  const completedEvents = timelineEvents.filter(e => e.status === 'completed').length;
  const totalEvents = timelineEvents.length;
  const progressPercentage = (completedEvents / totalEvents) * 100;

  const currentEvents = timelineEvents.filter(e => e.status === 'current');
  const upcomingCritical = timelineEvents.filter(e => 
    e.status === 'upcoming' && e.priority === 'critical' && e.daysFromNow <= 90
  );

  return (
    <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              Compliance Timeline
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                AI-Tracked
              </Badge>
            </CardTitle>
            <CardDescription>
              Automated milestone tracking and mandate preparation
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-white rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">{completedEvents}/{totalEvents}</span>
            </div>
            <Progress value={progressPercentage} className="h-2 mb-2" />
            <p className="text-xs text-gray-600">{Math.round(progressPercentage)}% complete</p>
          </div>
          
          <div className="p-4 bg-white rounded-lg border">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{currentEvents.length}</div>
              <div className="text-sm text-gray-600">Active Items</div>
            </div>
          </div>
          
          <div className="p-4 bg-white rounded-lg border">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{upcomingCritical.length}</div>
              <div className="text-sm text-gray-600">Critical Upcoming</div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {timelineEvents.map((event, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg border-l-4 ${getStatusColor(event.status, event.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(event.status, event.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{event.title}</h4>
                      <Badge className={getPriorityBadge(event.priority, event.type)}>
                        {event.type === 'mandate' ? 'Mandate' : event.priority}
                      </Badge>
                      {event.status === 'current' && (
                        <Badge className="bg-blue-100 text-blue-700">Current</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>{event.date.toLocaleDateString()}</span>
                      <span>{formatDaysFromNow(event.daysFromNow)}</span>
                      {event.type === 'deadline' && event.daysFromNow <= 7 && event.daysFromNow > 0 && (
                        <Badge variant="outline" className="text-red-600 border-red-300">
                          Due Soon
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Key Milestones Summary */}
        <div className="mt-6 p-4 bg-white rounded-lg border">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            Key Mandate Dates
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-2 bg-red-50 rounded">
              <div className="font-medium text-red-700">July 1, 2026</div>
              <div className="text-red-600">≥3,840L/week</div>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded">
              <div className="font-medium text-yellow-700">July 1, 2028</div>
              <div className="text-yellow-600">≥1,920L/week</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="font-medium text-green-700">July 1, 2030</div>
              <div className="text-green-600">≥660L/week</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceTimeline;