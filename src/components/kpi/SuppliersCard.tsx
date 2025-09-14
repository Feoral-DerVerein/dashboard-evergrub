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
  return;
}