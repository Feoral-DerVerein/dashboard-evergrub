import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const storageService = {
    async uploadFile(path: string, file: File): Promise<string> {
        try {
            const storageRef = ref(storage, path);
            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);
            return url;
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        }
    },

    // Helper for specific paths
    async uploadEvidence(file: File, donationId: string): Promise<string> {
        const path = `evidence/${donationId}/${file.name}`;
        return this.uploadFile(path, file);
    },

    async uploadAgreement(file: File, ngoId: string): Promise<string> {
        const path = `agreements/${ngoId}/${file.name}`;
        return this.uploadFile(path, file);
    },

    async uploadTrainingEvidence(file: File, sessionId: string): Promise<string> {
        const path = `training/${sessionId}/${file.name}`;
        return this.uploadFile(path, file);
    },

    async uploadProductImage(file: File, productId: string | number): Promise<string> {
        const path = `products/${productId}/${file.name}`;
        return this.uploadFile(path, file);
    }
};
