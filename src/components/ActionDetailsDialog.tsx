import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, TrendingUp, TrendingDown, DollarSign, Package, Clock, Percent } from "lucide-react";

interface ActionDetails {
  title: string;
  description: string;
  impact: {
    financial?: string;
    inventory?: string;
    environmental?: string;
    timeframe?: string;
  };
  changes: string[];
  risks?: string[];
  benefits: string[];
}

interface ActionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionDetails: ActionDetails | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ActionDetailsDialog = ({ 
  open, 
  onOpenChange, 
  actionDetails, 
  onConfirm, 
  onCancel 
}: ActionDetailsDialogProps) => {
  if (!actionDetails) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            {actionDetails.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Description */}
          <div>
            <p className="text-gray-700">{actionDetails.description}</p>
          </div>

          {/* Impact Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actionDetails.impact.financial && (
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <h4 className="font-semibold text-green-700">Financial Impact</h4>
                </div>
                <p className="text-green-800">{actionDetails.impact.financial}</p>
              </div>
            )}
            
            {actionDetails.impact.inventory && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <h4 className="font-semibold text-blue-700">Inventory Impact</h4>
                </div>
                <p className="text-blue-800">{actionDetails.impact.inventory}</p>
              </div>
            )}
            
            {actionDetails.impact.environmental && (
              <div className="bg-emerald-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-semibold text-emerald-700">Environmental Impact</h4>
                </div>
                <p className="text-emerald-800">{actionDetails.impact.environmental}</p>
              </div>
            )}
            
            {actionDetails.impact.timeframe && (
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <h4 className="font-semibold text-purple-700">Timeframe</h4>
                </div>
                <p className="text-purple-800">{actionDetails.impact.timeframe}</p>
              </div>
            )}
          </div>

          {/* Changes */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Percent className="w-4 h-4" />
              Specific Changes
            </h4>
            <ul className="space-y-2">
              {actionDetails.changes.map((change, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{change}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Expected Benefits
            </h4>
            <ul className="space-y-2">
              {actionDetails.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-green-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Risks */}
          {actionDetails.risks && actionDetails.risks.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Considerations and Risks
              </h4>
              <ul className="space-y-2">
                {actionDetails.risks.map((risk, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-amber-700">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700">
            Confirm Action
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};