import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Partner } from "@/services/partnersService";
import { Link } from "react-router-dom";
interface SuppliersCardProps {
  partners: Partner[];
}
export default function SuppliersCard({
  partners
}: SuppliersCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Suppliers</CardTitle>
      </CardHeader>
      <CardContent>
        {partners.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No suppliers found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {partners.slice(0, 5).map((partner) => (
              <div key={partner.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <h4 className="font-medium">{partner.name}</h4>
                  <p className="text-sm text-muted-foreground">{partner.type}</p>
                </div>
                <Link 
                  to="/partners" 
                  className="text-sm text-primary hover:underline"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}