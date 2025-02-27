
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

        <div className="flex flex-col gap-3 mt-6">
          <Button
            variant="outline"
            className="w-full py-6 flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50"
            onClick={() => {
              toast({
                title: "Google login",
                description: "Google login is not implemented yet.",
              });
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <Button
            variant="outline"
            className="w-full py-6 flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50"
            onClick={() => {
              toast({
                title: "Microsoft login",
                description: "Microsoft login is not implemented yet.",
              });
            }}
          >
            <img 
              src="/lovable-uploads/4d7d1605-e6de-47af-b7a1-e89abd4556c9.png"
              alt="Microsoft"
              className="w-6 h-6"
            />
            Continue with Microsoft
          </Button>

          <Button
            variant="outline"
            className="w-full py-6 flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50"
            onClick={() => {
              toast({
                title: "Apple login",
                description: "Apple login is not implemented yet.",
              });
            }}
          >
            <img
              src="/lovable-uploads/3cf8e062-db9e-4344-972d-e03254e40c3b.png"
              alt="Apple"
              className="w-6 h-6"
            />
            Continue with Apple
          </Button>

          <Button
            variant="outline"
            className="w-full py-6 flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50"
            onClick={() => {
              toast({
                title: "Phone login",
                description: "Phone login is not implemented yet.",
              });
            }}
          >
            <Phone className="h-6 w-6" />
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
    </div>
  );
};

export default Login;
