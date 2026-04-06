

## AI-Powered Radiology Image Analysis — Full MVP

### Overview
A full-stack medical imaging analysis app with mock AI diagnostics, image upload, heatmap overlays, PDF reports, patient dashboard, and scan history. Simple email/password auth (no roles).

### Pages & Features

**1. Auth Pages**
- Login & Signup with email/password via Lovable Cloud
- Clean, medical-themed design (blues/whites)

**2. Dashboard (Home)**
- Summary stats: total scans, pending analysis, completed reports
- Recent scans list with status indicators
- Quick upload CTA button

**3. Image Upload Page**
- Drag-and-drop upload zone for X-Ray, CT, MRI images (PNG, JPG, DICOM)
- File validation (type, size up to 50MB)
- Image type selector (X-Ray / CT Scan / MRI)
- Patient info form (name, ID, notes)
- Upload progress indicator

**4. Analysis Results Page**
- Original image display alongside annotated image with mock heatmap overlay
- Primary diagnosis with confidence score (e.g., "Pneumonia — 94.2%")
- Top-3 differential diagnoses with confidence bars (using Recharts)
- Side-by-side comparison view (original vs. heatmap)
- "Generate Report" button
- AI disclaimer banner

**5. Scan History Page**
- Searchable/filterable list of all past scans
- Status badges (Uploaded, Analyzing, Complete)
- Click-through to individual scan results
- Date range filtering

**6. PDF Report Generation**
- Auto-generated structured diagnostic report containing:
  - Patient info & scan metadata
  - AI findings: diagnosis, confidence, differentials
  - Annotated image with heatmap
  - Clinical summary paragraph
  - Mandatory disclaimer
- Downloadable as PDF

### Mock AI System
- Pre-built diagnostic results for different image types (X-Ray, CT, MRI)
- Simulated Grad-CAM heatmap overlays rendered on canvas
- Randomized but realistic confidence scores
- Short processing delay to simulate real analysis

### Database (Lovable Cloud)
- **patients** — patient info (name, ID, DOB)
- **scans** — uploaded images, type, status, timestamps
- **results** — diagnosis, confidence scores, differentials, heatmap data
- Auth handled by built-in Lovable Cloud auth

### Design
- Medical-professional theme: clean whites, blues, subtle grays
- Responsive for desktop and tablet
- Card-based layouts with clear data hierarchy
- Status indicators with color coding

