import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CheckCircle2, Clock, Trash2, Package, AlertTriangle, TrendingUp, Zap, ShoppingCart, Building2, Heart, Archive, Eye, EyeOff } from 'lucide-react';
import { Task } from '@/hooks/useTaskList';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DonationForm } from '@/components/DonationForm';
import { DoneeListDialog } from '@/components/DoneeListDialog';
interface TaskListProps {
  tasks: Task[];
  onCompleteTask: (taskId: string) => void;
  onRemoveTask: (taskId: string) => void;
  onArchiveTask: (taskId: string) => void;
  onClearCompleted: () => void;
  onTakeAction?: (taskId: string, action: Task['actionTaken']) => void;
}
const TaskList = ({
  tasks,
  onCompleteTask,
  onRemoveTask,
  onArchiveTask,
  onClearCompleted,
  onTakeAction
}: TaskListProps) => {
  const navigate = useNavigate();
  const [showDonationDialog, setShowDonationDialog] = useState(false);
  const [showDoneeListDialog, setShowDoneeListDialog] = useState(false);
  const [showArchivedTasks, setShowArchivedTasks] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Task['product'] | null>(null);
  const handleActionClick = (taskId: string, action: Task['actionTaken'], product?: Task['product']) => {
    // Call the original action handler
    onTakeAction?.(taskId, action);

    // Handle navigation based on action
    switch (action) {
      case 'b2c-discount':
        // Navigate to create surprise bag for marketplace
        navigate('/products/add', {
          state: {
            product: product,
            action: 'create-surprise-bag',
            mode: 'surprise-bag'
          }
        });
        break;
      case 'b2b-offer':
        // Navigate to market page to list for B2B sale
        navigate('/market', {
          state: {
            product: product,
            action: 'list-for-sale'
          }
        });
        break;
      case 'donate':
        // Show donee list first, then donation form
        setSelectedProduct(product || null);
        setShowDoneeListDialog(true);
        break;
    }
  };
  const getCardIcon = (cardType: Task['cardType']) => {
    switch (cardType) {
      case 'inventory':
        return <Package className="w-4 h-4" />;
      case 'expiry':
        return <AlertTriangle className="w-4 h-4" />;
      case 'sales':
        return <TrendingUp className="w-4 h-4" />;
      case 'recommendation':
        return <Zap className="w-4 h-4" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4" />;
      case 'analytics':
        return <TrendingUp className="w-4 h-4" />;
      case 'product-decision':
        return <Package className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };
  const getActionIcon = (action: Task['actionTaken']) => {
    switch (action) {
      case 'b2c-discount':
        return <ShoppingCart className="w-4 h-4" />;
      case 'b2b-offer':
        return <Building2 className="w-4 h-4" />;
      case 'donate':
        return <Heart className="w-4 h-4" />;
      default:
        return null;
    }
  };
  const getActionLabel = (action: Task['actionTaken']) => {
    switch (action) {
      case 'b2c-discount':
        return 'Create Surprise Bag';
      case 'b2b-offer':
        return 'B2B Market Sale';
      case 'donate':
        return 'Donate';
      default:
        return '';
    }
  };
  const getActionColor = (action: Task['actionTaken']) => {
    switch (action) {
      case 'b2c-discount':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'b2b-offer':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'donate':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
  const pendingTasks = tasks.filter(task => !task.completed && !task.archived);
  const completedTasks = tasks.filter(task => task.completed && !task.archived);
  const archivedTasks = tasks.filter(task => task.archived);
  const completedCount = completedTasks.length;
  const archivedCount = archivedTasks.length;
  if (tasks.length === 0) {
    return <Card className="w-full">
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
      </Card>;
  }
  return <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Task List ({pendingTasks.length} pending)
            </CardTitle>
            {archivedCount > 0 && <Button onClick={() => setShowArchivedTasks(!showArchivedTasks)} variant="ghost" size="sm" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground" title={showArchivedTasks ? "Hide archived tasks" : "Show archived tasks"}>
                {showArchivedTasks ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                Archived ({archivedCount})
              </Button>}
          </div>
          {completedCount > 0 && <Button onClick={onClearCompleted} variant="outline" size="sm" className="text-xs">
              Clear completed ({completedCount})
            </Button>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {pendingTasks.map(task => <div key={task.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-all duration-200">
              {task.cardType === 'product-decision' && task.product ?
          // Product Decision Card
          <div className="space-y-4">
                  {/* Product Header */}
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{task.product.name}</h4>
                        <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Quantity: {task.product.quantity} units</p>
                        <p>Category: {task.product.category}</p>
                        <p>Price: ${task.product.price}</p>
                        <p>Expires: {new Date(task.product.expirationDate).toLocaleDateString('en-US')}</p>
                      </div>
                    </div>
                    <Button onClick={() => onArchiveTask(task.id)} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600" title="Archive task">
                      <Archive className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Suggested Action */}
                  {task.suggestedAction && <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">AI Suggested Action</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getActionIcon(task.suggestedAction)}
                        <span className="text-sm text-blue-700">{getActionLabel(task.suggestedAction)}</span>
                      </div>
                    </div>}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Action Options:</p>
                    <div className="flex gap-2">
                      <Button onClick={() => handleActionClick(task.id, 'b2c-discount', task.product)} variant={task.suggestedAction === 'b2c-discount' ? 'default' : 'outline'} size="sm" className="flex-1 flex items-center gap-1">
                        <ShoppingCart className="w-3 h-3" />
                        <span className="text-xs">Surprise Bag</span>
                        {task.suggestedAction === 'b2c-discount' && <Badge variant="secondary" className="text-xs ml-1">★</Badge>}
                      </Button>
                      
                      <Button onClick={() => handleActionClick(task.id, 'b2b-offer', task.product)} variant={task.suggestedAction === 'b2b-offer' ? 'default' : 'outline'} size="sm" className="flex-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        <span className="text-xs">B2B Sale</span>
                        {task.suggestedAction === 'b2b-offer' && <Badge variant="secondary" className="text-xs ml-1">★</Badge>}
                      </Button>
                      
                      <Button onClick={() => handleActionClick(task.id, 'donate', task.product)} variant={task.suggestedAction === 'donate' ? 'default' : 'outline'} size="sm" className="flex-1 flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span className="text-xs">Donate</span>
                        {task.suggestedAction === 'donate' && <Badge variant="secondary" className="text-xs ml-1">★</Badge>}
                      </Button>
                    </div>
                  </div>
                </div> :
          // Regular Task Card
          <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getCardIcon(task.cardType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
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
                    <Button onClick={() => onArchiveTask(task.id)} variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-yellow-50 hover:text-yellow-600" title="Archive task">
                      <Archive className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Action Buttons for Regular Tasks */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Action Options:</p>
                    <div className="flex gap-2">
                      <Button onClick={() => handleActionClick(task.id, 'b2c-discount', task.product || {
                  id: parseInt(task.id),
                  name: task.title,
                  quantity: 1,
                  expirationDate: new Date().toISOString().split('T')[0],
                  category: 'General',
                  price: 0,
                  image: '/placeholder.svg'
                })} variant="outline" size="sm" className="flex-1 flex items-center gap-1">
                        <ShoppingCart className="w-3 h-3" />
                        <span className="text-xs">Surprise Bag</span>
                      </Button>
                      
                      <Button onClick={() => handleActionClick(task.id, 'b2b-offer', task.product || {
                  id: parseInt(task.id),
                  name: task.title,
                  quantity: 1,
                  expirationDate: new Date().toISOString().split('T')[0],
                  category: 'General',
                  price: 0,
                  image: '/placeholder.svg'
                })} variant="outline" size="sm" className="flex-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        <span className="text-xs">B2B Sale</span>
                      </Button>
                      
                      <Button onClick={() => handleActionClick(task.id, 'donate', task.product || {
                  id: parseInt(task.id),
                  name: task.title,
                  quantity: 1,
                  expirationDate: new Date().toISOString().split('T')[0],
                  category: 'General',
                  price: 0,
                  image: '/placeholder.svg'
                })} variant="outline" size="sm" className="flex-1 flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span className="text-xs">Donate</span>
                      </Button>
                    </div>
                  </div>
                </div>}
            </div>)}
          
          {completedTasks.length > 0 && <>
              <div className="border-t pt-4 mt-4">
                <h5 className="text-sm font-medium text-gray-500 mb-3">Completed ({completedCount})</h5>
                {completedTasks.map(task => <div key={task.id} className="border rounded-lg p-3 bg-gray-50 opacity-60 mb-2">
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
                      <Button onClick={() => onArchiveTask(task.id)} variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-yellow-50 hover:text-yellow-600" title="Archive task">
                        <Archive className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>)}
              </div>
            </>}
          
          {/* Archived Tasks */}
          {showArchivedTasks && archivedCount > 0 && <>
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Archive className="w-4 h-4" />
                  Archived Tasks ({archivedCount})
                </h4>
                <div className="space-y-2">
                  {archivedTasks.map(task => <div key={task.id} className="p-3 bg-muted/30 rounded-lg border border-muted">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Archive className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <h5 className="text-sm font-medium text-muted-foreground">{task.title}</h5>
                            <p className="text-xs text-muted-foreground">
                              Archived: {task.createdAt.toLocaleString('en-US')}
                            </p>
                          </div>
                        </div>
                        
                      </div>
                    </div>)}
                </div>
              </div>
            </>}
        </div>
      </CardContent>

      
      {/* Donee Selection Dialog */}
      <DoneeListDialog open={showDoneeListDialog} onOpenChange={setShowDoneeListDialog} product={selectedProduct} onSelectDonee={donee => {
      setShowDoneeListDialog(false);
      setShowDonationDialog(true);
    }} />

      {/* Donation Dialog */}
      <Dialog open={showDonationDialog} onOpenChange={setShowDonationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Donate {selectedProduct?.name || 'Product'}</DialogTitle>
          </DialogHeader>
          <DonationForm onClose={() => {
          setShowDonationDialog(false);
          setSelectedProduct(null);
        }} product={selectedProduct} />
        </DialogContent>
      </Dialog>
    </Card>;
};
export default TaskList;