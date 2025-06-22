
import { supabase } from "@/integrations/supabase/client";

export interface PartnerData {
  name: string;
  type: "restaurant" | "hotel" | "supermarket" | "market";
  email: string;
  phone?: string;
  address?: string;
  contact_person: string;
}

export interface Partner extends PartnerData {
  id: string;
  user_id: string;
  date_added: string;
  created_at: string;
}

export const partnersService = {
  async createPartner(partnerData: PartnerData): Promise<Partner> {
    const { data, error } = await supabase
      .from('partners')
      .insert([{
        ...partnerData,
        user_id: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPartners(): Promise<Partner[]> {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async deletePartner(id: string): Promise<void> {
    const { error } = await supabase
      .from('partners')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
