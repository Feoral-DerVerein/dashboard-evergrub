import { IDonationService, Donation, CreateDonationDTO } from './types';
import { db } from '@/lib/firebase';
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    orderBy
} from 'firebase/firestore';

export class DonationService implements IDonationService {

    // Helper to convert Firestore doc to Donation type
    private mapDoc(doc: any): Donation {
        const data = doc.data();
        return {
            id: doc.id,
            ...data
        } as Donation;
    }

    async createProposal(data: CreateDonationDTO, userId: string): Promise<Donation> {
        try {
            const isDirectDonation = data.ngo && data.ngo !== 'Pendiente de asignar';

            const donationData = {
                tenant_id: userId,
                product_id: data.product_id ? Number(data.product_id) : null,
                quantity: data.quantity,
                ngo: data.ngo || 'Pendiente de asignar',
                pickup_time: data.pickup_time || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                observations: data.observations || null,
                status: isDirectDonation ? 'scheduled' : 'pending',
                value_eur: data.value_eur || 0,
                kg: data.kg || 0,
                expiration_date: data.expiration_date || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            const docRef = await addDoc(collection(db, "donations"), donationData);

            return {
                id: docRef.id,
                ...donationData
            } as Donation;

        } catch (error) {
            console.error("Error creating proposal:", error);
            throw error;
        }
    }

    async getPendingProposals(userId: string): Promise<Donation[]> {
        try {
            const q = query(
                collection(db, "donations"),
                where("tenant_id", "==", userId),
                where("status", "in", ["pending", "scheduled"]),
                orderBy("created_at", "desc")
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(this.mapDoc);
        } catch (error) {
            console.error("Error getting pending proposals:", error);
            return [];
        }
    }

    async getHistory(userId: string): Promise<Donation[]> {
        try {
            const q = query(
                collection(db, "donations"),
                where("tenant_id", "==", userId),
                where("status", "in", ["completed", "picked_up", "rejected"]),
                orderBy("created_at", "desc")
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(this.mapDoc);
        } catch (error) {
            console.error("Error getting history:", error);
            return [];
        }
    }

    async scheduleDonation(candidateId: number, data: CreateDonationDTO, userId: string): Promise<Donation> {
        return this.createProposal(data, userId);
    }

    async getNgos(userId: string): Promise<any[]> {
        try {
            // Ideally we fetch from 'ngos' collection. 
            // For now, if empty, we return mocks but structured as if fetched.
            // In a real scenario, you would have a separate 'ngos' management section.

            const q = query(collection(db, "ngos"));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                // Return default NGOs so the UI isn't empty on first load
                return [
                    { id: 'ngo-1', name: 'Banco de Alimentos', status: 'active', contact_email: 'contact@banco.org' },
                    { id: 'ngo-2', name: 'Caritas', status: 'active', contact_email: 'info@caritas.org' },
                    { id: 'ngo-3', name: 'Cruz Roja', status: 'active', contact_email: 'donaciones@cruzroja.es' },
                ];
            }

            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        } catch (error) {
            console.error("Error fetching NGOs:", error);
            // Fallback
            return [
                { id: 'ngo-1', name: 'Banco de Alimentos', status: 'active' },
            ];
        }
    }

    async getCandidates(userId: string): Promise<any[]> {
        // This simulates "Inventory" which might come from an ERP integration.
        // Keeping it mocked for now as requested to prioritize Documents/Compliance.
        return new Promise((resolve) => {
            resolve([
                { id: 101, product_id: 101, name: 'Leche Desnatada', quantity_available: 50, expiration_date: new Date(Date.now() + 86400000).toISOString() },
                { id: 102, product_id: 102, name: 'Pan Molde', quantity_available: 20, expiration_date: new Date(Date.now() + 172800000).toISOString() },
                { id: 103, product_id: 103, name: 'Tomates Canarios', quantity_available: 15, expiration_date: new Date(Date.now() + 43200000).toISOString() },
            ]);
        });
    }

    async createNgo(data: any, userId: string): Promise<boolean> {
        try {
            await addDoc(collection(db, "ngos"), {
                ...data,
                created_at: new Date().toISOString(),
                status: 'active'
            });
            return true;
        } catch (error) {
            console.error("Error creating NGO:", error);
            return false;
        }
    }

    async markAsReady(id: string): Promise<boolean> {
        try {
            const docRef = doc(db, "donations", id);
            await updateDoc(docRef, {
                status: 'completed',
                updated_at: new Date().toISOString()
            });
            return true;
        } catch (error) {
            console.error("Error marking as ready:", error);
            return false;
        }
    }
    async updateProposal(id: string, updates: Partial<Donation>): Promise<void> {
        try {
            const docRef = doc(db, "donations", id);
            await updateDoc(docRef, {
                ...updates,
                updated_at: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error updating proposal:", error);
            throw error;
        }
    }

    async updateNgo(id: string, updates: Partial<any>): Promise<void> {
        try {
            const docRef = doc(db, "ngos", id);
            await updateDoc(docRef, updates);
        } catch (error) {
            console.error("Error updating NGO:", error);
            throw error;
        }
    }
}

export const donationService = new DonationService();
