
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, User, Store, ShoppingBag, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { BottomNav } from "@/components/Dashboard";

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

interface StoreProfile {
  name: string;
  logo?: string | null;
}

const Account = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [storeProfile, setStoreProfile] = useState<StoreProfile | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Load user profile from localStorage
    const userJson = localStorage.getItem('user');
    if (userJson) {
      setUserProfile(JSON.parse(userJson));
    } else {
      // Redirect to login if not logged in
      navigate('/');
    }

    // Load store profile from localStorage if exists
    const storeJson = localStorage.getItem('storeProfile');
    if (storeJson) {
      const store = JSON.parse(storeJson);
      setStoreProfile({
        name: store.name,
        logo: store.logo
      });
    }
  }, [navigate]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && userProfile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedProfile = {
          ...userProfile,
          avatar: reader.result as string
        };
        setUserProfile(updatedProfile);
        localStorage.setItem('user', JSON.stringify(updatedProfile));
        
        toast({
          title: "Success",
          description: "Profile picture updated"
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully"
    });
    navigate('/');
  };

  if (!userProfile) {
    return null; // Wait for redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen pb-24">
        <header className="px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h1 className="text-xl font-semibold">Account</h1>
        </header>

        <main className="p-6">
          {/* User Profile Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-3">
              <Avatar className="w-24 h-24">
                <AvatarImage src={userProfile.avatar} />
                <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xl">
                  {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full cursor-pointer">
                <Camera className="h-4 w-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <h2 className="text-xl font-semibold">{userProfile.name}</h2>
            <p className="text-gray-500">{userProfile.email}</p>
          </div>

          {/* Account Menu */}
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start text-left py-6 border-gray-200"
              onClick={() => navigate('/profile')}
            >
              <User className="mr-3 h-5 w-5 text-gray-500" />
              <span>Edit Profile</span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-left py-6 border-gray-200"
              onClick={() => navigate('/store-profile')}
            >
              <Store className="mr-3 h-5 w-5 text-gray-500" />
              <span>Store Profile</span>
              {storeProfile && (
                <span className="ml-auto text-sm text-green-600">Created</span>
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-left py-6 border-gray-200"
              onClick={() => {
                if (!storeProfile) {
                  toast({
                    title: "Create store first",
                    description: "Please create your store profile before adding products",
                    variant: "destructive"
                  });
                  navigate('/store-profile');
                } else {
                  navigate('/products');
                }
              }}
            >
              <ShoppingBag className="mr-3 h-5 w-5 text-gray-500" />
              <span>My Products</span>
            </Button>

            <div className="pt-6">
              <Button
                variant="outline"
                className="w-full justify-center text-left py-6 text-red-600 border-red-200"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                <span>Log Out</span>
              </Button>
            </div>
          </div>

          {/* Store Information Card */}
          {storeProfile && (
            <div className="mt-8 border rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full mr-4 overflow-hidden flex items-center justify-center">
                  {storeProfile.logo ? (
                    <img src={storeProfile.logo} alt="Store logo" className="w-full h-full object-cover" />
                  ) : (
                    <Store className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{storeProfile.name}</h3>
                  <p className="text-sm text-gray-500">Your marketplace store</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-auto text-blue-600"
                  onClick={() => navigate('/store-profile')}
                >
                  Edit
                </Button>
              </div>
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Account;
