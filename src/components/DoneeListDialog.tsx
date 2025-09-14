import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Clock, Users, Building, Heart } from 'lucide-react';
import { Task } from '@/hooks/useTaskList';

interface Donee {
  id: string;
  name: string;
  type: 'food_bank' | 'shelter' | 'community_center' | 'charity';
  address: string;
  phone: string;
  openHours: string;
  capacity: string;
  description: string;
  acceptedItems: string[];
  priority: 'high' | 'medium' | 'low';
  lastDonation?: string;
}

interface DoneeListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Task['product'] | null;
  onSelectDonee: (donee: Donee) => void;
}

const mockDonees: Donee[] = [
  {
    id: '1',
    name: 'Melbourne Food Bank',
    type: 'food_bank',
    address: '123 Community Street, Melbourne VIC 3000',
    phone: '+61 3 9123 4567',
    openHours: 'Mon-Fri 9AM-5PM',
    capacity: 'High capacity - 500+ families/week',
    description: 'Primary food distribution center serving Melbourne metropolitan area',
    acceptedItems: ['Fresh produce', 'Packaged goods', 'Dairy products', 'Bakery items'],
    priority: 'high',
    lastDonation: '2 days ago'
  },
  {
    id: '2',
    name: 'St. Vincent\'s Shelter',
    type: 'shelter',
    address: '456 Hope Avenue, South Melbourne VIC 3006',
    phone: '+61 3 9234 5678',
    openHours: '24/7 - Meals at 6PM daily',
    capacity: 'Medium capacity - 80 residents',
    description: 'Emergency accommodation and meal services for homeless individuals',
    acceptedItems: ['Ready meals', 'Fresh produce', 'Beverages', 'Snacks'],
    priority: 'high',
    lastDonation: '1 week ago'
  },
  {
    id: '3',
    name: 'Community Kitchen Fitzroy',
    type: 'community_center',
    address: '789 Social Lane, Fitzroy VIC 3065',
    phone: '+61 3 9345 6789',
    openHours: 'Tue, Thu, Sat 11AM-3PM',
    capacity: 'Small capacity - 150 meals/week',
    description: 'Community-run kitchen providing free meals to local residents in need',
    acceptedItems: ['Fresh vegetables', 'Meat products', 'Grains', 'Canned goods'],
    priority: 'medium',
    lastDonation: '3 weeks ago'
  },
  {
    id: '4',
    name: 'Second Harvest Victoria',
    type: 'charity',
    address: '321 Rescue Road, Richmond VIC 3121',
    phone: '+61 3 9456 7890',
    openHours: 'Mon-Fri 8AM-4PM',
    capacity: 'Very high capacity - 1000+ families/week',
    description: 'Food rescue organization redistributing surplus food to various charities',
    acceptedItems: ['All food types', 'Surplus stock', 'Near-expiry items', 'Bulk quantities'],
    priority: 'high'
  },
  {
    id: '5',
    name: 'Local Parish Food Pantry',
    type: 'charity',
    address: '654 Faith Street, Brunswick VIC 3056',
    phone: '+61 3 9567 8901',
    openHours: 'Wed 10AM-2PM, Sat 9AM-1PM',
    capacity: 'Small capacity - 50 families/week',
    description: 'Parish-run food pantry serving local families in financial hardship',
    acceptedItems: ['Packaged goods', 'Dairy products', 'Fresh produce', 'Baby food'],
    priority: 'low',
    lastDonation: '2 months ago'
  }
];

const getTypeIcon = (type: Donee['type']) => {
  switch (type) {
    case 'food_bank': return <Building className="w-4 h-4" />;
    case 'shelter': return <Users className="w-4 h-4" />;
    case 'community_center': return <Heart className="w-4 h-4" />;
    case 'charity': return <Heart className="w-4 h-4" />;
    default: return <Building className="w-4 h-4" />;
  }
};

const getTypeLabel = (type: Donee['type']) => {
  switch (type) {
    case 'food_bank': return 'Food Bank';
    case 'shelter': return 'Shelter';
    case 'community_center': return 'Community Center';
    case 'charity': return 'Charity';
    default: return 'Organization';
  }
};

const getPriorityColor = (priority: Donee['priority']) => {
  switch (priority) {
    case 'high': return 'bg-green-100 text-green-800 border-green-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const DoneeListDialog = ({ open, onOpenChange, product, onSelectDonee }: DoneeListDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Select Donation Recipient
            {product && (
              <Badge variant="outline" className="ml-2">
                Donating: {product.name}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(80vh-120px)] space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            Choose a recipient organization for your donation. Each organization has different capacity and requirements.
          </div>
          
          {mockDonees.map((donee) => (
            <Card key={donee.id} className="cursor-pointer hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(donee.type)}
                        <h3 className="font-semibold text-lg">{donee.name}</h3>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(donee.type)}
                      </Badge>
                      <Badge className={`text-xs ${getPriorityColor(donee.priority)}`}>
                        {donee.priority} priority
                      </Badge>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-muted-foreground">{donee.description}</p>
                    
                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{donee.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{donee.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{donee.openHours}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{donee.capacity}</span>
                      </div>
                    </div>
                    
                    {/* Accepted Items */}
                    <div>
                      <span className="text-sm font-medium">Accepted items: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {donee.acceptedItems.map((item, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* Last Donation */}
                    {donee.lastDonation && (
                      <div className="text-xs text-muted-foreground">
                        Last donation: {donee.lastDonation}
                      </div>
                    )}
                  </div>
                  
                  {/* Select Button */}
                  <div className="flex flex-col items-end gap-2">
                    <Button 
                      onClick={() => onSelectDonee(donee)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Select for Donation
                    </Button>
                    {donee.priority === 'high' && (
                      <Badge variant="destructive" className="text-xs">
                        Urgent Need
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="border-t pt-4 flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};