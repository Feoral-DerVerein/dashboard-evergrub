import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTaskList } from "@/hooks/useTaskList";
import { AlertTriangle, Clock, BarChart3, CheckCircle } from "lucide-react";
export default function AutoTaskSummary() {
  const {
    tasks
  } = useTaskList();
  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  const stockAlerts = pendingTasks.filter(task => task.cardType === 'alert');
  const expiryAlerts = pendingTasks.filter(task => task.cardType === 'expiry');
  const analyticsTask = pendingTasks.filter(task => task.cardType === 'analytics');
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Auto Task Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{pendingTasks.length}</div>
            <div className="text-sm text-muted-foreground">Pending Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{stockAlerts.length}</div>
            <div className="text-sm text-muted-foreground">Stock Alerts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{expiryAlerts.length}</div>
            <div className="text-sm text-muted-foreground">Expiring Soon</div>
          </div>
        </div>
        
        {pendingTasks.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Recent Tasks</h4>
            {pendingTasks.slice(0, 3).map(task => (
              <div key={task.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  {task.cardType === 'alert' && <AlertTriangle className="h-4 w-4 text-destructive" />}
                  {task.cardType === 'expiry' && <Clock className="h-4 w-4 text-orange-600" />}
                  {task.cardType === 'analytics' && <BarChart3 className="h-4 w-4 text-primary" />}
                  <span className="text-sm">{task.title}</span>
                </div>
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}