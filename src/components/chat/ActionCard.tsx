import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActionCardData } from '@/types/chatbot.types';
import { cn } from '@/lib/utils';

interface ActionCardProps {
  data: ActionCardData;
  onClick: () => void;
}

const priorityColors = {
  high: 'bg-red-500/10 text-red-700 border-red-200 dark:text-red-400',
  medium: 'bg-orange-500/10 text-orange-700 border-orange-200 dark:text-orange-400',
  low: 'bg-yellow-500/10 text-yellow-700 border-yellow-200 dark:text-yellow-400'
};

export const ActionCard = ({ data, onClick }: ActionCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-primary"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">{data.productName}</h4>
            <p className="text-sm text-muted-foreground">{data.action}</p>
          </div>
          <Badge 
            variant="outline" 
            className={cn('capitalize', priorityColors[data.priority])}
          >
            {data.priority}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
