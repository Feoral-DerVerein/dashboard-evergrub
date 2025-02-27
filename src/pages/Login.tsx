
import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Apple, Eye, EyeOff, Phone } from "lucide-react";
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
                title: "Microsoft login",
                description: "Microsoft login is not implemented yet.",
              });
            }}
          >
            <img 
              src="/lovable-uploads/7733d227-8256-4c4e-b0f2-58b4d139a2d0.png"
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
            <Apple className="h-6 w-6" />
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
