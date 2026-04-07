import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Activity,
  FileCheck,
  Clock,
  ArrowRight,
  Users,
  TrendingUp,
  Zap,
  Brain,
} from "lucide-react";
import { format } from "date-fns";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface ScanRow {
  id: string;
  image_type: string;
  status: string;
  created_at: string;
  patients: { patient_name: string } | null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, analyzing: 0, complete: 0, patients: 0 });
  const [recentScans, setRecentScans] = useState<ScanRow[]>([]);
  const [typeBreakdown, setTypeBreakdown] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: scans } = await supabase
        .from("scans")
        .select("id, image_type, status, created_at, patients(patient_name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (scans) {
        setRecentScans(scans as unknown as ScanRow[]);
      }

      const { count: totalCount } = await supabase.from("scans").select("*", { count: "exact", head: true }).eq("user_id", user.id);
      const { count: compCount } = await supabase.from("scans").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "complete");
      const { count: anaCount } = await supabase.from("scans").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "analyzing");
      const { count: patCount } = await supabase.from("patients").select("*", { count: "exact", head: true }).eq("user_id", user.id);

      setStats({
        total: totalCount ?? 0,
        analyzing: anaCount ?? 0,
        complete: compCount ?? 0,
        patients: patCount ?? 0,
      });

      // Type breakdown for chart
      const { data: allScans } = await supabase
        .from("scans")
        .select("image_type")
        .eq("user_id", user.id);

      if (allScans) {
        const counts: Record<string, number> = {};
        allScans.forEach((s) => {
          counts[s.image_type] = (counts[s.image_type] || 0) + 1;
        });
        setTypeBreakdown(
          Object.entries(counts).map(([k, v]) => ({
            name: k === "xray" ? "X-Ray" : k === "ct" ? "CT Scan" : "MRI",
            value: v,
          }))
        );
      }
    };
    fetchData();
  }, [user]);

  const statusColor = (s: string) =>
    s === "complete"
      ? "bg-success/10 text-success border-success/20"
      : s === "analyzing"
      ? "bg-warning/10 text-warning border-warning/20"
      : "bg-primary/10 text-primary border-primary/20";

  const typeLabel = (t: string) => (t === "xray" ? "X-Ray" : t === "ct" ? "CT Scan" : "MRI");

  const PIE_COLORS = [
    "hsl(210, 75%, 42%)",
    "hsl(195, 60%, 45%)",
    "hsl(152, 60%, 40%)",
  ];

  const completionRate = stats.total > 0 ? Math.round((stats.complete / stats.total) * 100) : 0;

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back to RadiologyAI</p>
          </div>
          <Button asChild className="gap-2 hover-lift">
            <Link to="/upload">
              <Upload className="h-4 w-4" />
              Upload Scan
            </Link>
          </Button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Scans", value: stats.total, icon: Activity, color: "primary" },
            { label: "Completed", value: stats.complete, icon: FileCheck, color: "success" },
            { label: "Analyzing", value: stats.analyzing, icon: Clock, color: "warning" },
            { label: "Patients", value: stats.patients, icon: Users, color: "accent" },
          ].map((item, i) => (
            <Card key={item.label} className="group hover-lift animate-in" style={{ animationDelay: `${i * 80}ms` }}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`rounded-xl bg-${item.color}/10 p-3 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`h-5 w-5 text-${item.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                  <p className="text-2xl font-bold tracking-tight">{item.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Completion rate & type breakdown */}
          <Card className="animate-in" style={{ animationDelay: "200ms" }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Analysis Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Completion Rate</span>
                  <span className="font-semibold">{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>

              {typeBreakdown.length > 0 ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Scan Types</p>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={typeBreakdown}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={55}
                          strokeWidth={2}
                        >
                          {typeBreakdown.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 justify-center">
                    {typeBreakdown.map((t, i) => (
                      <div key={t.name} className="flex items-center gap-1.5 text-xs">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-muted-foreground">{t.name} ({t.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Zap className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground">No scans yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent scans */}
          <Card className="lg:col-span-2 animate-in" style={{ animationDelay: "300ms" }}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Recent Scans
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/history" className="text-xs">
                  View all <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentScans.length === 0 ? (
                <div className="text-center py-12">
                  <div className="relative mx-auto w-16 h-16 mb-4">
                    <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse" />
                    <Activity className="h-8 w-8 absolute inset-0 m-auto text-muted-foreground/40" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">No scans yet</p>
                  <p className="text-xs text-muted-foreground mb-4">Upload your first scan to get started</p>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/upload">Upload Scan</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentScans.map((scan, i) => (
                    <Link
                      key={scan.id}
                      to={scan.status === "complete" ? `/analysis/${scan.id}` : "#"}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 group animate-in"
                      style={{ animationDelay: `${400 + i * 60}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-primary text-xs font-bold">
                          {typeLabel(scan.image_type).slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-sm group-hover:text-primary transition-colors">
                            {scan.patients?.patient_name ?? "Unknown Patient"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {typeLabel(scan.image_type)} · {format(new Date(scan.created_at), "MMM d, yyyy HH:mm")}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${statusColor(scan.status)} border text-xs`} variant="secondary">
                        {scan.status === "complete" ? "Complete" : scan.status === "analyzing" ? "Analyzing" : "Uploaded"}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in" style={{ animationDelay: "500ms" }}>
          {[
            { to: "/upload", label: "Upload New Scan", desc: "Analyze X-Ray, CT, or MRI", icon: Upload, gradient: "from-primary to-primary/80" },
            { to: "/patients", label: "Manage Patients", desc: "View and edit patient records", icon: Users, gradient: "from-accent to-accent/80" },
            { to: "/history", label: "Scan History", desc: "Browse all past analyses", icon: FileCheck, gradient: "from-success to-success/80" },
          ].map((action) => (
            <Link key={action.to} to={action.to}>
              <Card className="group hover-lift cursor-pointer h-full">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`rounded-xl bg-gradient-to-br ${action.gradient} p-3 text-primary-foreground group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
