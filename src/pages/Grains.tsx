
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useGrains } from '@/hooks/useGrains';
import GrainBalance from '@/components/grains/GrainBalance';
import RedeemGrains from '@/components/grains/RedeemGrains';
import TransactionHistory from '@/components/grains/TransactionHistory';

const Grains = () => {
  const { balance, transactions, loading, refreshData, redeemGrains } = useGrains();

  return (
      <>
        {/* Header */}
        <header className="sticky top-0 glass-card border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link 
                to="/dashboard" 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold">My Grains</h1>
                <p className="text-sm text-gray-500">Manage your points and redemptions</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="px-6 py-6 space-y-6">
          {/* Balance Cards */}
          <GrainBalance balance={balance} loading={loading} />

          {/* Redeem Section */}
          <RedeemGrains 
            balance={balance} 
            onRedeem={redeemGrains}
            loading={loading}
          />

          {/* Transaction History */}
          <TransactionHistory 
            transactions={transactions} 
            loading={loading}
          />
        </main>
        </>
  );
};

export default Grains;
