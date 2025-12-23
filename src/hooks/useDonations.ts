import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { donationService } from "@/services/donationService";
import { Donation, CreateDonationDTO } from "@/services/types";

// Re-export shared types
export type { Donation, CreateDonationDTO };

export interface Ngo {
  id: string;
  name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  tax_id: string;
  status: string;
  created_at: string;
  agreement_url?: string;
  agreement_name?: string;
}

export interface DonationCandidate {
  id: number;
  product_id: number;
  name: string;
  product_name?: string;
  expiration_date: string;
  quantity_available: number;
}

export function useDonations() {
  const { user } = useAuth();
  const [ngos, setNgos] = useState<Ngo[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [donationCandidates, setDonationCandidates] = useState<DonationCandidate[]>([]);
  const [pendingProposals, setPendingProposals] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch NGOs
  const fetchNgos = async () => {
    try {
      const data = await donationService.getNgos(user?.id || 'demo-user');
      setNgos(data);
    } catch (error) {
      console.error("Error fetching NGOs:", error);
      toast.error("Error al cargar ONGs");
    }
  };

  // Fetch donation history (completed/picked_up)
  const fetchDonationHistory = async () => {
    try {
      const history = await donationService.getHistory(user?.id || 'demo-user');
      setDonations(history);
    } catch (error) {
      console.error("Error fetching donation history:", error);
      toast.error("Error al cargar historial de donaciones");
    }
  };

  // Fetch pending donation proposals
  const fetchPendingProposals = async () => {
    try {
      const proposals = await donationService.getPendingProposals(user?.id || 'demo-user');
      setPendingProposals(proposals);
    } catch (error) {
      console.error("Error fetching pending proposals:", error);
    }
  };

  // Fetch products close to expiration (candidates for donation)
  const fetchDonationCandidates = async () => {
    try {
      const candidates = await donationService.getCandidates(user?.id || 'demo-user');
      setDonationCandidates(candidates as DonationCandidate[]);
    } catch (error) {
      console.error("Error fetching donation candidates:", error);
      setDonationCandidates([]);
    }
  };

  // Create a new donation
  const createDonation = async (data: CreateDonationDTO): Promise<boolean> => {
    try {
      setLoading(true);
      await donationService.createProposal(data, user?.id || 'demo-user');
      toast.success("Donación creada correctamente");
      await fetchDonationHistory();
      await fetchPendingProposals();
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
    if (!ngo) {
      toast.error("Selecciona una ONG");
      return false;
    }

    try {
      setLoading(true);
      await donationService.scheduleDonation(candidate.id, {
        product_id: candidate.product_id,
        quantity: candidate.quantity_available,
        ngo: ngo,
        pickup_time: pickupTime,
        observations: observations,
        expiration_date: candidate.expiration_date
      }, user?.id || 'demo-user');

      toast.success("Donación programada correctamente");
      await fetchDonationHistory();
      await fetchPendingProposals();
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
    try {
      setLoading(true);
      await donationService.createNgo(ngoData, user?.id || 'demo-user');

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
  const generateDocument = async (donationId: string): Promise<void> => {
    try {
      setLoading(true);
      toast.info("Generación de documentos próximamente disponible");
    } catch (error) {
      console.error("Error generating document:", error);
      toast.error("Error al generar el documento");
    } finally {
      setLoading(false);
    }
  };

  // Mark a proposal as ready/completed
  const markProposalAsReady = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      const success = await donationService.markAsReady(id);

      if (success) {
        toast.success("Propuesta marcada como lista");
        await fetchPendingProposals();
        await fetchDonationHistory();
        return true;
      } else {
        toast.error("No se pudo actualizar la propuesta");
        return false;
      }
    } catch (error) {
      console.error("Error marking proposal as ready:", error);
      toast.error("Error al actualizar la propuesta");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchNgos();
    fetchDonationHistory();
    fetchDonationCandidates();
    fetchPendingProposals();
  }, [user]);

  // Upload Evidence
  const uploadEvidence = async (donationId: string, file: File): Promise<boolean> => {
    try {
      setLoading(true);
      // Upload to Firebase Storage
      const { storageService } = await import('@/services/storageService');
      const downloadUrl = await storageService.uploadEvidence(file, donationId);

      // Persist to Firestore
      await donationService.updateProposal(donationId, {
        document_url: downloadUrl,
        evidence_name: file.name
      });

      toast.success("Evidencia subida correctamente");
      await fetchDonationHistory(); // Refresh list to show new link
      return true;
    } catch (error) {
      console.error("Error uploading evidence:", error);
      toast.error("Error al subir el documento");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Upload Agreement
  const uploadAgreement = async (ngoId: string, file: File): Promise<boolean> => {
    try {
      setLoading(true);
      const { storageService } = await import('@/services/storageService');
      const downloadUrl = await storageService.uploadAgreement(file, ngoId);

      // Persist to Firestore
      await donationService.updateNgo(ngoId, {
        agreement_url: downloadUrl,
        agreement_name: file.name
      });

      toast.success("Convenio subido correctamente");
      await fetchNgos(); // Refresh list
      return true;
    } catch (error) {
      console.error("Error uploading agreement:", error);
      toast.error("Error al subir el convenio");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    ngos,
    donations,
    donationCandidates,
    pendingProposals,
    loading,
    fetchNgos,
    fetchDonationHistory,
    fetchDonationCandidates,
    fetchPendingProposals,
    createDonation,
    scheduleDonation,
    createNgo,
    generateDocument,
    markProposalAsReady,
    uploadEvidence,
    uploadAgreement,
  };
}
