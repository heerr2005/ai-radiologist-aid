import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Loader2, Shield, Zap, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { signIn, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (authLoading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel - branding */}
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
            AI-Powered Medical<br />Image Analysis
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-10 max-w-md">
            Upload medical scans and receive instant AI-generated diagnostic insights with confidence scoring and heatmap overlays.
          </p>
          <div className="space-y-4">
            {[
              { icon: Zap, text: "Instant AI analysis with mock Grad-CAM heatmaps" },
              { icon: Shield, text: "HIPAA-compliant secure data handling" },
              { icon: Activity, text: "Comprehensive diagnostic reports with PDF export" },
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

      {/* Right panel - form */}
      <div className="flex flex-1 items-center justify-center px-6">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4 lg:hidden">
              <div className="rounded-xl bg-gradient-to-br from-primary to-accent p-3">
                <Brain className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your RadiologyAI account</CardDescription>
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
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Sign In
              </Button>
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
