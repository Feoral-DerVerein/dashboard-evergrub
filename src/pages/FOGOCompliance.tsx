import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Leaf, 
  Recycle, 
  Calculator, 
  CheckCircle, 
  Clock, 
  ExternalLink, 
  Download,
  AlertCircle,
  TreePine,
  Target,
  Award,
  Calendar,
  Upload,
  Play
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FOGOCompliance = () => {
  const { toast } = useToast();
  
  // Shared state between cards
  const [complianceData, setComplianceData] = useState({
    volumeWeekly: 0,
    businessType: '',
    complianceDate: null,
    assessmentStatus: 'pending',
    eligibleRebate: 0,
    actionPlan: [],
    completedSteps: []
  });

  // Calculate compliance date based on volume
  const calculateComplianceDate = (volume) => {
    if (volume >= 3840) return { year: 2026, status: 'urgent' };
    if (volume >= 1920) return { year: 2028, status: 'planning' };
    if (volume >= 660) return { year: 2030, status: 'future' };
    return null;
  };

  // Calculate countdown
  const [countdown, setCountdown] = useState('');
  
  useEffect(() => {
    if (complianceData.complianceDate) {
      const targetDate = new Date(`${complianceData.complianceDate.year}-01-01`);
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate.getTime() - now;
        
        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          
          setCountdown(`${days}d ${hours}h ${minutes}m`);
        } else {
          setCountdown('Mandate Active');
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [complianceData.complianceDate]);

  // Update compliance data
  const updateComplianceData = (updates) => {
    setComplianceData(prev => ({ ...prev, ...updates }));
  };

  // Check compliance status
  const checkFOGOCompliance = () => {
    const compliance = calculateComplianceDate(complianceData.volumeWeekly);
    updateComplianceData({ complianceDate: compliance });
    
    if (!complianceData.completedSteps.includes('fogo-check')) {
      updateComplianceData({ 
        completedSteps: [...complianceData.completedSteps, 'fogo-check'] 
      });
      
      toast({
        title: "FOGO Status Calculated!",
        description: `Your compliance date: ${compliance?.year || 'No mandate required'}`,
      });
    }
  };

  // Equipment options for rebate calculator
  const equipmentOptions = [
    { id: 'food-processor', label: 'Commercial Food Waste Processor', cost: 15000, rebate: 7500 },
    { id: 'composter', label: 'In-vessel Composter', cost: 25000, rebate: 12500 },
    { id: 'dehydrator', label: 'Food Waste Dehydrator', cost: 8000, rebate: 4000 },
    { id: 'digestor', label: 'Anaerobic Digestor (Small)', cost: 45000, rebate: 22500 }
  ];

  const [selectedEquipment, setSelectedEquipment] = useState([]);

  // Calculate rebate
  const calculateRebate = () => {
    const totalCost = selectedEquipment.reduce((sum, id) => {
      const equipment = equipmentOptions.find(eq => eq.id === id);
      return sum + (equipment?.cost || 0);
    }, 0);
    
    const totalRebate = Math.min(selectedEquipment.reduce((sum, id) => {
      const equipment = equipmentOptions.find(eq => eq.id === id);
      return sum + (equipment?.rebate || 0);
    }, 0), 50000);

    updateComplianceData({ eligibleRebate: totalRebate });
    
    if (!complianceData.completedSteps.includes('rebate-calc')) {
      updateComplianceData({ 
        completedSteps: [...complianceData.completedSteps, 'rebate-calc'] 
      });
      
      toast({
        title: "Rebate Calculated!",
        description: `You're eligible for up to $${totalRebate.toLocaleString()}`,
      });
    }
  };

  // Card unlock logic
  const isCardUnlocked = (cardId) => {
    switch (cardId) {
      case 'compliance': return true;
      case 'assessment': return complianceData.completedSteps.includes('fogo-check');
      case 'rebate': return complianceData.assessmentStatus === 'completed';
      case 'action': return complianceData.eligibleRebate > 0;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full border border-green-200">
              <TreePine className="w-12 h-12 text-green-700" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-green-900 mb-2">FOGO & Bin Trim</h1>
          <p className="text-lg text-green-700">NSW Australia Compliance Assistant 2026</p>
          
          {/* Progress indicator */}
          <div className="mt-6 max-w-md mx-auto">
            <Progress 
              value={(complianceData.completedSteps.length / 4) * 100} 
              className="h-2"
            />
            <p className="text-sm text-green-600 mt-2">
              {complianceData.completedSteps.length} of 4 steps completed
            </p>
          </div>
        </div>

        {/* 4-Card Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Card 1: FOGO Compliance Checker */}
          <Card className="glass-card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl text-green-900">¿Tu empresa debe cumplir FOGO?</CardTitle>
              <CardDescription>Determine your FOGO compliance requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-green-800 mb-2">
                  Weekly Waste Volume: {complianceData.volumeWeekly}L
                </label>
                <Slider
                  value={[complianceData.volumeWeekly]}
                  onValueChange={([value]) => updateComplianceData({ volumeWeekly: value })}
                  max={10000}
                  step={50}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-800 mb-2">Business Type</label>
                <Select 
                  value={complianceData.businessType} 
                  onValueChange={(value) => updateComplianceData({ businessType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supermarket">Supermarket</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="school">School/Institution</SelectItem>
                    <SelectItem value="retail">Retail Food</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={checkFOGOCompliance}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!complianceData.volumeWeekly || !complianceData.businessType}
              >
                <Target className="w-4 h-4 mr-2" />
                Verificar Mi Status FOGO
              </Button>

              {/* Results */}
              {complianceData.complianceDate && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-green-800">Compliance Date:</span>
                    <Badge variant={
                      complianceData.complianceDate.status === 'urgent' ? 'destructive' :
                      complianceData.complianceDate.status === 'planning' ? 'default' : 'secondary'
                    }>
                      {complianceData.complianceDate.year}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">{countdown}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Bin Trim Assessment Hub */}
          <Card className={`glass-card transition-all duration-300 ${
            isCardUnlocked('assessment') 
              ? 'hover:shadow-xl transform hover:-translate-y-1' 
              : 'opacity-60 cursor-not-allowed'
          }`}>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                <Recycle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl text-green-900">Evaluación de Residuos Bin Trim</CardTitle>
              <CardDescription>Complete your waste assessment</CardDescription>
              {!isCardUnlocked('assessment') && (
                <Badge variant="outline">Complete FOGO check first</Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="mb-4">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                    complianceData.assessmentStatus === 'completed' 
                      ? 'bg-green-100 text-green-600'
                      : complianceData.assessmentStatus === 'in-progress'
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {complianceData.assessmentStatus === 'completed' ? (
                      <CheckCircle className="w-8 h-8" />
                    ) : (
                      <Clock className="w-8 h-8" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Status: {
                    complianceData.assessmentStatus === 'completed' ? 'Completed' :
                    complianceData.assessmentStatus === 'in-progress' ? 'In Progress' : 'Pending'
                  }
                </p>
              </div>

              <Button 
                onClick={() => window.open('https://bintrim.nsw.gov.au/assessment', '_blank')}
                className="w-full"
                variant="outline"
                disabled={!isCardUnlocked('assessment')}
              >
                <Play className="w-4 h-4 mr-2" />
                Comenzar Assessment Bin Trim
              </Button>

              <Button 
                onClick={() => {
                  updateComplianceData({ assessmentStatus: 'completed' });
                  toast({
                    title: "Assessment Updated!",
                    description: "Bin Trim assessment marked as completed",
                  });
                }}
                className="w-full"
                variant="outline"
                disabled={!isCardUnlocked('assessment')}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Results
              </Button>
            </CardContent>
          </Card>

          {/* Card 3: Rebate Calculator */}
          <Card className={`glass-card transition-all duration-300 ${
            isCardUnlocked('rebate') 
              ? 'hover:shadow-xl transform hover:-translate-y-1' 
              : 'opacity-60 cursor-not-allowed'
          }`}>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                <Calculator className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl text-green-900">Calculadora de Rebates</CardTitle>
              <CardDescription>Calculate your equipment rebate eligibility</CardDescription>
              {!isCardUnlocked('rebate') && (
                <Badge variant="outline">Complete assessment first</Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-green-800">Equipment Selection:</label>
                {equipmentOptions.map((equipment) => (
                  <div key={equipment.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={equipment.id}
                      checked={selectedEquipment.includes(equipment.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedEquipment([...selectedEquipment, equipment.id]);
                        } else {
                          setSelectedEquipment(selectedEquipment.filter(id => id !== equipment.id));
                        }
                      }}
                      disabled={!isCardUnlocked('rebate')}
                    />
                    <label 
                      htmlFor={equipment.id} 
                      className="text-sm text-gray-700 flex-1 cursor-pointer"
                    >
                      {equipment.label}
                      <span className="text-xs text-gray-500 block">
                        Cost: ${equipment.cost.toLocaleString()} | Rebate: ${equipment.rebate.toLocaleString()}
                      </span>
                    </label>
                  </div>
                ))}
              </div>

              <Button 
                onClick={calculateRebate}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!isCardUnlocked('rebate') || selectedEquipment.length === 0}
              >
                <Award className="w-4 h-4 mr-2" />
                Calcular Mi Rebate
              </Button>

              {complianceData.eligibleRebate > 0 && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-800">
                      ${complianceData.eligibleRebate.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-600">Eligible Rebate</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Deadline: 30 Jun 2027
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 4: Action Plan & Timeline */}
          <Card className={`glass-card transition-all duration-300 ${
            isCardUnlocked('action') 
              ? 'hover:shadow-xl transform hover:-translate-y-1' 
              : 'opacity-60 cursor-not-allowed'
          }`}>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl text-green-900">Plan de Implementación</CardTitle>
              <CardDescription>Your personalized action plan</CardDescription>
              {!isCardUnlocked('action') && (
                <Badge variant="outline">Complete rebate calculation first</Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <div className="font-medium text-green-800">FOGO Assessment</div>
                    <div className="text-sm text-green-600">Compliance requirements identified</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <div className="font-medium text-green-800">Bin Trim Analysis</div>
                    <div className="text-sm text-green-600">Waste patterns analyzed</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <div className="font-medium text-green-800">Equipment Planning</div>
                    <div className="text-sm text-green-600">Rebate eligibility confirmed</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <div className="flex-1">
                    <div className="font-medium text-yellow-800">Implementation</div>
                    <div className="text-sm text-yellow-600">Ready to begin installation</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  className="w-full"
                  variant="outline"
                  disabled={!isCardUnlocked('action')}
                  onClick={() => window.open('https://www.epa.nsw.gov.au/waste/commercial', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View NSW EPA Resources
                </Button>

                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={!isCardUnlocked('action')}
                  onClick={() => {
                    toast({
                      title: "Action Plan Generated!",
                      description: "Your implementation plan is ready for download",
                    });
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Mi Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Info */}
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-gray-800">Legal Disclaimer</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                This tool provides guidance only. Always consult official EPA NSW sources for definitive compliance requirements.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.href = 'mailto:organics.grants@epa.nsw.gov.au'}
              >
                Contact EPA NSW: organics.grants@epa.nsw.gov.au
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FOGOCompliance;