
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Camera, MapPin, Clock, Phone, Mail, Facebook, Instagram, Plus, X, Loader2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BottomNav } from "@/components/Dashboard";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { profileImageService } from "@/services/profileImageService";
import { storeProfileService } from "@/services/storeProfileService";
import { StoreProfile, BusinessHour } from "@/types/store.types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type BusinessHourRowProps = {
  day: string;
  open: string;
  close: string;
  onOpenChange: (value: string) => void;
  onCloseChange: (value: string) => void;
};

const BusinessHourRow = ({ day, open, close, onOpenChange, onCloseChange }: BusinessHourRowProps) => (
  <div className="flex items-center gap-4 mb-4">
    <span className="w-24 text-sm text-gray-600">{day}</span>
    <Input 
      type="time" 
      value={open} 
      onChange={(e) => onOpenChange(e.target.value)} 
      className="w-24" 
    />
    <span className="text-gray-400">-</span>
    <Input 
      type="time" 
      value={close} 
      onChange={(e) => onCloseChange(e.target.value)} 
      className="w-24" 
    />
  </div>
);

const ServiceTag = ({ name, onRemove }: { name: string; onRemove: () => void }) => (
  <div className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full mr-2 mb-2">
    <span className="text-sm text-gray-600">{name}</span>
    <button onClick={onRemove} className="text-gray-400 hover:text-gray-600">
      <X className="h-3 w-3" />
    </button>
  </div>
);

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  
  // Store profile data
  const [profile, setProfile] = useState<StoreProfile>({
    userId: user?.id || '',
    name: '',
    description: '',
    location: '',
    contactPhone: '',
    contactEmail: '',
    socialFacebook: '',
    socialInstagram: '',
    logoUrl: '',
    coverUrl: '',
    categories: [],
    businessHours: [
      { day: "Monday", open: "09:00", close: "18:00" },
      { day: "Tuesday", open: "09:00", close: "18:00" },
      { day: "Wednesday", open: "09:00", close: "18:00" },
      { day: "Thursday", open: "09:00", close: "18:00" },
      { day: "Friday", open: "09:00", close: "18:00" }
    ]
  });

  // Load profile on start
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        const data = await storeProfileService.getStoreProfile(user.id);
        if (data) {
          setProfile(data);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);

  // Handle changes in profile fields
  const handleInputChange = (field: keyof StoreProfile, value: string) => {
    setProfile({ ...profile, [field]: value });
  };
  
  // Handle changes in business hours
  const handleBusinessHourChange = (index: number, field: keyof BusinessHour, value: string) => {
    const updatedHours = [...profile.businessHours];
    updatedHours[index] = { ...updatedHours[index], [field]: value };
    setProfile({ ...profile, businessHours: updatedHours });
  };

  const handleRemoveCategory = (category: string) => {
    setProfile({
      ...profile,
      categories: profile.categories.filter(c => c !== category)
    });
  };
  
  const handleAddCategory = () => {
    if (newCategory.trim() && !profile.categories.includes(newCategory.trim())) {
      setProfile({
        ...profile,
        categories: [...profile.categories, newCategory.trim()]
      });
      setNewCategory("");
    }
    setShowAddCategoryDialog(false);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setUploadingLogo(true);
    
    try {
      const url = await profileImageService.uploadProfileImage(file, 'logo');
      if (url) {
        setProfile({...profile, logoUrl: url});
        toast({
          title: "Success",
          description: "Logo updated successfully"
        });
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Error",
        description: "Could not upload logo",
        variant: "destructive"
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setUploadingCover(true);
    
    try {
      const url = await profileImageService.uploadProfileImage(file, 'cover');
      if (url) {
        setProfile({...profile, coverUrl: url});
        toast({
          title: "Success",
          description: "Cover image updated successfully"
        });
      }
    } catch (error) {
      console.error("Error uploading cover image:", error);
      toast({
        title: "Error",
        description: "Could not upload cover image",
        variant: "destructive"
      });
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to save your profile",
        variant: "destructive"
      });
      return;
    }
    
    setSaving(true);
    try {
      // Save the profile
      const result = await storeProfileService.saveStoreProfile({
        ...profile,
        userId: user.id
      });
      
      if (result) {
        toast({
          title: "Success",
          description: "Profile saved successfully"
        });
      } else {
        throw new Error("Could not save profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Could not save profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <header className="px-6 py-4 border-b sticky top-0 bg-white z-10 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Store Profile</h1>
          <Button 
            variant="ghost" 
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
            onClick={handleSaveProfile}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </Button>
        </header>

        <main className="p-6 space-y-6">
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.logoUrl} />
                <AvatarFallback>
                  <Camera className="w-8 h-8 text-gray-400" />
                </AvatarFallback>
              </Avatar>
              <label htmlFor="logo-upload" className="absolute bottom-0 right-0 cursor-pointer">
                <div className={`rounded-full bg-blue-600 hover:bg-blue-700 w-8 h-8 flex items-center justify-center ${uploadingLogo ? 'opacity-70' : ''}`}>
                  {uploadingLogo ? (
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 text-white" />
                  )}
                </div>
                <input 
                  id="logo-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                />
              </label>
            </div>
            <span className="text-sm text-gray-600">Upload Store Logo</span>
          </div>

          <div className="relative h-40 bg-gray-100 rounded-lg flex items-center justify-center group overflow-hidden">
            {profile.coverUrl ? (
              <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-gray-400 group-hover:text-gray-600">
                <Camera className="w-8 h-8 mb-2" />
                <span className="text-sm">Add Cover Photo</span>
              </div>
            )}
            <label htmlFor="cover-upload" className="absolute bottom-4 right-4 cursor-pointer">
              <div className={`rounded-full bg-blue-600 hover:bg-blue-700 w-8 h-8 flex items-center justify-center ${uploadingCover ? 'opacity-70' : ''}`}>
                {uploadingCover ? (
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 text-white" />
                )}
              </div>
              <input 
                id="cover-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleCoverUpload}
                disabled={uploadingCover}
              />
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Store Name</label>
              <Input 
                placeholder="Enter your store name" 
                value={profile.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Textarea 
                placeholder="Tell customers about your business..." 
                className="h-24"
                value={profile.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input 
                  placeholder="Add your store location" 
                  className="pl-10"
                  value={profile.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-4 block">Business Hours</label>
              {profile.businessHours.map((hour, index) => (
                <BusinessHourRow 
                  key={hour.day} 
                  day={hour.day} 
                  open={hour.open}
                  close={hour.close}
                  onOpenChange={(value) => handleBusinessHourChange(index, 'open', value)}
                  onCloseChange={(value) => handleBusinessHourChange(index, 'close', value)}
                />
              ))}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-4 block">Contact Details</label>
              <div className="space-y-4">
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input 
                    placeholder="Phone number" 
                    className="pl-10"
                    value={profile.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input 
                    placeholder="Email address" 
                    className="pl-10"
                    value={profile.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Facebook className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input 
                      placeholder="Facebook" 
                      className="pl-10"
                      value={profile.socialFacebook}
                      onChange={(e) => handleInputChange('socialFacebook', e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input 
                      placeholder="Instagram" 
                      className="pl-10"
                      value={profile.socialInstagram}
                      onChange={(e) => handleInputChange('socialInstagram', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-4 block">Services and Categories</label>
              <div className="mb-4">
                {profile.categories.map((category) => (
                  <ServiceTag
                    key={category}
                    name={category}
                    onRemove={() => handleRemoveCategory(category)}
                  />
                ))}
              </div>
              <Button 
                variant="link" 
                className="text-blue-600 hover:text-blue-700 pl-0"
                onClick={() => setShowAddCategoryDialog(true)}
              >
                + Add more categories
              </Button>
            </div>
          </div>

          <Button 
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={handleSaveProfile}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 
                Saving Profile...
              </>
            ) : (
              "Save Profile"
            )}
          </Button>
        </main>

        <BottomNav />
      </div>

      {/* Dialog for adding a new category */}
      <Dialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-category">Category name</Label>
              <Input 
                id="new-category"
                placeholder="E.g. Bakery, Dairy, etc."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCategoryDialog(false)}>Cancel</Button>
            <Button onClick={handleAddCategory}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
