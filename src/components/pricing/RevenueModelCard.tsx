import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface RevenueModelCardProps {
  icon: LucideIcon;
  title: string;
  concept: string;
  value: string;
  description: string;
}

export const RevenueModelCard = ({
  icon: Icon,
  title,
  concept,
  value,
  description,
}: RevenueModelCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-border/50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-foreground">{title}</h3>
              <span className="text-2xl font-bold text-primary">{value}</span>
            </div>
            
            <p className="text-sm font-medium text-muted-foreground">{concept}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
