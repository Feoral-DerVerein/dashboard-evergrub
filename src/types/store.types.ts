
export type StoreProfile = {
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
  businessHours: BusinessHour[];
};

export type BusinessHour = {
  day: string;
  open: string;
  close: string;
};
