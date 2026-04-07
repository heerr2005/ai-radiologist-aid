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
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back to RadiologyAI</p>
          </div>
          <Button asChild className="gap-2 w-full sm:w-auto">
            <Link to="/upload">
              <Upload className="h-4 w-4" />
              Upload Scan
            </Link>
          </Button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="group hover:shadow-md transition-all">
            <CardContent className="flex items-center gap-3 p-4 sm:p-5">
              <div className="rounded-xl bg-primary/10 p-2.5 sm:p-3 group-hover:scale-110 transition-transform shrink-0">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Total Scans</p>
                <p className="text-xl sm:text-2xl font-bold tracking-tight">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="group hover:shadow-md transition-all">
            <CardContent className="flex items-center gap-3 p-4 sm:p-5">
              <div className="rounded-xl bg-success/10 p-2.5 sm:p-3 group-hover:scale-110 transition-transform shrink-0">
                <FileCheck className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Completed</p>
                <p className="text-xl sm:text-2xl font-bold tracking-tight">{stats.complete}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="group hover:shadow-md transition-all">
            <CardContent className="flex items-center gap-3 p-4 sm:p-5">
              <div className="rounded-xl bg-warning/10 p-2.5 sm:p-3 group-hover:scale-110 transition-transform shrink-0">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Analyzing</p>
                <p className="text-xl sm:text-2xl font-bold tracking-tight">{stats.analyzing}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="group hover:shadow-md transition-all">
            <CardContent className="flex items-center gap-3 p-4 sm:p-5">
              <div className="rounded-xl bg-accent/10 p-2.5 sm:p-3 group-hover:scale-110 transition-transform shrink-0">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Patients</p>
                <p className="text-xl sm:text-2xl font-bold tracking-tight">{stats.patients}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Completion rate & type breakdown */}
          <Card>
            <CardHeader className="pb-3 p-4 sm:p-6 sm:pb-3">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Analysis Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 px-4 sm:px-6">
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
                  <div className="h-28 sm:h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={typeBreakdown}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={48}
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
                  <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 justify-center">
                    {typeBreakdown.map((t, i) => (
                      <div key={t.name} className="flex items-center gap-1.5 text-[10px] sm:text-xs">
                        <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
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
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-6 sm:pb-3">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Recent Scans
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/history" className="text-xs">
                  View all <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {recentScans.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="relative mx-auto w-14 h-14 sm:w-16 sm:h-16 mb-4">
                    <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse" />
                    <Activity className="h-7 w-7 sm:h-8 sm:w-8 absolute inset-0 m-auto text-muted-foreground/40" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">No scans yet</p>
                  <p className="text-xs text-muted-foreground mb-4">Upload your first scan to get started</p>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/upload">Upload Scan</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentScans.map((scan) => (
                    <Link
                      key={scan.id}
                      to={scan.status === "complete" ? `/analysis/${scan.id}` : "#"}
                      className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg border border-border hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-primary text-[10px] sm:text-xs font-bold shrink-0">
                          {typeLabel(scan.image_type).slice(0, 2)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-xs sm:text-sm group-hover:text-primary transition-colors truncate">
                            {scan.patients?.patient_name ?? "Unknown Patient"}
                          </p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                            {typeLabel(scan.image_type)} · {format(new Date(scan.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${statusColor(scan.status)} border text-[10px] sm:text-xs shrink-0 ml-2`} variant="secondary">
                        {scan.status === "complete" ? "Done" : scan.status === "analyzing" ? "Pending" : "New"}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Link to="/upload">
            <Card className="group hover:shadow-md cursor-pointer h-full transition-all">
              <CardContent className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                <div className="rounded-xl bg-gradient-to-br from-primary to-primary/80 p-2.5 sm:p-3 text-primary-foreground group-hover:scale-110 transition-transform shrink-0">
                  <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Upload New Scan</p>
                  <p className="text-xs text-muted-foreground">Analyze X-Ray, CT, or MRI</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/patients">
            <Card className="group hover:shadow-md cursor-pointer h-full transition-all">
              <CardContent className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                <div className="rounded-xl bg-gradient-to-br from-accent to-accent/80 p-2.5 sm:p-3 text-primary-foreground group-hover:scale-110 transition-transform shrink-0">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Manage Patients</p>
                  <p className="text-xs text-muted-foreground">View and edit records</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/history">
            <Card className="group hover:shadow-md cursor-pointer h-full transition-all">
              <CardContent className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                <div className="rounded-xl bg-gradient-to-br from-success to-success/80 p-2.5 sm:p-3 text-primary-foreground group-hover:scale-110 transition-transform shrink-0">
                  <FileCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Scan History</p>
                  <p className="text-xs text-muted-foreground">Browse past analyses</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
