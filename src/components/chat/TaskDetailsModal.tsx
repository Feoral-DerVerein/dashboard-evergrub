import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/hooks/useTaskList';
import { Package, Calendar, DollarSign, Hash, Tag } from 'lucide-react';

interface TaskDetailsModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (task: Task) => void;
}

const TaskDetailsModal = ({ task, open, onOpenChange, onSend }: TaskDetailsModalProps) => {
  if (!task) return null;

  const handleSend = () => {
    onSend(task);
    onOpenChange(false);
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-modal sm:max-w-md border-white/30 bg-white/20 backdrop-blur-md shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            Task Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Task Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
              <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{task.description}</p>
          </div>

          {/* Product Details (if available) */}
          {task.product && (
            <div className="glass-card p-4 space-y-4">
              <h4 className="font-medium text-gray-800 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Product Information
              </h4>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <p className="font-medium text-gray-900">{task.product.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-gray-500">Quantity:</span>
                    <p className="font-medium text-gray-900">{task.product.quantity} units</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <p className="font-medium text-gray-900">{task.product.category}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-gray-500">Price:</span>
                    <p className="font-medium text-gray-900">${task.product.price}</p>
                  </div>
                </div>
                
                <div className="col-span-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-gray-500">Expiry Date:</span>
                    <p className="font-medium text-gray-900">
                      {new Date(task.product.expirationDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Task Metadata */}
          <div className="glass-card p-4 space-y-3">
            <h4 className="font-medium text-gray-800">Task Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Type:</span>
                <span className="font-medium text-gray-900 capitalize">{task.cardType.replace('-', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created:</span>
                <span className="font-medium text-gray-900">
                  {task.createdAt.toLocaleDateString('en-US')} at {task.createdAt.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className={`font-medium ${task.completed ? 'text-green-600' : 'text-amber-600'}`}>
                  {task.completed ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Send Button */}
        <div className="flex justify-end pt-4 border-t border-white/20">
          <Button 
            onClick={handleSend}
            className="glass-button bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 border border-emerald-200/50"
          >
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsModal;