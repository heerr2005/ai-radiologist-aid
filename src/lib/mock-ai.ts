export interface Differential {
  diagnosis: string;
  confidence: number;
}

export interface MockAnalysisResult {
  primaryDiagnosis: string;
  confidenceScore: number;
  differentials: Differential[];
  clinicalSummary: string;
  heatmapRegions: { x: number; y: number; radius: number; intensity: number }[];
}

const xrayDiagnoses = [
  {
    primaryDiagnosis: "Pneumonia",
    differentials: ["Bronchitis", "Pulmonary Edema", "Lung Abscess"],
    summary: "Bilateral infiltrates observed in lower lung fields consistent with community-acquired pneumonia. No pleural effusion detected. Heart size appears within normal limits. Recommend clinical correlation and follow-up imaging in 2-3 weeks.",
  },
  {
    primaryDiagnosis: "Pneumothorax",
    differentials: ["Bullous Emphysema", "Pleural Effusion", "Rib Fracture"],
    summary: "Visible visceral pleural line identified in the right hemithorax with absence of lung markings peripherally. Estimated 25% pneumothorax. No mediastinal shift observed. Urgent clinical evaluation recommended.",
  },
  {
    primaryDiagnosis: "Cardiomegaly",
    differentials: ["Pericardial Effusion", "Congestive Heart Failure", "Mitral Valve Disease"],
    summary: "Cardiothoracic ratio exceeds 0.5 indicating cardiomegaly. Mild pulmonary vascular congestion noted. No focal consolidation. Echocardiography recommended for further evaluation.",
  },
];

const ctDiagnoses = [
  {
    primaryDiagnosis: "Intracranial Hemorrhage",
    differentials: ["Subdural Hematoma", "Epidural Hematoma", "Subarachnoid Hemorrhage"],
    summary: "Hyperdense focus identified in the right temporal lobe measuring approximately 3.2 x 2.1 cm, consistent with acute intraparenchymal hemorrhage. Mild surrounding edema with no midline shift. Urgent neurosurgical consultation advised.",
  },
  {
    primaryDiagnosis: "Pulmonary Embolism",
    differentials: ["Deep Vein Thrombosis", "Aortic Dissection", "Pleural Effusion"],
    summary: "Filling defect identified in the right main pulmonary artery extending into segmental branches. Right ventricular enlargement noted. No evidence of pulmonary infarction. Anticoagulation therapy and clinical correlation recommended.",
  },
];

const mriDiagnoses = [
  {
    primaryDiagnosis: "Lumbar Disc Herniation",
    differentials: ["Spinal Stenosis", "Degenerative Disc Disease", "Spondylolisthesis"],
    summary: "Posterior disc herniation at L4-L5 level with compression of the left L5 nerve root. Mild facet joint hypertrophy at L3-L4 and L4-L5. Central canal remains patent. Clinical correlation with symptoms recommended.",
  },
  {
    primaryDiagnosis: "ACL Tear",
    differentials: ["Meniscal Tear", "MCL Sprain", "Bone Bruise"],
    summary: "Complete disruption of the anterior cruciate ligament with associated bone marrow edema in the lateral femoral condyle and posterolateral tibial plateau. Medial meniscus appears intact. Joint effusion present.",
  },
];

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateHeatmapRegions(): MockAnalysisResult["heatmapRegions"] {
  const count = Math.floor(randomBetween(3, 7));
  return Array.from({ length: count }, () => ({
    x: randomBetween(0.15, 0.85),
    y: randomBetween(0.15, 0.85),
    radius: randomBetween(0.05, 0.2),
    intensity: randomBetween(0.3, 1),
  }));
}

export function generateMockAnalysis(imageType: "xray" | "ct" | "mri"): MockAnalysisResult {
  const pool = imageType === "xray" ? xrayDiagnoses : imageType === "ct" ? ctDiagnoses : mriDiagnoses;
  const selected = pool[Math.floor(Math.random() * pool.length)];
  const primaryConfidence = randomBetween(85, 98);

  const differentials: Differential[] = selected.differentials.map((d, i) => ({
    diagnosis: d,
    confidence: Math.max(5, primaryConfidence - randomBetween(15 + i * 12, 25 + i * 15)),
  }));

  return {
    primaryDiagnosis: selected.primaryDiagnosis,
    confidenceScore: Math.round(primaryConfidence * 10) / 10,
    differentials,
    clinicalSummary: selected.summary,
    heatmapRegions: generateHeatmapRegions(),
  };
}
