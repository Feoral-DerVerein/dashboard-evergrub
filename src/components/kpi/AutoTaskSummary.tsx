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
  return;
}