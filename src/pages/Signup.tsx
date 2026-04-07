import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Loader2, Shield, Zap, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const { signUp, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (authLoading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password);
    if (error) {
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Account created!", description: "You can now sign in." });
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-accent relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-primary-foreground/10 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-primary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="rounded-xl bg-primary-foreground/20 p-3">
              <Brain className="h-8 w-8" />
            </div>
            <span className="text-3xl font-bold">RadiologyAI</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Start Analyzing<br />in Minutes
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-10 max-w-md">
            Create your free account and get instant access to AI-powered radiology analysis tools.
          </p>
          <div className="space-y-4">
            {[
              { icon: Zap, text: "Instant AI analysis with mock Grad-CAM heatmaps" },
              { icon: Shield, text: "Secure, encrypted data storage" },
              { icon: Activity, text: "Downloadable PDF diagnostic reports" },
            ].map((feature) => (
              <div key={feature.text} className="flex items-center gap-3">
                <div className="rounded-lg bg-primary-foreground/15 p-2">
                  <feature.icon className="h-4 w-4" />
                </div>
                <span className="text-sm text-primary-foreground/90">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center px-6">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4 lg:hidden">
              <div className="rounded-xl bg-gradient-to-br from-primary to-accent p-3">
                <Brain className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>Get started with AI-powered radiology analysis</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="doctor@hospital.com" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input id="confirm" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="h-11" />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Account
              </Button>
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
