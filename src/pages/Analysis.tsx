import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Download, ArrowLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { Differential } from "@/lib/mock-ai";

interface ScanData {
  id: string;
  image_url: string;
  image_type: string;
  notes: string | null;
  created_at: string;
  patients: { patient_name: string; patient_id_number: string | null } | null;
}

interface ResultData {
  primary_diagnosis: string;
  confidence_score: number;
  differentials: Differential[];
  clinical_summary: string | null;
  heatmap_data: { x: number; y: number; radius: number; intensity: number }[] | null;
}

export default function Analysis() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [scan, setScan] = useState<ScanData | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!user || !id) return;
    const fetchData = async () => {
      const { data: scanData } = await supabase
        .from("scans")
        .select("id, image_url, image_type, notes, created_at, patients(patient_name, patient_id_number)")
        .eq("id", id)
        .single();

      const { data: resultData } = await supabase
        .from("scan_results")
        .select("primary_diagnosis, confidence_score, differentials, clinical_summary, heatmap_data")
        .eq("scan_id", id)
        .single();

      if (scanData) {
        const sd = scanData as unknown as ScanData;
        // Generate a signed URL for the scan image
        const { data: signedData } = await supabase.storage
          .from("scan-images")
          .createSignedUrl(sd.image_url, 3600);
        if (signedData?.signedUrl) {
          sd.image_url = signedData.signedUrl;
        }
        setScan(sd);
      }
      if (resultData) setResult(resultData as unknown as ResultData);
      setLoading(false);
    };
    fetchData();
  }, [user, id]);

  useEffect(() => {
    if (!result?.heatmap_data || !canvasRef.current || !imgRef.current) return;
    const img = imgRef.current;
    const canvas = canvasRef.current;

    const draw = () => {
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (showHeatmap && result.heatmap_data) {
        (result.heatmap_data as { x: number; y: number; radius: number; intensity: number }[]).forEach((region) => {
          const x = region.x * canvas.width;
          const y = region.y * canvas.height;
          const r = region.radius * Math.min(canvas.width, canvas.height);
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
          gradient.addColorStop(0, `rgba(255, 0, 0, ${region.intensity * 0.6})`);
          gradient.addColorStop(0.5, `rgba(255, 165, 0, ${region.intensity * 0.3})`);
          gradient.addColorStop(1, "rgba(255, 255, 0, 0)");
          ctx.fillStyle = gradient;
          ctx.fillRect(x - r, y - r, r * 2, r * 2);
        });
      }
    };

    if (img.complete) draw();
    else img.onload = draw;
  }, [result, showHeatmap]);

  const handleDownloadPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const m = 15;
    const pw = 210 - m * 2; // page width minus margins
    let y = m;

    const addPage = () => { doc.addPage(); y = m; };
    const checkPage = (need: number) => { if (y + need > 275) addPage(); };

    // ── Header banner ──
    doc.setFillColor(30, 64, 120);
    doc.rect(0, 0, 210, 32, "F");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("RadiologyAI", m, 14);
    doc.setFontSize(10);
    doc.text("AI-Powered Diagnostic Report", m, 22);
    doc.setFontSize(8);
    doc.text(`Report ID: ${id?.slice(0, 8).toUpperCase()}`, 210 - m, 14, { align: "right" });
    doc.text(`Generated: ${format(new Date(), "MMMM d, yyyy · HH:mm")}`, 210 - m, 22, { align: "right" });
    y = 40;

    // ── Patient Information ──
    doc.setFillColor(240, 244, 248);
    doc.rect(m, y, pw, 30, "F");
    doc.setDrawColor(30, 64, 120);
    doc.rect(m, y, pw, 30, "S");
    doc.setFontSize(11);
    doc.setTextColor(30, 64, 120);
    doc.setFont("helvetica", "bold");
    doc.text("PATIENT INFORMATION", m + 5, y + 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);

    const pName = scan?.patients?.patient_name ?? "N/A";
    const pId = scan?.patients?.patient_id_number ?? "N/A";
    const scanType = scan?.image_type === "xray" ? "X-Ray" : scan?.image_type === "ct" ? "CT Scan" : "MRI";
    const scanDate = scan ? format(new Date(scan.created_at), "MMMM d, yyyy · HH:mm") : "N/A";

    doc.text(`Patient Name:`, m + 5, y + 15);
    doc.setFont("helvetica", "bold");
    doc.text(pName, m + 40, y + 15);
    doc.setFont("helvetica", "normal");
    doc.text(`Patient ID:`, m + 100, y + 15);
    doc.setFont("helvetica", "bold");
    doc.text(pId, m + 125, y + 15);
    doc.setFont("helvetica", "normal");
    doc.text(`Modality:`, m + 5, y + 22);
    doc.setFont("helvetica", "bold");
    doc.text(scanType, m + 30, y + 22);
    doc.setFont("helvetica", "normal");
    doc.text(`Scan Date:`, m + 100, y + 22);
    doc.setFont("helvetica", "bold");
    doc.text(scanDate, m + 125, y + 22);
    doc.setFont("helvetica", "normal");
    y += 38;

    if (result) {
      // ── Primary Diagnosis ──
      doc.setFillColor(30, 64, 120);
      doc.rect(m, y, pw, 8, "F");
      doc.setFontSize(10);
      doc.setTextColor(255);
      doc.setFont("helvetica", "bold");
      doc.text("PRIMARY DIAGNOSIS", m + 3, y + 5.5);
      y += 12;

      doc.setTextColor(30, 64, 120);
      doc.setFontSize(16);
      doc.text(result.primary_diagnosis, m, y);
      doc.setFontSize(12);
      doc.setTextColor(34, 139, 34);
      doc.text(`${result.confidence_score}% Confidence`, 210 - m, y, { align: "right" });
      y += 10;

      // Confidence bar
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(230, 230, 230);
      doc.roundedRect(m, y, pw, 5, 2, 2, "FD");
      doc.setFillColor(30, 64, 120);
      doc.roundedRect(m, y, pw * (result.confidence_score / 100), 5, 2, 2, "F");
      y += 12;

      // ── Differential Diagnoses ──
      checkPage(40);
      doc.setFillColor(30, 64, 120);
      doc.rect(m, y, pw, 8, "F");
      doc.setFontSize(10);
      doc.setTextColor(255);
      doc.text("DIFFERENTIAL DIAGNOSES", m + 3, y + 5.5);
      y += 12;

      doc.setFontSize(9);
      doc.setTextColor(40, 40, 40);

      // Table header
      doc.setFillColor(240, 244, 248);
      doc.rect(m, y, pw, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.text("Rank", m + 3, y + 5);
      doc.text("Diagnosis", m + 20, y + 5);
      doc.text("Confidence", m + 130, y + 5);
      y += 7;

      doc.setFont("helvetica", "normal");
      (result.differentials as Differential[]).forEach((d, i) => {
        const rowY = y;
        if (i % 2 === 0) {
          doc.setFillColor(250, 250, 252);
          doc.rect(m, rowY, pw, 7, "F");
        }
        doc.text(`#${i + 2}`, m + 3, rowY + 5);
        doc.text(d.diagnosis, m + 20, rowY + 5);

        // Mini bar
        const barW = 40;
        doc.setFillColor(230, 230, 230);
        doc.rect(m + 130, rowY + 1.5, barW, 3.5, "F");
        doc.setFillColor(60, 130, 200);
        doc.rect(m + 130, rowY + 1.5, barW * (d.confidence / 100), 3.5, "F");
        doc.text(`${d.confidence.toFixed(1)}%`, m + 173, rowY + 5);
        y += 7;
      });
      y += 8;

      // ── Clinical Summary ──
      if (result.clinical_summary) {
        checkPage(35);
        doc.setFillColor(30, 64, 120);
        doc.rect(m, y, pw, 8, "F");
        doc.setFontSize(10);
        doc.setTextColor(255);
        doc.setFont("helvetica", "bold");
        doc.text("CLINICAL FINDINGS & SUMMARY", m + 3, y + 5.5);
        y += 12;

        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(result.clinical_summary, pw);
        doc.text(lines, m, y);
        y += lines.length * 4.5 + 6;
      }

      // ── Methodology ──
      checkPage(35);
      doc.setFillColor(30, 64, 120);
      doc.rect(m, y, pw, 8, "F");
      doc.setFontSize(10);
      doc.setTextColor(255);
      doc.setFont("helvetica", "bold");
      doc.text("ANALYSIS METHODOLOGY", m + 3, y + 5.5);
      y += 12;

      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "normal");
      const methodText = [
        "This analysis was performed using a simulated diagnostic AI engine (RadiologyAI Demo).",
        "The engine utilizes convolutional neural network architectures with Grad-CAM attention mapping",
        "to identify regions of diagnostic significance. Confidence scores reflect the model's prediction",
        "certainty based on pattern matching against a training dataset of labeled medical images.",
        "",
        "Heatmap overlays indicate regions of highest activation in the neural network's final",
        "convolutional layers, highlighting areas that most influenced the diagnostic prediction.",
      ];
      methodText.forEach((line) => { doc.text(line, m, y); y += 4; });
      y += 6;

      // ── Recommendations ──
      checkPage(30);
      doc.setFillColor(30, 64, 120);
      doc.rect(m, y, pw, 8, "F");
      doc.setFontSize(10);
      doc.setTextColor(255);
      doc.setFont("helvetica", "bold");
      doc.text("RECOMMENDATIONS", m + 3, y + 5.5);
      y += 12;

      doc.setFontSize(9);
      doc.setTextColor(40, 40, 40);
      doc.setFont("helvetica", "normal");
      const recs = [
        "1. Correlate findings with clinical history and physical examination.",
        "2. Consider follow-up imaging in 2-4 weeks to assess progression or resolution.",
        "3. Consult with a board-certified radiologist for definitive interpretation.",
        "4. If clinically indicated, additional imaging modalities may provide further information.",
      ];
      recs.forEach((r) => { doc.text(r, m, y); y += 5.5; });
      y += 8;
    }

    // ── Disclaimer ──
    checkPage(25);
    doc.setDrawColor(200, 0, 0);
    doc.setFillColor(255, 245, 245);
    doc.roundedRect(m, y, pw, 22, 2, 2, "FD");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 0, 0);
    doc.text("IMPORTANT DISCLAIMER", m + 3, y + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(120, 0, 0);
    doc.text("This report is generated by a demonstration AI system and is intended for educational purposes only.", m + 3, y + 10);
    doc.text("It should NOT be used as a substitute for professional medical diagnosis. Always consult a qualified", m + 3, y + 14.5);
    doc.text("radiologist or healthcare professional for clinical decisions.", m + 3, y + 19);

    // ── Footer ──
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFillColor(240, 244, 248);
      doc.rect(0, 285, 210, 12, "F");
      doc.setFontSize(7);
      doc.setTextColor(130, 130, 130);
      doc.text(`RadiologyAI Diagnostic Report · Page ${i} of ${pages}`, 105, 291, { align: "center" });
      doc.text("CONFIDENTIAL — FOR AUTHORIZED PERSONNEL ONLY", 105, 295, { align: "center" });
    }

    doc.save(`RadiologyAI_Report_${id?.slice(0, 8)}.pdf`);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!scan || !result) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <p className="text-muted-foreground">Scan not found.</p>
          <Button asChild className="mt-4" variant="outline">
            <Link to="/history">Back to History</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const chartData = [
    { name: result.primary_diagnosis, confidence: result.confidence_score, fill: "hsl(210, 75%, 42%)" },
    ...(result.differentials as Differential[]).map((d, i) => ({
      name: d.diagnosis,
      confidence: Math.round(d.confidence * 10) / 10,
      fill: i === 0 ? "hsl(195, 60%, 45%)" : i === 1 ? "hsl(210, 30%, 65%)" : "hsl(210, 20%, 78%)",
    })),
  ];

  const typeLabel = scan.image_type === "xray" ? "X-Ray" : scan.image_type === "ct" ? "CT Scan" : "MRI";

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button variant="ghost" size="icon" asChild className="shrink-0">
              <Link to="/history"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold truncate">Analysis Results</h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {scan.patients?.patient_name} · {typeLabel} · {format(new Date(scan.created_at), "MMM d, yyyy")}
              </p>
            </div>
          </div>
          <Button onClick={handleDownloadPDF} className="w-full sm:w-auto shrink-0">
            <Download className="h-4 w-4 mr-2" /> Download Report
          </Button>
        </div>

        {/* AI Disclaimer */}
        <div className="flex items-start gap-2.5 sm:gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 sm:p-4">
          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive mt-0.5 shrink-0" />
          <div className="text-xs sm:text-sm">
            <p className="font-medium text-destructive">AI-Generated — Not for Clinical Use</p>
            <p className="text-muted-foreground mt-0.5">Mock AI system for demo. Always consult a qualified radiologist.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Image with heatmap */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-6 sm:pb-3">
              <CardTitle className="text-base sm:text-lg">Scan Image</CardTitle>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowHeatmap(!showHeatmap)}>
                {showHeatmap ? "Hide" : "Show"} Heatmap
              </Button>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="relative inline-block w-full">
                <img
                  ref={imgRef}
                  src={scan.image_url}
                  alt="Medical scan"
                  className="rounded-lg w-full object-contain max-h-72 sm:max-h-96"
                  crossOrigin="anonymous"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full rounded-lg pointer-events-none"
                  style={{ mixBlendMode: "screen" }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Primary diagnosis */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3 p-4 sm:p-6 sm:pb-3">
                <CardTitle className="text-base sm:text-lg">Primary Diagnosis</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="flex items-center justify-between mb-4 gap-2">
                  <span className="text-base sm:text-xl font-bold truncate">{result.primary_diagnosis}</span>
                  <Badge className="text-sm sm:text-lg px-2 sm:px-3 py-1 bg-primary text-primary-foreground shrink-0">
                    {result.confidence_score}%
                  </Badge>
                </div>
                <div className="h-40 sm:h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 10 }}>
                      <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(value: number) => `${value}%`} />
                      <Bar dataKey="confidence" radius={[0, 4, 4, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 p-4 sm:p-6 sm:pb-3">
                <CardTitle className="text-base sm:text-lg">Clinical Summary</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{result.clinical_summary}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
