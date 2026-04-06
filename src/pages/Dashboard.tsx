import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Activity, FileCheck, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface ScanRow {
  id: string;
  image_type: string;
  status: string;
  created_at: string;
  patients: { patient_name: string } | null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, analyzing: 0, complete: 0 });
  const [recentScans, setRecentScans] = useState<ScanRow[]>([]);

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
        const total = scans.length;
        const analyzing = scans.filter((s) => s.status === "analyzing").length;
        const complete = scans.filter((s) => s.status === "complete").length;
        // Get real total count
        const { count } = await supabase.from("scans").select("*", { count: "exact", head: true }).eq("user_id", user.id);
        const { count: compCount } = await supabase.from("scans").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "complete");
        const { count: anaCount } = await supabase.from("scans").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "analyzing");
        setStats({ total: count ?? 0, analyzing: anaCount ?? 0, complete: compCount ?? 0 });
      }
    };
    fetchData();
  }, [user]);

  const statusColor = (s: string) =>
    s === "complete" ? "bg-green-100 text-green-800" : s === "analyzing" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800";

  const typeLabel = (t: string) => t === "xray" ? "X-Ray" : t === "ct" ? "CT Scan" : "MRI";

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back to RadiologyAI</p>
          </div>
          <Button asChild>
            <Link to="/upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload Scan
            </Link>
          </Button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-primary/10 p-3">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Scans</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-yellow-100 p-3">
                <Clock className="h-5 w-5 text-yellow-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Analysis</p>
                <p className="text-2xl font-bold">{stats.analyzing}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-green-100 p-3">
                <FileCheck className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.complete}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent scans */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Scans</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/history">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentScans.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>No scans yet. Upload your first scan to get started.</p>
                <Button asChild className="mt-4" variant="outline">
                  <Link to="/upload">Upload Scan</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentScans.map((scan) => (
                  <Link
                    key={scan.id}
                    to={scan.status === "complete" ? `/analysis/${scan.id}` : "#"}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-sm">{scan.patients?.patient_name ?? "Unknown Patient"}</p>
                        <p className="text-xs text-muted-foreground">
                          {typeLabel(scan.image_type)} · {format(new Date(scan.created_at), "MMM d, yyyy HH:mm")}
                        </p>
                      </div>
                    </div>
                    <Badge className={statusColor(scan.status)} variant="secondary">
                      {scan.status === "complete" ? "Complete" : scan.status === "analyzing" ? "Analyzing" : "Uploaded"}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
