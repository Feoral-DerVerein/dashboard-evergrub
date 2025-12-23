import { useState, FormEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

import CompleteProfile from "@/components/CompleteProfile";


// Declare the spline-viewer custom element for TypeScript
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
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

  // Additional signup fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [businessType, setBusinessType] = useState("");

  // Complete profile modal state
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  const navigate = useNavigate();
  // Get auth methods from context
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const { toast } = useToast();

  // Check for OAuth callback and handle profile completion
  useEffect(() => {
    // With mocked auth, we might just check if user is already logged in
    // But since AuthContext handles state, we might redirect if user exists in context
    // The original logic checked URL params via auth provider
    // For migration purposes, we can simplify or remove this check if relying on AuthRoute/ProtectedRoute
  }, [navigate]);

  // Hide Spline Logo Logic
  useEffect(() => {
    const hideSplineLogo = () => {
      const viewer = document.querySelector('spline-viewer');
      if (viewer?.shadowRoot) {
        const style = document.createElement('style');
        style.textContent = '#logo, a[href*="spline.design"] { display: none !important; }';
        viewer.shadowRoot.appendChild(style);
      }
    };

    // Try immediately and then observe or retry
    hideSplineLogo();
    const interval = setInterval(hideSplineLogo, 1000); // Retry a few times just in case
    setTimeout(() => clearInterval(interval), 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log(`Attempting to ${activeTab} with email: ${email}`);
      if (activeTab === 'login') {
        const { error } = await signIn(email, password);

        if (error) throw new Error(error);

        console.log("Login successful");
        toast({
          title: "Login successful",
          description: "Welcome back!"
        });
        navigate("/negentropy", { replace: true });
      } else {
        // Validate all fields for signup
        if (!firstName || !lastName || !phone || !country || !businessType) {
          toast({
            title: "Error",
            description: "Please complete all fields before signing up",
            variant: "destructive"
          });
          return;
        }

        const { error } = await signUp(email, password, {
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          country: country,
          business_type: businessType
        });

        if (error) throw new Error(error);

        console.log("Registration successful");

        toast({
          title: "Registration successful",
          description: "Welcome! Redirecting to dashboard..."
        });
        setTimeout(() => {
          navigate("/negentropy", { replace: true });
        }, 1500);

        // Clear signup fields
        setFirstName("");
        setLastName("");
        setPhone("");
        setCountry("");
        setBusinessType("");
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

  const handleSocialLogin = async (provider: 'google') => {
    try {
      console.log(`Attempting login with ${provider}`);
      await signInWithGoogle();
      // Error handling is inside signInWithGoogle or swallowed for mock
    } catch (error: any) {
      console.error(`Error with ${provider}:`, error);
      toast({
        title: "Error",
        description: error.message || `There was a problem with ${provider} login`,
        variant: "destructive"
      });
    }
  };

  const handleResendConfirmation = async () => {
    toast({
      title: "Info",
      description: "Email confirmation disabled during migration.",
    });
  };
  return <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
    {/* Complete Profile Modal */}
    <CompleteProfile
      open={showCompleteProfile}
      onComplete={() => {
        setShowCompleteProfile(false);
        navigate("/negentropy", { replace: true });
      }}
      userId={currentUserId}
      email={currentUserEmail}
    />

    {/* Spline Background with Fallback Gradient */}
    <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900 to-black">
      <spline-viewer url="https://prod.spline.design/JM7ixbJx6pmDGkyo/scene.splinecode" style={{
        width: '100%',
        height: '100%'
      }} />
    </div>

    {/* Hide Spline watermark */}
    <style>{`
        spline-viewer .logo {
          display: none !important;
        }
        spline-viewer a[href*="spline.design"] {
          display: none !important;
        }
      `}</style>



    <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 relative z-10">
      <div className="flex flex-col items-center mb-8 space-y-3">
        <img src="/lovable-uploads/negentropy-icon-blue-sparkles.png" alt="Negentropy AI" className="h-16 w-auto object-contain" />
        <span className="text-2xl font-bold tracking-tight text-white">Negentropy AI</span>
      </div>

      {/* Login Title */}


      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Signup-only fields */}
        {activeTab === 'signup' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="text"
                placeholder="First Name"
                className="bg-white/80 border-gray-200 rounded-full py-3 px-4 text-gray-700 placeholder-gray-500 focus:bg-white focus:border-gray-300"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
              />
              <Input
                type="text"
                placeholder="Last Name"
                className="bg-white/80 border-gray-200 rounded-full py-3 px-4 text-gray-700 placeholder-gray-500 focus:bg-white focus:border-gray-300"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
              />
            </div>

            <Input
              type="tel"
              placeholder="Phone Number"
              className="bg-white/80 border-gray-200 rounded-full py-3 px-4 text-gray-700 placeholder-gray-500 focus:bg-white focus:border-gray-300"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />

            <Input
              type="text"
              placeholder="Country"
              className="bg-white/80 border-gray-200 rounded-full py-3 px-4 text-gray-700 placeholder-gray-500 focus:bg-white focus:border-gray-300"
              value={country}
              onChange={e => setCountry(e.target.value)}
              required
            />

            <Input
              type="text"
              placeholder="Business Type (e.g., Cafe, Restaurant)"
              className="bg-white/80 border-gray-200 rounded-full py-3 px-4 text-gray-700 placeholder-gray-500 focus:bg-white focus:border-gray-300"
              value={businessType}
              onChange={e => setBusinessType(e.target.value)}
              required
            />
          </>
        )}

        {/* Email Input */}
        <div>
          <Input type="email" placeholder={activeTab === 'login' ? "Username or email" : "Email"} className="bg-white/80 border-gray-200 rounded-full py-3 px-4 text-gray-700 placeholder-gray-500 focus:bg-white focus:border-gray-300" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>

        {/* Password Input */}
        <div className="relative">
          <Input type={showPassword ? "text" : "password"} placeholder="Password" className="bg-white/80 border-gray-200 rounded-full py-3 px-4 pr-12 text-gray-700 placeholder-gray-500 focus:bg-white focus:border-gray-300" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-semibold tracking-wide uppercase mt-6" disabled={loading}>
          {loading ? "Processing..." : activeTab === 'login' ? 'LOG IN' : 'SIGN UP'}
        </Button>
      </form>

      {/* Resend Confirmation - Only in Signup */}
      {activeTab === 'signup' && (
        <div className="text-center mt-4">
          <button
            onClick={handleResendConfirmation}
            className="text-white/60 hover:text-white text-sm"
            disabled={loading}
          >
            Resend confirmation email
          </button>
        </div>
      )}

      {/* Toggle between Login/Signup */}
      <div className="text-center mt-6">
        <button onClick={() => setActiveTab(activeTab === 'login' ? 'signup' : 'login')} className="text-white/80 hover:text-white text-sm">
          {activeTab === 'login' ? "Don't have an account?" : "Already have an account?"}
        </button>
      </div>

      {/* Forgot Password - Only in Login */}
      {activeTab === 'login' && (
        <div className="text-center mt-4">
          <Link to="/forgot-password" className="text-white/60 hover:text-white text-sm">
            Forgot Password?
          </Link>
        </div>
      )}

      {/* Social Login */}
      <div className="mt-8">
        <Button variant="outline" className="w-full py-3 flex items-center justify-center gap-3 rounded-full bg-white/60 border-gray-200 text-gray-700 hover:bg-white/80" onClick={() => handleSocialLogin('google')} disabled={loading}>
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
  </div>;
};
export default Login;