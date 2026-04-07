import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { generateMockAnalysis } from "@/lib/mock-ai";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Loader2, ImageIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

type ImageType = "xray" | "ct" | "mri";

export default function UploadScan() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageType, setImageType] = useState<ImageType>("xray");
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const acceptedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  const maxSize = 50 * 1024 * 1024;

  const handleFile = (f: File) => {
    if (!acceptedTypes.includes(f.type)) {
      toast({ title: "Invalid file type", description: "Please upload PNG or JPG images.", variant: "destructive" });
      return;
    }
    if (f.size > maxSize) {
      toast({ title: "File too large", description: "Max file size is 50MB.", variant: "destructive" });
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user || !patientName.trim()) return;

    setUploading(true);
    setProgress(10);

    try {
      const { data: patient, error: patientErr } = await supabase
        .from("patients")
        .insert({ user_id: user.id, patient_name: patientName.trim(), patient_id_number: patientId || null, notes: null })
        .select("id")
        .single();

      if (patientErr) throw patientErr;
      setProgress(30);

      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadErr } = await supabase.storage.from("scan-images").upload(filePath, file);
      if (uploadErr) throw uploadErr;
      setProgress(50);

      const { data: urlData } = supabase.storage.from("scan-images").getPublicUrl(filePath);

      const { data: scan, error: scanErr } = await supabase
        .from("scans")
        .insert({
          user_id: user.id,
          patient_id: patient.id,
          image_url: urlData.publicUrl,
          image_type: imageType,
          status: "analyzing" as const,
          notes: notes || null,
        })
        .select("id")
        .single();

      if (scanErr) throw scanErr;
      setProgress(70);

      await new Promise((r) => setTimeout(r, 1500));
      const result = generateMockAnalysis(imageType);
      setProgress(90);

      const { error: resultErr } = await supabase.from("scan_results").insert([{
        scan_id: scan.id,
        user_id: user.id,
        primary_diagnosis: result.primaryDiagnosis,
        confidence_score: result.confidenceScore,
        differentials: result.differentials as any,
        clinical_summary: result.clinicalSummary,
        heatmap_data: result.heatmapRegions as any,
      }]);

      if (resultErr) throw resultErr;

      await supabase.from("scans").update({ status: "complete" as const }).eq("id", scan.id);
      setProgress(100);

      toast({ title: "Analysis complete!", description: "View your results now." });
      navigate(`/analysis/${scan.id}`);
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Upload Medical Scan</h1>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Drop zone */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Scan Image</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Upload X-Ray, CT, or MRI images (PNG, JPG up to 50MB)</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {!preview ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  className={`border-2 border-dashed rounded-lg p-8 sm:p-12 text-center cursor-pointer transition-colors ${
                    dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <Upload className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium">Drag & drop your scan here</p>
                  <p className="text-xs text-muted-foreground mt-1">or tap to browse files</p>
                  <input
                    id="file-input"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="relative">
                  <img src={preview} alt="Scan preview" className="rounded-lg max-h-48 sm:max-h-64 mx-auto object-contain" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7"
                    type="button"
                    onClick={() => { setFile(null); setPreview(null); }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">{file?.name} ({(file!.size / 1024 / 1024).toFixed(1)} MB)</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Image type & patient info */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Scan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6">
              <div className="space-y-2">
                <Label>Image Type</Label>
                <Select value={imageType} onValueChange={(v) => setImageType(v as ImageType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xray">X-Ray</SelectItem>
                    <SelectItem value="ct">CT Scan</SelectItem>
                    <SelectItem value="mri">MRI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pname">Patient Name *</Label>
                  <Input id="pname" required value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pid">Patient ID</Label>
                  <Input id="pid" value={patientId} onChange={(e) => setPatientId(e.target.value)} placeholder="PT-001" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Clinical notes or observations..." rows={3} />
              </div>
            </CardContent>
          </Card>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                {progress < 50 ? "Uploading image..." : progress < 80 ? "Running AI analysis..." : "Finalizing results..."}
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={!file || !patientName.trim() || uploading} size="lg">
            {uploading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
            ) : (
              <><ImageIcon className="h-4 w-4 mr-2" /> Upload & Analyze</>
            )}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
