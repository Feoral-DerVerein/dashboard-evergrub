
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useSignIn, useSignUp } from "@clerk/clerk-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, isLoading: isSigningIn } = useSignIn();
  const { signUp, isLoading: isSigningUp } = useSignUp();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (activeTab === 'login') {
        const result = await signIn?.create({
          identifier: email,
          password,
        });
        
        if (result?.status === "complete") {
          toast({
            title: "Login successful",
            description: "Welcome back!",
          });
          navigate("/dashboard");
        }
      } else {
        const result = await signUp?.create({
          emailAddress: email,
          password,
        });
        
        if (result?.status === "complete") {
          toast({
            title: "Sign up successful",
            description: "Welcome to WiseBite!",
          });
          navigate("/dashboard");
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 pb-20">
      <div className="pt-10 flex justify-center">
        <div className="text-[#4C956C] text-3xl font-semibold">wisebite</div>
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
            disabled={isSigningIn || isSigningUp}
          >
            {activeTab === 'login' ? (
              isSigningIn ? 'Signing in...' : 'Log In'
            ) : (
              isSigningUp ? 'Signing up...' : 'Sign Up'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-gray-500">OR</div>

        <Button
          variant="outline"
          className="w-full mt-6 py-6 flex items-center justify-center gap-2"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </Button>

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
