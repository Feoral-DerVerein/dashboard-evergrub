import { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Camera, Upload, Plus, X } from "lucide-react";
import BottomNav from "@/components/navigation/BottomNav";

interface StoreInfo {
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  categories: string[];
}

const StoreProfile = () => {
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    categories: ["Food & Beverage"],
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [photoGallery, setPhotoGallery] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStoreInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoGallery(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotoGallery(prev => prev.filter((_, i) => i !== index));
  };

  const addCategory = () => {
    if (newCategory && !storeInfo.categories.includes(newCategory)) {
      setStoreInfo(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory]
      }));
      setNewCategory("");
    }
  };

  const removeCategory = (category: string) => {
    setStoreInfo(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category)
    }));
  };

  const handleSave = async () => {
    if (!storeInfo.name || !storeInfo.description) {
      toast({
        title: "Error",
        description: "Store name and description are required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      localStorage.setItem('storeProfile', JSON.stringify({
        ...storeInfo,
        logo: logoPreview,
        cover: coverPreview,
        gallery: photoGallery
      }));
      
      toast({
        title: "Success",
        description: "Store profile saved successfully",
      });
      
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save store profile",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    setTimeout(() => navigate("/"), 0);
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <header className="px-6 py-4 border-b sticky top-0 bg-white z-10 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Store Profile</h1>
          <Button 
            variant="ghost" 
            className="text-blue-600 hover:text-blue-700"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </header>

        <main className="p-6 space-y-6">
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Store logo" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <label htmlFor="logo-upload" className="absolute bottom-0 right-0 rounded-full bg-blue-600 hover:bg-blue-700 p-2 cursor-pointer">
                <Plus className="h-4 w-4 text-white" />
                <input 
                  id="logo-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleLogoChange}
                />
              </label>
            </div>
            <span className="text-sm text-gray-600">Upload Store Logo</span>
          </div>

          <div className="relative h-40 bg-gray-100 rounded-lg flex items-center justify-center group overflow-hidden">
            {coverPreview ? (
              <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-gray-400 group-hover:text-gray-600">
                <Camera className="w-8 h-8 mb-2" />
                <span className="text-sm">Add Cover Photo</span>
              </div>
            )}
            <label htmlFor="cover-upload" className="absolute bottom-4 right-4 rounded-full bg-blue-600 hover:bg-blue-700 p-2 cursor-pointer z-10">
              <Plus className="h-4 w-4 text-white" />
              <input 
                id="cover-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleCoverChange}
              />
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Store Name</label>
              <Input 
                name="name"
                placeholder="Enter your store name" 
                value={storeInfo.name}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
              <Textarea 
                name="description"
                placeholder="Tell customers about your business..." 
                className="h-24"
                value={storeInfo.description}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Address</label>
              <Input 
                name="address"
                placeholder="Store address" 
                value={storeInfo.address}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Contact Details</label>
              <div className="space-y-3">
                <Input 
                  name="phone"
                  placeholder="Phone number" 
                  value={storeInfo.phone}
                  onChange={handleInputChange}
                />
                <Input 
                  name="email"
                  placeholder="Email address" 
                  value={storeInfo.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Store Categories</label>
              <div className="flex flex-wrap mb-3">
                {storeInfo.categories.map((category) => (
                  <div key={category} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full mr-2 mb-2">
                    <span className="text-sm text-gray-600">{category}</span>
                    <button onClick={() => removeCategory(category)} className="text-gray-400 hover:text-gray-600">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Add category" 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={addCategory} variant="secondary">Add</Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Photo Gallery</label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {photoGallery.map((photo, index) => (
                  <div key={index} className="relative aspect-square bg-gray-100 rounded overflow-hidden">
                    <img src={photo} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                    <button 
                      className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 rounded-full p-1"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
                <label className="aspect-square bg-gray-100 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                  <Upload className="h-6 w-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Add Photos</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    multiple
                    onChange={handleGalleryUpload}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">Upload photos of your products to showcase in your store</p>
            </div>
          </div>

          <Button 
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default StoreProfile;
