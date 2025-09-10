import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Trash2, Package, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import { Task } from '@/hooks/useTaskList';

interface TaskListProps {
  tasks: Task[];
  onCompleteTask: (taskId: string) => void;
  onRemoveTask: (taskId: string) => void;
  onClearCompleted: () => void;
}

const TaskList = ({ tasks, onCompleteTask, onRemoveTask, onClearCompleted }: TaskListProps) => {
  const getCardIcon = (cardType: Task['cardType']) => {
    switch (cardType) {
      case 'inventory': return <Package className="w-4 h-4" />;
      case 'expiry': return <AlertTriangle className="w-4 h-4" />;
      case 'sales': return <TrendingUp className="w-4 h-4" />;
      case 'recommendation': return <Zap className="w-4 h-4" />;
      case 'alert': return <AlertTriangle className="w-4 h-4" />;
      case 'analytics': return <TrendingUp className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  const completedCount = completedTasks.length;

  if (tasks.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Task List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No pending tasks</p>
            <p className="text-sm mt-1">Chatbot cards will appear here when you add tasks</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Task List ({pendingTasks.length} pending)
          </CardTitle>
          {completedCount > 0 && (
            <Button 
              onClick={onClearCompleted}
              variant="outline" 
              size="sm"
              className="text-xs"
            >
              Clear completed ({completedCount})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {pendingTasks.map((task) => (
            <div 
              key={task.id} 
              className="border rounded-lg p-4 bg-white hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">
                    {getCardIcon(task.cardType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{task.title}</h4>
                      <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    <div className="text-xs text-gray-400">
                      Added: {task.createdAt.toLocaleString('en-US')}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => onCompleteTask(task.id)}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => onRemoveTask(task.id)}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {completedTasks.length > 0 && (
            <>
              <div className="border-t pt-4 mt-4">
                <h5 className="text-sm font-medium text-gray-500 mb-3">Completed ({completedCount})</h5>
                {completedTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="border rounded-lg p-3 bg-gray-50 opacity-60 mb-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 line-through">{task.title}</h5>
                          <p className="text-xs text-gray-500">
                            Completed: {task.createdAt.toLocaleString('en-US')}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => onRemoveTask(task.id)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskList;