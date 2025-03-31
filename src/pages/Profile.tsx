
import { useState } from "react";
import { Link } from "react-router-dom";
import { Camera, MapPin, Clock, Phone, Mail, Facebook, Instagram, Plus, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BottomNav } from "@/components/Dashboard";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { profileImageService } from "@/services/profileImageService";

const BusinessHourRow = ({ day }: { day: string }) => (
  <div className="flex items-center gap-4 mb-4">
    <span className="w-24 text-sm text-gray-600">{day}</span>
    <Input type="time" defaultValue="09:00" className="w-24" />
    <span className="text-gray-400">-</span>
    <Input type="time" defaultValue="18:00" className="w-24" />
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
  const [categories, setCategories] = useState(["Dairy", "Bakery", "Coffee", "Food & Beverage"]);
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  
  // Función para manejar la eliminación de categorías
  const handleRemoveCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category));
  };

  // Función para manejar la subida del logo
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setUploadingLogo(true);
    
    try {
      const url = await profileImageService.uploadProfileImage(file, 'logo');
      if (url) {
        setLogoUrl(url);
        toast({
          title: "Logo actualizado",
          description: "La imagen de logo se ha actualizado correctamente",
        });
      }
    } catch (error) {
      console.error("Error al subir el logo:", error);
      toast({
        title: "Error",
        description: "No se pudo subir el logo",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  // Función para manejar la subida de la imagen de portada
  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setUploadingCover(true);
    
    try {
      const url = await profileImageService.uploadProfileImage(file, 'cover');
      if (url) {
        setCoverUrl(url);
        toast({
          title: "Imagen de portada actualizada",
          description: "La imagen de portada se ha actualizado correctamente",
        });
      }
    } catch (error) {
      console.error("Error al subir la imagen de portada:", error);
      toast({
        title: "Error",
        description: "No se pudo subir la imagen de portada",
        variant: "destructive",
      });
    } finally {
      setUploadingCover(false);
    }
  };

  // Función para guardar el perfil
  const handleSaveProfile = () => {
    toast({
      title: "Perfil guardado",
      description: "Los cambios se han guardado correctamente",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <header className="px-6 py-4 border-b sticky top-0 bg-white z-10 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Store Profile</h1>
          <Button 
            variant="ghost" 
            className="text-blue-600 hover:text-blue-700"
            onClick={handleSaveProfile}
          >
            Save
          </Button>
        </header>

        <main className="p-6 space-y-6">
          {/* Store Logo */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={logoUrl} />
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

          {/* Cover Photo */}
          <div className="relative h-40 bg-gray-100 rounded-lg flex items-center justify-center group overflow-hidden">
            {coverUrl ? (
              <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
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

          {/* Store Details */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Store Name</label>
              <Input placeholder="Enter your store name" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Textarea placeholder="Tell customers about your business..." className="h-24" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input placeholder="Add your store address" className="pl-10" />
              </div>
            </div>

            {/* Business Hours */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-4 block">Business Hours</label>
              <BusinessHourRow day="Monday" />
              <BusinessHourRow day="Tuesday" />
              <BusinessHourRow day="Wednesday" />
              <BusinessHourRow day="Thursday" />
              <BusinessHourRow day="Friday" />
            </div>

            {/* Contact Details */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-4 block">Contact Details</label>
              <div className="space-y-4">
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input placeholder="Phone number" className="pl-10" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input placeholder="Email address" className="pl-10" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Facebook className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input placeholder="Facebook" className="pl-10" />
                  </div>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input placeholder="Instagram" className="pl-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Services & Categories */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-4 block">Services & Categories</label>
              <div className="mb-4">
                {categories.map((category) => (
                  <ServiceTag
                    key={category}
                    name={category}
                    onRemove={() => handleRemoveCategory(category)}
                  />
                ))}
              </div>
              <Button variant="link" className="text-blue-600 hover:text-blue-700 pl-0">
                + Add More Categories
              </Button>
            </div>
          </div>

          {/* Save Button */}
          <Button 
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={handleSaveProfile}
          >
            Save Profile
          </Button>
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Profile;
