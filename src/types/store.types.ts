
export interface BusinessHour {
  day: string;
  open: string;
  close: string;
}

export interface PaymentDetails {
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  routingNumber?: string;
  paymentMethod: string;
  paypalEmail?: string;
  currency: string;
}

export interface StoreProfile {
  id?: string;
  userId: string;
  name: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  contactPhone: string;
  contactEmail: string;
  socialFacebook: string;
  socialInstagram: string;
  logoUrl: string;
  coverUrl: string;
  categories: string[];
  businessHours: BusinessHour[];
  paymentDetails?: PaymentDetails;
}
