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
    <Card>
      <CardHeader>
        <CardTitle>Suppliers</CardTitle>
      </CardHeader>
      <CardContent>
        {suppliers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No suppliers available</p>
        ) : (
          <div className="space-y-2">
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="p-2 border rounded">
                <h4 className="font-medium">{supplier.name}</h4>
                <p className="text-sm text-muted-foreground">{supplier.type}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}