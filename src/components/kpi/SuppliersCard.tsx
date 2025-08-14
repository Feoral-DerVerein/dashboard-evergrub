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
        <CardTitle>Suppliers</CardTitle>
      </CardHeader>
      <CardContent>
        {partners.length === 0 ? (
          <p className="text-muted-foreground">No suppliers found</p>
        ) : (
          <div className="space-y-3">
            {partners.map((partner) => (
              <div key={partner.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{partner.name}</h4>
                  <p className="text-sm text-muted-foreground capitalize">{partner.type}</p>
                </div>
                <Link 
                  to="/partners" 
                  className="text-primary hover:underline text-sm"
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