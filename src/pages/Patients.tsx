import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Users,
  UserPlus,
  Calendar,
  FileText,
  Activity,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Patient {
  id: string;
  patient_name: string;
  patient_id_number: string | null;
  date_of_birth: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  scan_count?: number;
}

export default function Patients() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formIdNumber, setFormIdNumber] = useState("");
  const [formDob, setFormDob] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const fetchPatients = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("patients")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (data) {
      // Get scan counts for each patient
      const patientsWithCounts = await Promise.all(
        data.map(async (p) => {
          const { count } = await supabase
            .from("scans")
            .select("*", { count: "exact", head: true })
            .eq("patient_id", p.id);
          return { ...p, scan_count: count ?? 0 };
        })
      );
      setPatients(patientsWithCounts);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPatients();
  }, [user]);

  const openCreate = () => {
    setEditing(null);
    setFormName("");
    setFormIdNumber("");
    setFormDob("");
    setFormNotes("");
    setDialogOpen(true);
  };

  const openEdit = (p: Patient) => {
    setEditing(p);
    setFormName(p.patient_name);
    setFormIdNumber(p.patient_id_number ?? "");
    setFormDob(p.date_of_birth ?? "");
    setFormNotes(p.notes ?? "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user || !formName.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("patients")
          .update({
            patient_name: formName.trim(),
            patient_id_number: formIdNumber || null,
            date_of_birth: formDob || null,
            notes: formNotes || null,
          })
          .eq("id", editing.id);
        if (error) throw error;
        toast({ title: "Patient updated" });
      } else {
        const { error } = await supabase
          .from("patients")
          .insert({
            user_id: user.id,
            patient_name: formName.trim(),
            patient_id_number: formIdNumber || null,
            date_of_birth: formDob || null,
            notes: formNotes || null,
          });
        if (error) throw error;
        toast({ title: "Patient added" });
      }
      setDialogOpen(false);
      fetchPatients();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { error } = await supabase
        .from("patients")
        .delete()
        .eq("id", deleteTarget.id);
      if (error) throw error;
      toast({ title: "Patient deleted" });
      setDeleteTarget(null);
      fetchPatients();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const filtered = patients.filter(
    (p) =>
      !search ||
      p.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      p.patient_id_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Patients</h1>
            <p className="text-muted-foreground">Manage your patient records</p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Patient
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="group hover:shadow-md transition-all duration-300">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-primary/10 p-3 group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold">{patients.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="group hover:shadow-md transition-all duration-300">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-accent/10 p-3 group-hover:scale-110 transition-transform">
                <Activity className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Scans</p>
                <p className="text-2xl font-bold">{patients.reduce((a, p) => a + (p.scan_count ?? 0), 0)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="group hover:shadow-md transition-all duration-300">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-success/10 p-3 group-hover:scale-110 transition-transform">
                <Plus className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Added This Month</p>
                <p className="text-2xl font-bold">
                  {patients.filter((p) => new Date(p.created_at).getMonth() === new Date().getMonth()).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients by name or ID..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Patient list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                {search ? "No patients match your search" : "No patients yet"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {search ? "Try different search terms" : "Add your first patient to get started"}
              </p>
              {!search && (
                <Button onClick={openCreate} variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add First Patient
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((patient, i) => (
              <Card
                key={patient.id}
                className="group hover:shadow-lg hover:border-primary/20 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold text-sm">
                        {patient.patient_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{patient.patient_name}</p>
                        {patient.patient_id_number && (
                          <p className="text-xs text-muted-foreground">ID: {patient.patient_id_number}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(patient)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(patient)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                    {patient.date_of_birth && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(patient.date_of_birth), "MMM d, yyyy")}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {patient.scan_count ?? 0} scan{(patient.scan_count ?? 0) !== 1 && "s"}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {format(new Date(patient.updated_at), "MMM d, yyyy")}
                    </span>
                  </div>

                  {patient.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/50 rounded px-2 py-1.5">
                      {patient.notes}
                    </p>
                  )}

                  {(patient.scan_count ?? 0) > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <Button variant="ghost" size="sm" className="h-7 text-xs px-2" asChild>
                        <Link to={`/history?patient=${patient.patient_name}`}>
                          View Scans →
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Patient" : "Add New Patient"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update patient information" : "Enter the patient's details"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="d-name">Patient Name *</Label>
              <Input
                id="d-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="d-id">Patient ID</Label>
                <Input
                  id="d-id"
                  value={formIdNumber}
                  onChange={(e) => setFormIdNumber(e.target.value)}
                  placeholder="PT-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="d-dob">Date of Birth</Label>
                <Input
                  id="d-dob"
                  type="date"
                  value={formDob}
                  onChange={(e) => setFormDob(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-notes">Notes</Label>
              <Textarea
                id="d-notes"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Medical history, allergies, etc."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formName.trim() || saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? "Update" : "Add Patient"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Patient</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.patient_name}</strong>? This will also remove all associated scans and results. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
