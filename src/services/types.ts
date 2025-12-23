export interface User {
    id: string;
    email: string;
    name?: string;
    role?: string;
}

export interface Donation {
    id: string;
    tenant_id: string;
    product_id?: number | null;
    quantity: number;
    ngo: string;
    pickup_time?: string | null;
    status: 'pending' | 'accepted' | 'rejected' | 'picked_up' | 'completed';
    observations?: string | null;
    document_url?: string;
    expiration_date?: string | null;
    value_eur?: number;
    kg?: number;
    evidence_name?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateDonationDTO {
    product_id?: string | number | null;
    quantity: number;
    ngo: string;
    pickup_time?: string;
    observations?: string;
    expiration_date?: string;
    value_eur?: number;
    kg?: number;
    evidence_name?: string;
    created_at?: string;
}

export interface IDonationService {
    createProposal(data: CreateDonationDTO, userId: string): Promise<Donation>;
    getPendingProposals(userId: string): Promise<Donation[]>;
    getHistory(userId: string): Promise<Donation[]>;
    scheduleDonation(candidateId: number, data: CreateDonationDTO, userId: string): Promise<Donation>;
    getNgos(userId: string): Promise<any[]>;
    getCandidates(userId: string): Promise<any[]>;
    createNgo(data: any, userId: string): Promise<boolean>;
    markAsReady(id: string): Promise<boolean>;
    updateProposal(id: string, updates: Partial<Donation>): Promise<void>;
    updateNgo(id: string, updates: Partial<any>): Promise<void>;
}



