import { supabase } from "@/integrations/supabase/client";

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
}

export interface UserPreferences {
    notificationAlerts?: boolean;
    notificationReports?: boolean;
    language?: string;
    theme?: 'light' | 'dark' | 'system';
    complianceRegion?: string;
}

// Type for raw profile data from Supabase (handles columns that may not be in generated types yet)
interface ProfileOnboardingData {
    onboarding_completed?: boolean;
    onboarding_step?: number;
    onboarding_data?: OnboardingData;
}

export const onboardingService = {
    async getOnboardingStatus(userId: string): Promise<OnboardingStatus> {
        try {
            // Use raw query to handle columns that might not be in generated types
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching onboarding status:', error);
                return {
                    completed: false,
                    currentStep: 0,
                    data: {}
                };
            }

            // Cast to handle dynamic columns
            const profileData = data as unknown as ProfileOnboardingData;

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
            // First get current data
            const { data: currentProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            const profileData = currentProfile as unknown as ProfileOnboardingData;
            const currentData = (profileData?.onboarding_data as OnboardingData) || {};
            const mergedData = { ...currentData, ...stepData };

            // Use rpc or raw update to handle dynamic columns
            const { error } = await supabase
                .from('profiles')
                .update({
                    onboarding_step: step,
                    onboarding_data: mergedData
                } as Record<string, unknown>)
                .eq('id', userId);

            if (error) {
                console.error('Error saving step data:', error);
                throw error;
            }
        } catch (err) {
            console.error('Error in saveStepData:', err);
            throw err;
        }
    },

    async completeOnboarding(userId: string, finalData?: Partial<OnboardingData>): Promise<void> {
        try {
            // Get current data and merge with final data
            const { data: currentProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            const profileData = currentProfile as unknown as ProfileOnboardingData;
            const currentData = (profileData?.onboarding_data as OnboardingData) || {};
            const mergedData = { ...currentData, ...finalData };

            const { error } = await supabase
                .from('profiles')
                .update({
                    onboarding_completed: true,
                    onboarding_step: 4,
                    onboarding_data: mergedData
                } as Record<string, unknown>)
                .eq('id', userId);

            if (error) {
                console.error('Error completing onboarding:', error);
                throw error;
            }
        } catch (err) {
            console.error('Error in completeOnboarding:', err);
            throw err;
        }
    },

    async skipOnboarding(userId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    onboarding_completed: true,
                    onboarding_step: -1,
                    onboarding_data: { skipped: true }
                } as Record<string, unknown>)
                .eq('id', userId);

            if (error) {
                console.error('Error skipping onboarding:', error);
                throw error;
            }
        } catch (err) {
            console.error('Error in skipOnboarding:', err);
            throw err;
        }
    }
};

export default onboardingService;
