import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export interface Ngo {
  id: string;
  name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  tax_id: string;
  status: string;
  created_at: string;
}

export interface Donation {
  id: string;
  product_id?: number;
  quantity: number;
  ngo: string;
  pickup_time?: string;
  status: string;
  observations?: string;
  document_url?: string;
  expiration_date?: string;
  value_eur?: number;
  kg?: number;
  created_at: string;
  updated_at: string;
}

export interface DonationCandidate {
  id: number;
  product_id: number;
  name: string;
  product_name?: string;
  expiration_date: string;
  quantity_available: number;
}

export interface CreateDonationData {
  product_id?: string;
  quantity: number;
  ngo: string;
  pickup_time?: string;
  observations?: string;
  expiration_date?: string;
  value_eur?: number;
  kg?: number;
}

export function useDonations() {
  const { user } = useAuth();
  const [ngos, setNgos] = useState<Ngo[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [donationCandidates, setDonationCandidates] = useState<DonationCandidate[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch NGOs
  const fetchNgos = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("ngos")
        .select("*")
        .eq("tenant_id", user.id)
        .eq("status", "active")
        .order("name", { ascending: true });

      if (error) throw error;
      setNgos(data || []);
    } catch (error) {
      console.error("Error fetching NGOs:", error);
      toast.error("Error al cargar ONGs");
    }
  };

  // Fetch donation history
  const fetchDonationHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .eq("tenant_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDonations(data || []);
    } catch (error) {
      console.error("Error fetching donation history:", error);
      toast.error("Error al cargar historial de donaciones");
    }
  };

  // Fetch products close to expiration (candidates for donation)
  const fetchDonationCandidates = async () => {
    if (!user) return;
    
    try {
      // Get products expiring in the next 7 days
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      
      const { data, error } = await supabase
        .from("products")
        .select("id, name, quantity, expiration_date")
        .eq("tenant_id", user.id)
        .not("expiration_date", "is", null)
        .lte("expiration_date", sevenDaysFromNow.toISOString())
        .gt("quantity", 0)
        .order("expiration_date", { ascending: true });

      if (error) throw error;
      
      // Map to candidate format
      const candidates: DonationCandidate[] = (data || []).map((product: any) => ({
        id: product.id,
        product_id: product.id,
        name: product.name,
        product_name: product.name,
        expiration_date: product.expiration_date,
        quantity_available: product.quantity,
      }));
      
      setDonationCandidates(candidates);
    } catch (error) {
      console.error("Error fetching donation candidates:", error);
      toast.error("Error al cargar productos candidatos");
    }
  };

  // Create a new donation
  const createDonation = async (data: CreateDonationData): Promise<boolean> => {
    if (!user) {
      toast.error("Debes iniciar sesión");
      return false;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase.from("donations").insert({
        tenant_id: user.id,
        product_id: data.product_id ? parseInt(data.product_id) : null,
        quantity: data.quantity,
        ngo: data.ngo,
        pickup_time: data.pickup_time || null,
        observations: data.observations || null,
        expiration_date: data.expiration_date || null,
        value_eur: data.value_eur || 0,
        kg: data.kg || 0,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Donación creada correctamente");
      await fetchDonationHistory();
      return true;
    } catch (error) {
      console.error("Error creating donation:", error);
      toast.error("Error al crear la donación");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Schedule a donation for a candidate product
  const scheduleDonation = async (
    candidate: DonationCandidate,
    ngo: string,
    pickupTime?: string,
    observations?: string
  ): Promise<boolean> => {
    if (!user) {
      toast.error("Debes iniciar sesión");
      return false;
    }

    if (!ngo) {
      toast.error("Selecciona una ONG");
      return false;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase.from("donations").insert({
        tenant_id: user.id,
        product_id: candidate.product_id,
        quantity: candidate.quantity_available,
        expiration_date: candidate.expiration_date,
        ngo: ngo,
        pickup_time: pickupTime || null,
        observations: observations || null,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Donación programada correctamente");
      await fetchDonationHistory();
      await fetchDonationCandidates(); // Refresh candidates
      return true;
    } catch (error) {
      console.error("Error scheduling donation:", error);
      toast.error("Error al programar la donación");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Create a new NGO
  const createNgo = async (ngoData: Omit<Ngo, "id" | "created_at" | "status">): Promise<boolean> => {
    if (!user) {
      toast.error("Debes iniciar sesión");
      return false;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase.from("ngos").insert({
        tenant_id: user.id,
        ...ngoData,
        status: "active",
      });

      if (error) throw error;

      toast.success("ONG registrada correctamente");
      await fetchNgos();
      return true;
    } catch (error) {
      console.error("Error creating NGO:", error);
      toast.error("Error al registrar la ONG");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Generate a donation document (PDF)
  // This is a placeholder - actual PDF generation would need backend implementation
  const generateDocument = async (donationId: string): Promise<void> => {
    try {
      setLoading(true);
      
      // For now, just show a message
      // In production, this would call a Supabase Edge Function or external API
      toast.info("Generación de documentos próximamente disponible");
      
      // TODO: Implement actual PDF generation
      // const { data, error } = await supabase.functions.invoke('generate-donation-certificate', {
      //   body: { donation_id: donationId }
      // });
      
    } catch (error) {
      console.error("Error generating document:", error);
      toast.error("Error al generar el documento");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (user) {
      fetchNgos();
      fetchDonationHistory();
      fetchDonationCandidates();
    }
  }, [user]);

  return {
    ngos,
    donations,
    donationCandidates,
    loading,
    fetchNgos,
    fetchDonationHistory,
    fetchDonationCandidates,
    createDonation,
    scheduleDonation,
    createNgo,
    generateDocument,
  };
}
