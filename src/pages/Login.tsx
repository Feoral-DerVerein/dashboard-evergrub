import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Smartphone } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Provider } from "@supabase/supabase-js";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    signInWithGoogle
  } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (activeTab === 'login') {
        const {
          data,
          error
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        toast({
          title: "Login successful",
          description: "Welcome back!"
        });
        navigate("/dashboard");
      } else {
        const {
          data,
          error
        } = await supabase.auth.signUp({
          email,
          password
        });
        if (error) throw error;
        toast({
          title: "Registration successful",
          description: "Your account has been created. Check your email to verify it."
        });
      }
    } catch (error: any) {
      console.error("Error de autenticación:", error);
      toast({
        title: "Error",
        description: error.message || "Ocurrió un problema durante la autenticación",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'microsoft' | 'apple') => {
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        const {
          data,
          error
        } = await supabase.auth.signInWithOAuth({
          provider: provider as Provider,
          options: {
            redirectTo: window.location.origin + '/dashboard'
          }
        });
        if (error) throw error;
      }
    } catch (error: any) {
      console.error(`Error con ${provider}:`, error);
      toast({
        title: "Error",
        description: error.message || `Hubo un problema con el inicio de sesión de ${provider}`,
        variant: "destructive"
      });
    }
  };

  return <div className="min-h-screen bg-white px-6 pb-20">
      <div className="pt-10 flex justify-center">
        <img src="/lovable-uploads/33cb00f3-3fd6-4357-9976-3db12a4c11a6.png" alt="Evergrub Logo" className="h-16 w-auto" />
      </div>

      <div className="mt-8">
        <h1 className="text-center mb-8 text-xl text-emerald-700 font-bold">Welcome to Evergrub</h1>

        <div className="flex justify-center gap-12 mb-8">
          <button onClick={() => setActiveTab('login')} className={`text-lg ${activeTab === 'login' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'} pb-2`}>
            Log In
          </button>
          <button onClick={() => setActiveTab('signup')} className={`text-lg ${activeTab === 'signup' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'} pb-2`}>
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input type="email" placeholder="Enter your email" className="bg-gray-50" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="relative">
            <Input type={showPassword ? "text" : "password"} placeholder="Enter your password" className="bg-gray-50 pr-10" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
            </button>
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-blue-500 text-sm">
              Forgot Password?
            </Link>
          </div>
          <Button type="submit" className="w-full bg-[#4C956C] hover:bg-[#3d7857] text-white py-6" disabled={loading}>
            {loading ? "Procesando..." : activeTab === 'login' ? 'Log In' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-6 text-center text-gray-500">OR</div>

        <div className="space-y-4 mt-6">
          <Button variant="outline" className="w-full py-6 flex items-center justify-center gap-3 rounded-full border-gray-300" onClick={() => handleSocialLogin('google')} disabled={loading}>
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
              </g>
            </svg>
            Continue with Google
          </Button>

          <Button variant="outline" className="w-full py-6 flex items-center justify-center gap-3 rounded-full border-gray-300" onClick={() => handleSocialLogin('microsoft')} disabled={loading}>
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" fill="#f25022" />
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
              <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
              <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
            </svg>
            Continue with Microsoft
          </Button>

          <Button variant="outline" className="w-full py-6 flex items-center justify-center gap-3 rounded-full bg-black text-white border-0" onClick={() => handleSocialLogin('apple')} disabled={loading}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="21" viewBox="0 0 18 21" fill="none">
              <path d="M14.9883 11.2093C14.9633 8.51777 17.13 7.28027 17.22 7.22277C15.8925 5.25527 13.815 4.95277 13.0875 4.93027C11.3775 4.76027 9.7275 5.93027 8.865 5.93027C7.9875 5.93027 6.645 4.94277 5.2125 4.97027C3.375 4.99777 1.6575 6.04777 0.735 7.70777C-1.1775 11.0803 0.27 16.0503 2.115 18.7053C3.03 20.0053 4.1025 21.4653 5.5125 21.4128C6.8925 21.3603 7.425 20.5353 9.09 20.5353C10.74 20.5353 11.2425 21.4128 12.6825 21.3828C14.16 21.3603 15.09 20.0653 15.975 18.7578C17.055 17.2578 17.49 15.7953 17.505 15.7203C17.475 15.7053 15.0225 14.7303 14.9883 11.2093Z" fill="white" />
              <path d="M12.2102 3.37509C12.9527 2.45259 13.4552 1.19259 13.3052 -0.0849114C12.2477 -0.0449114 10.9227 0.667589 10.1502 1.56009C9.4677 2.35259 8.8677 3.65259 9.0327 4.88759C10.2227 4.97259 11.4377 4.28259 12.2102 3.37509Z" fill="white" />
            </svg>
            Continue with Apple
          </Button>

          <Button variant="outline" className="w-full py-6 flex items-center justify-center gap-3 rounded-full bg-blue-500 text-white border-0" onClick={() => {
          toast({
            title: "Phone login",
            description: "Phone authentication not implemented yet"
          });
        }} disabled={loading}>
            <Smartphone className="h-5 w-5" />
            Continue with Phone
          </Button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          By continuing, you agree to our{" "}
          <Link to="/terms" className="text-gray-600">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-gray-600">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>;
};

export default Login;
