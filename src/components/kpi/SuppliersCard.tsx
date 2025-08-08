import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Partner } from "@/services/partnersService";
import { Link } from "react-router-dom";

interface SuppliersCardProps {
  partners: Partner[];
}

export default function SuppliersCard({ partners }: SuppliersCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Suppliers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {partners.length === 0 ? (
            <p className="text-sm text-gray-500">No suppliers yet</p>
          ) : (
            partners.slice(0, 3).map((p) => (
              <div key={p.id} className="bg-white border border-gray-100 p-3 rounded-lg">
                <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{p.name}</h4>
                <p className="text-xs text-gray-600">
                  {p.type} • {p.email}
                </p>
                {p.phone && <p className="text-xs text-gray-500">{p.phone}</p>}
              </div>
            ))
          )}
        </div>
        <Link to="/partners" className="text-sm text-blue-600 hover:underline inline-block mt-2">
          Manage suppliers
        </Link>
      </CardContent>
    </Card>
  );
}
