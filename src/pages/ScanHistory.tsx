import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ExternalLink, Activity } from "lucide-react";
import { format } from "date-fns";

interface ScanRow {
  id: string;
  image_type: string;
  status: string;
  created_at: string;
  notes: string | null;
  image_url: string;
  patients: { patient_name: string; patient_id_number: string | null } | null;
}

export default function ScanHistory() {
  const { user } = useAuth();
  const [scans, setScans] = useState<ScanRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    const fetchScans = async () => {
      const { data } = await supabase
        .from("scans")
        .select("id, image_type, status, created_at, notes, image_url, patients(patient_name, patient_id_number)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setScans(data as unknown as ScanRow[]);
    };
    fetchScans();
  }, [user]);

  const filtered = scans.filter((s) => {
    const matchSearch = !search || s.patients?.patient_name?.toLowerCase().includes(search.toLowerCase()) || s.patients?.patient_id_number?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    const matchType = typeFilter === "all" || s.image_type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const statusColor = (s: string) =>
    s === "complete" ? "bg-green-100 text-green-800" : s === "analyzing" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800";
  const typeLabel = (t: string) => t === "xray" ? "X-Ray" : t === "ct" ? "CT Scan" : "MRI";

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Scan History</h1>
          <Button asChild>
            <Link to="/upload">New Scan</Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name or ID..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="uploaded">Uploaded</SelectItem>
                  <SelectItem value="analyzing">Analyzing</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="xray">X-Ray</SelectItem>
                  <SelectItem value="ct">CT Scan</SelectItem>
                  <SelectItem value="mri">MRI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Activity className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="text-muted-foreground">No scans found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((scan) => (
              <Card key={scan.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={scan.image_url}
                      alt="Scan thumbnail"
                      className="h-16 w-16 rounded-lg object-cover border border-border"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{scan.patients?.patient_name ?? "Unknown"}</p>
                        <Badge className={statusColor(scan.status)} variant="secondary">
                          {scan.status === "complete" ? "Complete" : scan.status === "analyzing" ? "Analyzing" : "Uploaded"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {typeLabel(scan.image_type)} · {format(new Date(scan.created_at), "MMM d, yyyy HH:mm")}
                        {scan.patients?.patient_id_number && ` · ID: ${scan.patients.patient_id_number}`}
                      </p>
                    </div>
                    {scan.status === "complete" && (
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/analysis/${scan.id}`}>
                          View Results <ExternalLink className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
