import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, AlertTriangle, Info, CheckCircle, Clock, X, TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface ComplianceAlert {
  id: string;
  type: 'mandate_approaching' | 'threshold_exceeded' | 'action_required' | 'opportunity' | 'seasonal';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  actionRequired: string;
  dueDate?: Date;
  dismissed: boolean;
  daysUntilDue?: number;
}

const SmartAlerts = () => {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([
    {
      id: '1',
      type: 'mandate_approaching',
      severity: 'high',
      title: 'FOGO Mandate Approaching',
      message: 'Current trends indicate you will exceed 1,920L/week by March 2025, triggering the July 2028 mandate requirement.',
      actionRequired: 'Consider implementing waste reduction strategies or prepare for FOGO separation',
      dueDate: new Date('2028-07-01'),
      dismissed: false,
      daysUntilDue: 180
    },
    {
      id: '2',
      type: 'seasonal',
      severity: 'medium',
      title: 'Seasonal Waste Peak Detected',
      message: 'Historical data shows 25% increase in organic waste during December-January holiday period.',
      actionRequired: 'Plan for additional FOGO capacity or temporary waste reduction measures',
      dueDate: new Date('2024-12-01'),
      dismissed: false,
      daysUntilDue: 45
    },
    {
      id: '3',
      type: 'opportunity',
      severity: 'low',
      title: 'Waste Reduction Success',
      message: 'Excellent progress! You have reduced organic waste by 18% this month through better inventory management.',
      actionRequired: 'Continue current practices and consider sharing strategies with other locations',
      dismissed: false
    },
    {
      id: '4',
      type: 'action_required',
      severity: 'critical',
      title: 'Bin Trim Report Due',
      message: 'Monthly waste data report for Bin Trim program is due in 5 days. Current completion: 60%',
      actionRequired: 'Complete missing data fields and submit report',
      dueDate: new Date('2024-10-25'),
      dismissed: false,
      daysUntilDue: 5
    },
    {
      id: '5',
      type: 'threshold_exceeded',
      severity: 'high',
      title: 'Weekly Threshold Exceeded',
      message: 'This week\'s organic waste (2,150L) exceeded your typical range. Investigation recommended.',
      actionRequired: 'Review inventory practices and check for spoilage issues',
      dismissed: false
    }
  ]);

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ));
  };

  const getAlertIcon = (type: string, severity: string) => {
    if (type === 'opportunity') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (severity === 'critical') return <AlertTriangle className="w-5 h-5 text-red-600" />;
    if (severity === 'high') return <AlertTriangle className="w-5 h-5 text-orange-600" />;
    if (severity === 'medium') return <Info className="w-5 h-5 text-yellow-600" />;
    return <Info className="w-5 h-5 text-blue-600" />;
  };

  const getAlertColor = (severity: string, type: string) => {
    if (type === 'opportunity') return 'border-green-200 bg-green-50';
    if (severity === 'critical') return 'border-red-200 bg-red-50';
    if (severity === 'high') return 'border-orange-200 bg-orange-50';
    if (severity === 'medium') return 'border-yellow-200 bg-yellow-50';
    return 'border-blue-200 bg-blue-50';
  };

  const getSeverityBadgeColor = (severity: string, type: string) => {
    if (type === 'opportunity') return 'bg-green-100 text-green-700';
    if (severity === 'critical') return 'bg-red-100 text-red-700';
    if (severity === 'high') return 'bg-orange-100 text-orange-700';
    if (severity === 'medium') return 'bg-yellow-100 text-yellow-700';
    return 'bg-blue-100 text-blue-700';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mandate_approaching': return <Calendar className="w-4 h-4" />;
      case 'threshold_exceeded': return <TrendingUp className="w-4 h-4" />;
      case 'seasonal': return <Clock className="w-4 h-4" />;
      case 'opportunity': return <DollarSign className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const activeAlerts = alerts.filter(alert => !alert.dismissed);
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');
  const highAlerts = activeAlerts.filter(alert => alert.severity === 'high');

  return (
    <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Bell className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Smart Compliance Alerts
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  AI-Powered
                </Badge>
              </CardTitle>
              <CardDescription>
                Proactive monitoring and recommendations
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            {criticalAlerts.length > 0 && (
              <Badge className="bg-red-100 text-red-700">
                {criticalAlerts.length} Critical
              </Badge>
            )}
            {highAlerts.length > 0 && (
              <Badge className="bg-orange-100 text-orange-700">
                {highAlerts.length} High Priority
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-white rounded-lg">
            <div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
            <div className="text-xs text-gray-600">Critical Alerts</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{highAlerts.length}</div>
            <div className="text-xs text-gray-600">High Priority</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {activeAlerts.filter(a => a.type === 'opportunity').length}
            </div>
            <div className="text-xs text-gray-600">Opportunities</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {activeAlerts.filter(a => a.daysUntilDue && a.daysUntilDue <= 30).length}
            </div>
            <div className="text-xs text-gray-600">Due Soon</div>
          </div>
        </div>

        {/* Alert List */}
        <div className="space-y-4">
          {activeAlerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">All good! No active alerts at this time.</p>
            </div>
          ) : (
            activeAlerts.map((alert) => (
              <Alert key={alert.id} className={`${getAlertColor(alert.severity, alert.type)} border`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getAlertIcon(alert.type, alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{alert.title}</h4>
                        <Badge className={getSeverityBadgeColor(alert.severity, alert.type)}>
                          <div className="flex items-center gap-1">
                            {getTypeIcon(alert.type)}
                            {alert.severity}
                          </div>
                        </Badge>
                        {alert.daysUntilDue && (
                          <Badge variant="outline" className="text-xs">
                            {alert.daysUntilDue} days
                          </Badge>
                        )}
                      </div>
                      <AlertDescription className="mb-3">
                        {alert.message}
                      </AlertDescription>
                      <div className="bg-white/50 p-3 rounded border-l-4 border-gray-400">
                        <p className="text-sm font-medium text-gray-800 mb-1">Recommended Action:</p>
                        <p className="text-sm text-gray-700">{alert.actionRequired}</p>
                        {alert.dueDate && (
                          <p className="text-xs text-gray-600 mt-2">
                            Due: {alert.dueDate.toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlert(alert.id)}
                    className="ml-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Alert>
            ))
          )}
        </div>

        {/* Quick Actions */}
        {activeAlerts.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            <Button size="sm" variant="outline">
              Mark All as Read
            </Button>
            <Button size="sm" variant="outline">
              Export Alert Summary
            </Button>
            <Button size="sm" variant="outline">
              Schedule Review
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartAlerts;