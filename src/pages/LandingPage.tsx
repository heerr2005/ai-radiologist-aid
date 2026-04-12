import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  Upload,
  BarChart3,
  FileText,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Stethoscope,
  Layers,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Smart Image Upload",
    desc: "Drag-and-drop X-Ray, CT, and MRI images with automatic format detection and validation.",
  },
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    desc: "Advanced diagnostic engine provides primary diagnosis, differential diagnoses, and confidence scoring.",
  },
  {
    icon: BarChart3,
    title: "Grad-CAM Heatmaps",
    desc: "Visual attention overlays highlight regions of interest directly on your medical images.",
  },
  {
    icon: FileText,
    title: "Professional Reports",
    desc: "Generate detailed PDF reports with patient data, findings, methodology, and clinical recommendations.",
  },
  {
    icon: Users,
    title: "Patient Management",
    desc: "Track patients, view scan histories, and manage records all in one centralized dashboard.",
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    desc: "End-to-end encryption, role-based access, and audit trails for data protection.",
  },
];

const steps = [
  { num: "01", title: "Upload Scan", desc: "Select a medical image — X-Ray, CT scan, or MRI — and provide patient details." },
  { num: "02", title: "AI Analyzes", desc: "Our engine processes the image, generating diagnoses, confidence scores, and attention maps." },
  { num: "03", title: "Review Results", desc: "Explore interactive heatmaps, differential diagnoses, and detailed clinical summaries." },
  { num: "04", title: "Export Report", desc: "Download a professional diagnostic PDF ready for clinical review and record-keeping." },
];

const stats = [
  { value: "3", label: "Modalities Supported" },
  { value: "95%+", label: "Confidence Accuracy" },
  { value: "<10s", label: "Analysis Time" },
  { value: "PDF", label: "Report Export" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="rounded-lg bg-gradient-to-br from-primary to-accent p-1.5">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold gradient-text">RadiologyAI</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-6">
              <Zap className="h-3.5 w-3.5" />
              AI-Powered Medical Imaging Platform
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Smarter Diagnostics with{" "}
              <span className="gradient-text">AI Radiology</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Upload medical scans, get instant AI-powered analysis with confidence scoring,
              Grad-CAM heatmaps, and downloadable diagnostic reports — all in one platform.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" asChild className="w-full sm:w-auto text-base px-8">
                <Link to="/signup">
                  Start Analyzing <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto text-base px-8">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-2xl sm:text-3xl font-bold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Everything You Need for <span className="gradient-text">Medical Imaging</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            A complete diagnostic workflow — from image upload to professional report generation.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <Card key={f.title} className="group hover:shadow-md transition-shadow border-border/60">
              <CardContent className="p-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="mt-3 text-muted-foreground">Four simple steps from upload to report.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="text-4xl font-bold text-primary/20 mb-3">{s.num}</div>
                <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Modalities */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Supported <span className="gradient-text">Modalities</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { icon: Stethoscope, name: "X-Ray", desc: "Chest radiographs for pneumonia, pneumothorax, and cardiomegaly detection." },
            { icon: Layers, name: "CT Scan", desc: "Cross-sectional imaging for hemorrhage, pulmonary embolism, and more." },
            { icon: Brain, name: "MRI", desc: "Soft-tissue imaging for disc herniation, ACL tears, and spinal conditions." },
          ].map((m) => (
            <Card key={m.name} className="text-center border-border/60">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <m.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{m.name}</h3>
                <p className="text-sm text-muted-foreground">{m.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary to-accent">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-4">
            Ready to Transform Your Diagnostic Workflow?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join RadiologyAI and experience the future of medical imaging analysis.
          </p>
          <Button size="lg" variant="secondary" asChild className="text-base px-8">
            <Link to="/signup">
              Create Free Account <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-primary to-accent p-1">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground text-sm">RadiologyAI</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} RadiologyAI. For demonstration purposes only — not for clinical use.
          </p>
        </div>
      </footer>
    </div>
  );
}
