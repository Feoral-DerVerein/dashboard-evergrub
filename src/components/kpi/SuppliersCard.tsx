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
    <Card className="bg-white backdrop-blur-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-cyan-900">Suppliers</CardTitle>
      </CardHeader>
      <CardContent>
        {suppliers.length === 0 ? (
          <p className="text-cyan-700/80">No suppliers found</p>
        ) : (
          <div className="space-y-3">
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="flex items-center justify-between p-3 bg-cyan-100/60 rounded-lg border border-cyan-200/50">
                <div>
                  <h4 className="font-medium text-cyan-900">{supplier.name}</h4>
                  <p className="text-sm text-cyan-700/80 capitalize">{supplier.type}</p>
                </div>
                <div className="text-cyan-600 text-sm font-medium">
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