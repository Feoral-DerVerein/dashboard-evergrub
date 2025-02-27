
import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Phone } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // TODO: Add actual authentication logic here
    // For now, we'll just check if the fields are not empty
    if (email && password) {
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 pb-20">
      <div className="pt-10 flex justify-center">
        <img 
          src="/lovable-uploads/a18ff71a-0b3e-4795-a638-dd589a1a82ee.png"
          alt="WiseBite"
          className="h-6 w-auto"
        />
      </div>

      <div className="mt-12">
        <h1 className="text-3xl font-bold text-center mb-8">Welcome to WiseBite</h1>

        <div className="flex justify-center gap-12 mb-8">
          <button
            onClick={() => setActiveTab('login')}
            className={`text-lg ${
              activeTab === 'login'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400'
            } pb-2`}
          >
            Log In
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`text-lg ${
              activeTab === 'signup'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400'
            } pb-2`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-gray-50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="bg-gray-50 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-blue-500 text-sm">
              Forgot Password?
            </Link>
          </div>
          <Button
            type="submit"
            className="w-full bg-[#4C956C] hover:bg-[#3d7857] text-white py-6"
          >
            {activeTab === 'login' ? 'Log In' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-6 text-center text-gray-500">OR</div>

        <div className="mt-6 space-y-4">
          <button className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-full">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 11V8L17 12L12 16V13H7V11H12Z" fill="currentColor"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z" fill="currentColor"/>
            </svg>
            Continue with Google
          </button>
          
          <button className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-full">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="7" height="7" fill="#007FFF"/>
              <rect x="2" y="11" width="7" height="7" fill="#007FFF"/>
              <rect x="11" y="2" width="7" height="7" fill="#007FFF"/>
              <rect x="11" y="11" width="7" height="7" fill="#007FFF"/>
            </svg>
            Continue with Microsoft
          </button>
          
          <button className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-black text-white rounded-full">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.3866 10.5C14.3741 8.79904 15.2406 7.57389 16.9949 6.70365C16.0658 5.32943 14.6235 4.58029 12.7128 4.45216C10.9074 4.3288 8.9652 5.42501 8.32778 5.42501C7.64364 5.42501 5.92554 4.50633 4.55613 4.50633C2.31955 4.54402 0 6.24499 0 9.70432C0 10.9032 0.233391 12.1414 0.70043 13.4183C1.33759 15.1193 3.54656 19.4247 5.84645 19.3589C6.99333 19.3296 7.80317 18.5121 9.33309 18.5121C10.8121 18.5121 11.5613 19.3589 12.8429 19.3589C15.1694 19.3296 17.1616 15.428 17.7488 13.7232C14.7193 12.3042 14.3866 10.5583 14.3866 10.5Z" fill="white"/>
              <path d="M11.7989 3.24988C13.1261 1.66675 12.9925 0.219849 12.9425 0C11.7739 0.06269 10.4005 0.825175 9.58939 1.77632C8.68778 2.80253 8.22486 4.00002 8.35009 5.38823C9.60834 5.47627 10.5467 4.70443 11.7989 3.24988Z" fill="white"/>
            </svg>
            Continue with Apple
          </button>
          
          <button className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[#3B82F6] text-white rounded-full">
            <Phone className="h-5 w-5" />
            Continue with Phone
          </button>
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
    </div>
  );
};

export default Login;
