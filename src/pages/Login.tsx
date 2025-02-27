
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

        <div className="space-y-3 mt-6">
          <Button
            variant="outline"
            className="w-full py-6 flex items-center justify-center gap-2"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-5 h-5"
            />
            Continue with Google
          </Button>

          <Button
            variant="outline"
            className="w-full py-6 flex items-center justify-center gap-2"
          >
            <img
              src="/lovable-uploads/837a0a08-ba1b-4f30-a8c9-e22a6d00bdd0.png"
              alt="Microsoft"
              className="w-5 h-5"
            />
            Continue with Microsoft
          </Button>

          <Button
            variant="outline"
            className="w-full py-6 flex items-center justify-center gap-2"
          >
            <img
              src="/lovable-uploads/58d00e1b-97a1-4353-8b05-21178e8474df.png"
              alt="Apple"
              className="w-5 h-5"
            />
            Continue with Apple
          </Button>

          <Button
            variant="outline"
            className="w-full py-6 flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5 text-gray-600" />
            Connect with Phone
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
    </div>
  );
};

export default Login;
