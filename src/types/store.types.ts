
export interface StoreProfile {
  id?: string;
  userId: string;
  name: string;
  description: string;
  location: string;
  contactPhone: string;
  contactEmail: string;
  socialFacebook: string;
  socialInstagram: string;
  logoUrl: string;
  coverUrl: string;
  categories: string[];
  businessHours: any[];
  paymentDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
    routingNumber?: string;
    paymentMethod: string;
    paypalEmail?: string;
    currency: string;
  };
}
