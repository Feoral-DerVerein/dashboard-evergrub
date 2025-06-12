
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, TrendingUp, TrendingDown, ShoppingCart } from 'lucide-react';
import { GrainTransaction } from '@/services/grainService';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface TransactionHistoryProps {
  transactions: GrainTransaction[];
  loading: boolean;
}

const TransactionHistory = ({ transactions, loading }: TransactionHistoryProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Transacciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'redeemed':
        return <TrendingDown className="h-4 w-4 text-blue-600" />;
      case 'purchased_with':
        return <ShoppingCart className="h-4 w-4 text-purple-600" />;
      default:
        return <History className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case 'earned':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Ganados</Badge>;
      case 'redeemed':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Canjeados</Badge>;
      case 'purchased_with':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Usados</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Historial de Transacciones
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay transacciones aún</p>
            <p className="text-sm text-gray-400">
              Tus transacciones de grains aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getTransactionIcon(transaction.type)}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(parseISO(transaction.created_at), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                    </p>
                    {transaction.cash_value > 0 && (
                      <p className="text-sm text-green-600 font-medium">
                        Dinero: ${transaction.cash_value.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'earned' ? '+' : '-'}{transaction.amount.toLocaleString()} grains
                    </p>
                  </div>
                  {getTransactionBadge(transaction.type)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
