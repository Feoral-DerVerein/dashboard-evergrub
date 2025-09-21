import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Leaf, 
  Recycle, 
  Calculator, 
  CheckCircle, 
  Clock, 
  Download,
  AlertCircle,
  TreePine,
  Target,
  Award,
  Calendar,
  TrendingUp,
  BarChart3,
  FileText,
  Zap,
  RefreshCw,
  Globe,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const FOGOCompliance = () => {
  const { toast } = useToast();
  
  // Mock POS data simulation
  const [posData, setPosData] = useState({
    weeklyVolume: 2100,
    connected: true,
    lastSync: new Date(),
    sales: [
      { date: '2025-01-15', organicWaste: 1850, sales: 45000 },
      { date: '2025-01-16', organicWaste: 2100, sales: 52000 },
      { date: '2025-01-17', organicWaste: 1900, sales: 48000 },
      { date: '2025-01-18', organicWaste: 2300, sales: 58000 },
      { date: '2025-01-19', organicWaste: 2150, sales: 54000 },
      { date: '2025-01-20', organicWaste: 2400, sales: 61000 },
      { date: '2025-01-21', organicWaste: 2200, sales: 56000 }
    ]
  });

  const [complianceMetrics, setComplianceMetrics] = useState({
    mandateDate: 'July 1, 2028',
    daysRemaining: 1247,
    complianceProgress: 65,
    diversionRate: 78,
    contamination: 12,
    equipmentNeeded: ['In-vessel Composter', 'Food Waste Dehydrator'],
    estimatedRebate: 17500
  });

  // Calculate mandate date based on volume
  const calculateMandateDate = (volume) => {
    if (volume >= 3840) return { date: 'July 1, 2026', status: 'urgent', color: 'red' };
    if (volume >= 1920) return { date: 'July 1, 2028', status: 'planning', color: 'amber' };
    if (volume >= 660) return { date: 'July 1, 2030', status: 'future', color: 'green' };
    return { date: 'Not applicable', status: 'exempt', color: 'gray' };
  };

  // Realtime data updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPosData(prev => ({
        ...prev,
        lastSync: new Date(),
        weeklyVolume: prev.weeklyVolume + (Math.random() - 0.5) * 100
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const mandate = calculateMandateDate(posData.weeklyVolume);

  const ComplianceStatusCard = () => (
    <div className="glass-card p-6 relative overflow-hidden">
      <div className="absolute inset-0 fogo-gradient" />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center pulse-glow">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Compliance Status</h3>
            <p className="text-sm text-gray-600">Auto-synced from POS</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-700">Current Weekly Volume</span>
            <span className="font-bold text-emerald-600">{posData.weeklyVolume.toFixed(0)}L</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Mandate Applies</span>
            <Badge variant={mandate.status === 'urgent' ? 'destructive' : mandate.status === 'planning' ? 'default' : 'secondary'}>
              {mandate.date}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Days Remaining</span>
            <span className={`font-bold ${mandate.color === 'red' ? 'text-red-500' : mandate.color === 'amber' ? 'text-amber-500' : 'text-green-500'}`}>
              {complianceMetrics.daysRemaining}
            </span>
          </div>
        </div>
        
        <div className="mt-4 bg-gray-200/30 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-3 rounded-full transition-all duration-1000"
            style={{width: `${complianceMetrics.complianceProgress}%`}}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">{complianceMetrics.complianceProgress}% compliance ready</p>
      </div>
    </div>
  );

  const MandateCountdown = () => (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Clock className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Mandate Countdown</h3>
          <p className="text-sm text-gray-600">Time until implementation</p>
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-3xl font-bold text-amber-600 mb-2">{complianceMetrics.daysRemaining}</div>
        <div className="text-sm text-gray-600 mb-4">Days remaining</div>
        
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/30 rounded-lg p-2">
            <div className="text-lg font-bold text-gray-800">{Math.floor(complianceMetrics.daysRemaining / 365)}</div>
            <div className="text-xs text-gray-600">Years</div>
          </div>
          <div className="bg-white/30 rounded-lg p-2">
            <div className="text-lg font-bold text-gray-800">{Math.floor((complianceMetrics.daysRemaining % 365) / 30)}</div>
            <div className="text-xs text-gray-600">Months</div>
          </div>
          <div className="bg-white/30 rounded-lg p-2">
            <div className="text-lg font-bold text-gray-800">{complianceMetrics.daysRemaining % 30}</div>
            <div className="text-xs text-gray-600">Days</div>
          </div>
        </div>
      </div>
    </div>
  );

  const QuickActions = () => (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
          <Zap className="w-6 h-6 text-cyan-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
          <p className="text-sm text-gray-600">One-click compliance tools</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <Button 
          className="w-full justify-start bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 border-emerald-200"
          variant="outline"
          onClick={() => toast({ title: "EPA Report Generated!", description: "Automatic report ready for download" })}
        >
          <FileText className="w-4 h-4 mr-2" />
          Generate EPA Report
        </Button>
        
        <Button 
          className="w-full justify-start bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-700 border-cyan-200"
          variant="outline"
          onClick={() => window.open('https://bintrim.nsw.gov.au/assessment', '_blank')}
        >
          <Target className="w-4 h-4 mr-2" />
          Start Bin Trim Assessment
        </Button>
        
        <Button 
          className="w-full justify-start bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 border-amber-200"
          variant="outline"
          onClick={() => toast({ title: "Rebate Calculated!", description: `Eligible for $${complianceMetrics.estimatedRebate.toLocaleString()}` })}
        >
          <Calculator className="w-4 h-4 mr-2" />
          Calculate Rebates
        </Button>
      </div>
    </div>
  );

  const RealtimeWasteMetrics = () => (
    <div className="glass-card p-6 h-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Live Waste Analytics</h3>
        <div className="flex items-center gap-2 text-xs text-emerald-600">
          <div className="status-dot bg-emerald-500" />
          Connected to POS
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={posData.sales}>
          <defs>
            <linearGradient id="wasteGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <Tooltip 
            contentStyle={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px'
            }}
          />
          <Area
            type="monotone"
            dataKey="organicWaste"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#wasteGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  const FOGOPredictionChart = () => (
    <div className="glass-card p-6 h-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">FOGO Predictions</h3>
        <Badge variant="outline" className="bg-cyan-500/20 text-cyan-700">
          87% Accuracy
        </Badge>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={posData.sales}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <Tooltip 
            contentStyle={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px'
            }}
          />
          <Line
            type="monotone"
            dataKey="organicWaste"
            stroke="#06b6d4"
            strokeWidth={3}
            dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#06b6d4', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const DataFlowVisualization = () => (
    <div className="glass-card p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Automated Data Flow</h3>
      
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">POS System</span>
          <span className="text-xs text-gray-500">Sales Data</span>
        </div>
        
        <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-400 to-emerald-400 mx-4 relative">
          <div className="absolute -top-1 left-1/3 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        </div>
        
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
            <Calculator className="w-8 h-8 text-emerald-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">AI Analysis</span>
          <span className="text-xs text-gray-500">Waste Prediction</span>
        </div>
        
        <div className="flex-1 h-0.5 bg-gradient-to-r from-emerald-400 to-amber-400 mx-4 relative">
          <div className="absolute -top-1 left-2/3 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
        </div>
        
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-2">
            <FileText className="w-8 h-8 text-amber-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">Auto Reports</span>
          <span className="text-xs text-gray-500">EPA & Bin Trim</span>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div className="bg-white/30 rounded-lg p-3">
          <div className="text-lg font-bold text-blue-600">Real-time</div>
          <div className="text-xs text-gray-600">Data Sync</div>
        </div>
        <div className="bg-white/30 rounded-lg p-3">
          <div className="text-lg font-bold text-emerald-600">99.2%</div>
          <div className="text-xs text-gray-600">Accuracy</div>
        </div>
        <div className="bg-white/30 rounded-lg p-3">
          <div className="text-lg font-bold text-amber-600">Auto</div>
          <div className="text-xs text-gray-600">Generation</div>
        </div>
      </div>
    </div>
  );

  const AutoReportGenerator = () => (
    <div className="glass-card p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Automated Reports</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-emerald-600" />
            <div>
              <div className="font-semibold text-gray-800">EPA Compliance Report</div>
              <div className="text-sm text-gray-600">Auto-generated from POS data</div>
            </div>
          </div>
          <Button
            onClick={() => toast({ title: "EPA Report Generated!", description: "Report ready for download" })}
            className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700"
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-white/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Recycle className="w-6 h-6 text-cyan-600" />
            <div>
              <div className="font-semibold text-gray-800">Bin Trim Report</div>
              <div className="text-sm text-gray-600">Ready for NSW submission</div>
            </div>
          </div>
          <Button
            className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-700"
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-white/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-amber-600" />
            <div>
              <div className="font-semibold text-gray-800">Rebate Application</div>
              <div className="text-sm text-gray-600">Equipment rebate forms</div>
            </div>
          </div>
          <Button
            className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-700"
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Generate
          </Button>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/20">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Submissions</h4>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>EPA Report - January 2025</span>
            <span className="text-emerald-600">✓ Submitted</span>
          </div>
          <div className="flex justify-between">
            <span>Bin Trim Update - December 2024</span>
            <span className="text-emerald-600">✓ Approved</span>
          </div>
        </div>
      </div>
    </div>
  );

  const ComplianceHistory = () => (
    <div className="glass-card p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Compliance Timeline</h3>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-emerald-500 rounded-full" />
          <div className="flex-1">
            <div className="font-medium text-emerald-700">Assessment Completed</div>
            <div className="text-sm text-gray-600">Bin Trim evaluation finished</div>
            <div className="text-xs text-gray-500">January 15, 2025</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-emerald-500 rounded-full" />
          <div className="flex-1">
            <div className="font-medium text-emerald-700">POS Integration</div>
            <div className="text-sm text-gray-600">Automated data collection started</div>
            <div className="text-xs text-gray-500">January 10, 2025</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
          <div className="flex-1">
            <div className="font-medium text-amber-700">Equipment Planning</div>
            <div className="text-sm text-gray-600">Rebate calculation in progress</div>
            <div className="text-xs text-gray-500">In Progress</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-gray-300 rounded-full" />
          <div className="flex-1">
            <div className="font-medium text-gray-600">Implementation</div>
            <div className="text-sm text-gray-600">FOGO service setup</div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
        </div>
      </div>
      
      <Button 
        className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
        onClick={() => toast({ title: "Action Plan Ready!", description: "Implementation timeline downloaded" })}
      >
        <Calendar className="w-4 h-4 mr-2" />
        Download Full Timeline
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 glass-header">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <TreePine className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-emerald-800">🌱 FOGO Compliance</div>
              <div className="text-sm text-emerald-600">NSW Australia Dashboard</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="status-dot bg-emerald-500" />
              <span className="text-emerald-700">Connected</span>
            </div>
            <Badge variant="outline" className="bg-emerald-500/20 text-emerald-700">
              Score: {complianceMetrics.complianceProgress}%
            </Badge>
            <div className="text-xs text-gray-600">
              Last sync: {posData.lastSync.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Row 1: Executive Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ComplianceStatusCard />
          <MandateCountdown />
          <QuickActions />
        </div>
        
        {/* Row 2: Real-time Data */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <RealtimeWasteMetrics />
          <FOGOPredictionChart />
        </div>
        
        {/* Row 3: Data Flow */}
        <DataFlowVisualization />
        
        {/* Row 4: Reports and History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AutoReportGenerator />
          <ComplianceHistory />
        </div>
        
        {/* Bottom Info */}
        <div className="glass-card p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-gray-800">Legal Compliance Disclaimer</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            This dashboard provides automated guidance based on your POS data. Always consult official EPA NSW sources for definitive compliance requirements.
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open('https://www.epa.nsw.gov.au/waste/commercial', '_blank')}
            >
              <Globe className="w-4 h-4 mr-2" />
              EPA NSW Resources
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = 'mailto:organics.grants@epa.nsw.gov.au'}
            >
              Contact EPA NSW
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FOGOCompliance;