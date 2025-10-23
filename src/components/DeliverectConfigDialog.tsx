import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Check, X } from "lucide-react";
import deliverectService from "@/services/deliverectService";

interface DeliverectConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeliverectConfigDialog = ({ open, onOpenChange }: DeliverectConfigDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    api_key: "",
    location_id: "",
    account_id: "",
    webhook_url: "",
    auto_sync_enabled: true,
  });

  useEffect(() => {
    if (open) {
      loadConnection();
    }
  }, [open]);

  const loadConnection = async () => {
    try {
      const connection = await deliverectService.getConnection();
      if (connection) {
        setFormData({
          api_key: connection.api_key,
          location_id: connection.location_id,
          account_id: connection.account_id || "",
          webhook_url: connection.webhook_url || "",
          auto_sync_enabled: connection.auto_sync_enabled,
        });
      }
    } catch (error) {
      console.error("Error loading connection:", error);
    }
  };

  const handleTestConnection = async () => {
    if (!formData.api_key || !formData.location_id) {
      toast.error("Please enter API Key and Location ID");
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const isValid = await deliverectService.testConnection(
        formData.api_key,
        formData.location_id
      );
      
      setTestResult(isValid);
      
      if (isValid) {
        toast.success("Connection successful!");
      } else {
        toast.error("Connection failed. Please check your credentials.");
      }
    } catch (error) {
      setTestResult(false);
      toast.error("Error testing connection");
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!formData.api_key || !formData.location_id) {
      toast.error("API Key and Location ID are required");
      return;
    }

    setLoading(true);

    try {
      await deliverectService.saveConnection({
        api_key: formData.api_key,
        location_id: formData.location_id,
        account_id: formData.account_id || undefined,
        webhook_url: formData.webhook_url || undefined,
        auto_sync_enabled: formData.auto_sync_enabled,
        connection_status: 'active',
      });

      toast.success("Delivery connection saved successfully!");
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving connection:", error);
      toast.error("Failed to save connection");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);

    try {
      await deliverectService.deleteConnection();
      toast.success("Delivery platform disconnected successfully");
      setFormData({
        api_key: "",
        location_id: "",
        account_id: "",
        webhook_url: "",
        auto_sync_enabled: true,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast.error("Failed to disconnect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Delivery Platform Configuration</DialogTitle>
          <DialogDescription>
            Configure your delivery platform API credentials to enable product delivery integration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="api_key">API Key *</Label>
            <Input
              id="api_key"
              type="password"
              placeholder="Enter your delivery platform API key"
              value={formData.api_key}
              onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_id">Location ID *</Label>
            <Input
              id="location_id"
              placeholder="Enter your delivery platform location ID"
              value={formData.location_id}
              onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_id">Account ID (Optional)</Label>
            <Input
              id="account_id"
              placeholder="Enter your delivery platform account ID"
              value={formData.account_id}
              onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook_url">Webhook URL (Optional)</Label>
            <Input
              id="webhook_url"
              placeholder="https://your-webhook-url.com"
              value={formData.webhook_url}
              onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="auto_sync">Auto-sync inventory</Label>
            <Switch
              id="auto_sync"
              checked={formData.auto_sync_enabled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, auto_sync_enabled: checked })
              }
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={testing || !formData.api_key || !formData.location_id}
              className="flex-1"
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : testResult === true ? (
                <>
                  <Check className="mr-2 h-4 w-4 text-green-600" />
                  Connected
                </>
              ) : testResult === false ? (
                <>
                  <X className="mr-2 h-4 w-4 text-red-600" />
                  Failed
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
          </div>
        </div>

        <div className="flex justify-between gap-2">
          <Button
            variant="destructive"
            onClick={handleDisconnect}
            disabled={loading || !formData.api_key}
          >
            Disconnect
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Connection"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
