import { db } from '@/lib/firebase';
import { StoreProfile } from "@/types/store.types";
import { toast } from "sonner";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  limit
} from 'firebase/firestore';

export const storeProfileService = {
  async getStoreProfile(userId: string): Promise<StoreProfile | null> {
    try {
      const q = query(
        collection(db, "store_profiles"),
        where("userId", "==", userId),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) return null;

      const docData = snapshot.docs[0].data();

      // Convert payment_details if it exists (snake_case from old DB to camelCase)
      const profile = { id: snapshot.docs[0].id, ...docData } as any;
      if (profile.payment_details) {
        profile.paymentDetails = profile.payment_details;
        delete profile.payment_details;
      }

      return profile as StoreProfile;

    } catch (error) {
      console.error("Error in getStoreProfile:", error);
      return null;
    }
  },

  async saveStoreProfile(profile: StoreProfile): Promise<StoreProfile | null> {
    try {
      const profileToSave = { ...profile };

      // Handle payment details mapping if needed
      if (profileToSave.paymentDetails) {
        (profileToSave as any).payment_details = profileToSave.paymentDetails;
        delete (profileToSave as any).paymentDetails;
      }

      // Check if exists
      const q = query(
        collection(db, "store_profiles"),
        where("userId", "==", profile.userId),
        limit(1)
      );
      const snapshot = await getDocs(q);

      let resultId;
      if (!snapshot.empty) {
        // Update
        const docId = snapshot.docs[0].id;
        const docRef = doc(db, "store_profiles", docId);
        await updateDoc(docRef, profileToSave);
        resultId = docId;
        toast.success("Profile updated successfully");
      } else {
        // Create
        const docRef = await addDoc(collection(db, "store_profiles"), profileToSave);
        resultId = docRef.id;
        toast.success("Profile created successfully");
      }

      return { id: resultId, ...profile };

    } catch (error) {
      console.error("Error in saveStoreProfile:", error);
      toast.error("Error saving profile");
      return null;
    }
  }
};
