import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      setUser(user);

      // Fetch profile data
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else {
        setProfile(profileData);
      }
    } catch (error) {
      console.error("Error checking user:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out"
      });
      
      navigate("/login");
    } catch (error: any) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to log out",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              Welcome to Negentropy Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">User Information</h3>
                <div className="mt-2 space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium">Name:</span>{" "}
                    {profile?.first_name && profile?.last_name
                      ? `${profile.first_name} ${profile.last_name}`
                      : "Not set"}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Email:</span> {user?.email}
                  </p>
                  {profile?.phone && (
                    <p className="text-gray-600">
                      <span className="font-medium">Phone:</span> {profile.phone}
                    </p>
                  )}
                  {profile?.country && (
                    <p className="text-gray-600">
                      <span className="font-medium">Country:</span> {profile.country}
                    </p>
                  )}
                  {profile?.business_type && (
                    <p className="text-gray-600">
                      <span className="font-medium">Business Type:</span> {profile.business_type}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button 
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full sm:w-auto"
                >
                  Log Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
