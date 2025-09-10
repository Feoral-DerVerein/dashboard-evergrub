import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Supplier {
  id: string;
  name: string;
  type: string;
}

interface SuppliersCardProps {
  suppliers: Supplier[];
}

export default function SuppliersCard({
  suppliers
}: SuppliersCardProps) {
  return (
    <Card className="bg-white/80">
      <CardHeader>
        <CardTitle>Suppliers</CardTitle>
      </CardHeader>
      <CardContent>
        {suppliers.length === 0 ? (
          <p className="text-muted-foreground">No suppliers found</p>
        ) : (
          <div className="space-y-3">
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{supplier.name}</h4>
                  <p className="text-sm text-muted-foreground capitalize">{supplier.type}</p>
                </div>
                <div className="text-primary text-sm">
                  Active
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}