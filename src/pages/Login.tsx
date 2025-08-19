import { useState, FormEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Smartphone } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Provider } from "@supabase/supabase-js";

// Declare the spline-viewer custom element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': {
        url?: string;
        style?: React.CSSProperties;
      };
    }
  }
}

// Add Spline viewer script to document head
if (typeof window !== 'undefined' && !document.querySelector('script[src*="spline-viewer"]')) {
  const script = document.createElement('script');
  script.type = 'module';
  script.src = 'https://unpkg.com/@splinetool/viewer@1.10.48/build/spline-viewer.js';
  document.head.appendChild(script);
}

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      console.log(`Attempting to ${activeTab} with email: ${email}`);
      
      if (activeTab === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        console.log("Login successful", data);
        toast({
          title: "Login successful",
          description: "Welcome back!"
        });
        
        navigate("/dashboard", { replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });
        
        if (error) throw error;
        
        console.log("Registration successful", data);
        toast({
          title: "Registration successful",
          description: "Your account has been created. Check your email to verify it."
        });
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred during authentication",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'microsoft' | 'apple') => {
    try {
      console.log(`Attempting login with ${provider}`);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as Provider,
        options: {
          redirectTo: window.location.origin + '/dashboard'
        }
      });
      
      if (error) throw error;
      console.log(`${provider} login initiated`, data);
    } catch (error: any) {
      console.error(`Error with ${provider}:`, error);
      toast({
        title: "Error",
        description: error.message || `There was a problem with ${provider} login`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Spline Background */}
      <div className="absolute inset-0 z-0">
        <spline-viewer 
          url="https://prod.spline.design/JM7ixbJx6pmDGkyo/scene.splinecode"
          style={{width: '100%', height: '100%'}}
        />
      </div>
      
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/lovable-uploads/030dbcde-90ed-4ac5-a577-ac0ec9e12bdd.png" alt="Negentropy" className="h-12 w-auto" />
        </div>

        {/* Login Title */}
        <h1 className="text-xl font-bold text-white text-center mb-8 tracking-wider">
          Welcome to Negentropy
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <Input 
              type="email" 
              placeholder={activeTab === 'login' ? "Username or email" : "Email"}
              className="bg-white/80 border-gray-200 rounded-full py-3 px-4 text-gray-700 placeholder-gray-500 focus:bg-white focus:border-gray-300" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              className="bg-white/80 border-gray-200 rounded-full py-3 px-4 pr-12 text-gray-700 placeholder-gray-500 focus:bg-white focus:border-gray-300" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-semibold tracking-wide uppercase mt-6" 
            disabled={loading}
          >
            {loading ? "Processing..." : activeTab === 'login' ? 'LOG IN' : 'SIGN UP'}
          </Button>
        </form>

        {/* Toggle between Login/Signup */}
        <div className="text-center mt-6">
          <button 
            onClick={() => setActiveTab(activeTab === 'login' ? 'signup' : 'login')} 
            className="text-white/80 hover:text-white text-sm"
          >
            {activeTab === 'login' ? "Don't have an account?" : "Already have an account?"}
          </button>
        </div>

        {/* Forgot Password */}
        {activeTab === 'login' && (
          <div className="text-center mt-4">
            <Link to="/forgot-password" className="text-white/60 hover:text-white text-sm">
              Forgot Password?
            </Link>
          </div>
        )}

        {/* Social Login */}
        <div className="mt-8 space-y-3">
          <Button 
            variant="outline" 
            className="w-full py-3 flex items-center justify-center gap-3 rounded-full bg-white/60 border-gray-200 text-gray-700 hover:bg-white/80" 
            onClick={() => handleSocialLogin('google')} 
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
              </g>
            </svg>
            Continue with Google
          </Button>

          <Button 
            variant="outline" 
            className="w-full py-3 flex items-center justify-center gap-3 rounded-full bg-white/60 border-gray-200 text-gray-700 hover:bg-white/80" 
            onClick={() => handleSocialLogin('microsoft')} 
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" fill="#f25022" />
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
              <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
              <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
            </svg>
            Continue with Microsoft
          </Button>
        </div>

        {/* Terms and Privacy */}
        <p className="text-center text-white/60 text-xs mt-6">
          By continuing, you agree to our{" "}
          <Link to="/terms" className="text-white/80 hover:text-white underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-white/80 hover:text-white underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
