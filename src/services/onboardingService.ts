import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";

export interface OnboardingStatus {
    completed: boolean;
    currentStep: number;
    data: OnboardingData;
}

export interface OnboardingData {
    businessName?: string;
    businessType?: string;
    businessSize?: string;
    country?: string;
    dataImportMethod?: string;
    dataImported?: boolean;
    preferences?: UserPreferences;
    skipped?: boolean;
    logoUrl?: string; // Added logoUrl
}

export interface UserPreferences {
    notificationAlerts?: boolean;
    notificationReports?: boolean;
    language?: string;
    theme?: 'light' | 'dark' | 'system';
    complianceRegion?: string;
}

// Type for raw profile data from Supabase (handles columns that may not be in generated types yet)
interface UserProfileData {
    onboarding_completed?: boolean;
    onboarding_step?: number;
    onboarding_data?: OnboardingData;
}

export const onboardingService = {
    async getOnboardingStatus(userId: string): Promise<OnboardingStatus> {
        try {
            // Firestore: users collection
            const docRef = doc(db, 'users', userId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                // Return default if user doc doesn't exist yet
                return {
                    completed: false,
                    currentStep: 0,
                    data: {}
                };
            }

            const profileData = docSnap.data() as UserProfileData;

            return {
                completed: profileData?.onboarding_completed ?? false,
                currentStep: profileData?.onboarding_step ?? 0,
                data: (profileData?.onboarding_data as OnboardingData) ?? {}
            };
        } catch (err) {
            console.error('Error in getOnboardingStatus:', err);
            return {
                completed: false,
                currentStep: 0,
                data: {}
            };
        }
    },

    async saveStepData(userId: string, step: number, stepData: Partial<OnboardingData>): Promise<void> {
        try {
            const docRef = doc(db, 'users', userId);
            const docSnap = await getDoc(docRef);

            const currentData = docSnap.exists()
                ? ((docSnap.data() as UserProfileData).onboarding_data || {})
                : {};

            const mergedData = { ...currentData, ...stepData };

            await setDoc(docRef, {
                onboarding_step: step,
                onboarding_data: mergedData
            }, { merge: true });

        } catch (err) {
            console.error('Error in saveStepData:', err);
            throw err;
        }
    },

    async completeOnboarding(userId: string, finalData?: Partial<OnboardingData>): Promise<void> {
        try {
            const docRef = doc(db, 'users', userId);
            const docSnap = await getDoc(docRef);

            const currentData = docSnap.exists()
                ? ((docSnap.data() as UserProfileData).onboarding_data || {})
                : {};

            const mergedData = { ...currentData, ...finalData };

            // 1. Update User Profile status
            await setDoc(docRef, {
                onboarding_completed: true,
                onboarding_step: 4,
                onboarding_data: mergedData
            }, { merge: true });

            // 2. Create/Update Store Profile
            // Firestore: store_profiles collection
            // Assuming store profile ID is same as userID for 1:1 relationship or we query by userId.
            // Let's use userId as document ID for store_profile ensures uniqueness easily.
            const storeDocRef = doc(db, 'store_profiles', userId);

            await setDoc(storeDocRef, {
                userId: userId,
                name: mergedData.businessName || 'My Business',
                description: `${mergedData.businessType || ''} - ${mergedData.businessSize || ''}`,
                categories: mergedData.businessType ? [mergedData.businessType] : [],
                logoUrl: (mergedData as any).logoUrl,
                location: mergedData.country,
            }, { merge: true });

        } catch (err) {
            console.error('Error in completeOnboarding:', err);
            throw err;
        }
    },

    async skipOnboarding(userId: string): Promise<void> {
        try {
            const docRef = doc(db, 'users', userId);
            await setDoc(docRef, {
                onboarding_completed: true,
                onboarding_step: -1,
                onboarding_data: { skipped: true }
            }, { merge: true });
        } catch (err) {
            console.error('Error in skipOnboarding:', err);
            throw err;
        }
    }
};

export default onboardingService;
