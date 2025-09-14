import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTaskList } from "@/hooks/useTaskList";
import { AlertTriangle, Clock, BarChart3, CheckCircle } from "lucide-react";

export default function AutoTaskSummary() {
  const { tasks } = useTaskList();
  
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
    <Card className="bg-white backdrop-blur-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Tareas Automáticas de Inventario
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingTasks.length === 0 ? (
          <div className="text-center py-4">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              ¡Perfecto! No hay tareas pendientes de inventario.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stock Alerts Section */}
            {stockAlerts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">
                    Alertas de Stock ({stockAlerts.length})
                  </span>
                </div>
                <div className="space-y-2 ml-6">
                  {stockAlerts.slice(0, 3).map((task) => (
                    <div key={task.id} className="text-xs text-gray-600 flex items-center gap-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      {task.title}
                    </div>
                  ))}
                  {stockAlerts.length > 3 && (
                    <div className="text-xs text-gray-500 ml-2">
                      +{stockAlerts.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Expiry Alerts Section */}
            {expiryAlerts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-700">
                    Productos Expirando ({expiryAlerts.length})
                  </span>
                </div>
                <div className="space-y-2 ml-6">
                  {expiryAlerts.slice(0, 3).map((task) => (
                    <div key={task.id} className="text-xs text-gray-600 flex items-center gap-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      {task.title}
                    </div>
                  ))}
                  {expiryAlerts.length > 3 && (
                    <div className="text-xs text-gray-500 ml-2">
                      +{expiryAlerts.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analytics Tasks Section */}
            {analyticsTask.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700">
                    Análisis de Inventario
                  </span>
                </div>
                <div className="space-y-2 ml-6">
                  {analyticsTask.map((task) => (
                    <div key={task.id} className="text-xs text-gray-600 flex items-center gap-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                💬 Ve al chatbot para gestionar estas tareas y actualizar tu inventario
              </p>
            </div>
          </div>
        )}

        {completedTasks.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-700">
                Completadas ({completedTasks.length})
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}