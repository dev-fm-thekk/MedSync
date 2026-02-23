export interface MedicalDocument {
  id: string
  name: string
  type: "pdf" | "image" | "lab"
  date: string
  size: string
  category: string
}

export interface Appointment {
  id: string
  doctorId: string
  doctorName: string
  patientId: string
  patientName: string
  date: string
  time: string
  status: "confirmed" | "pending" | "completed"
  slotNumber: string
  accessGranted: boolean
}

export interface AuditLog {
  id: string
  event: "access_granted" | "access_revoked"
  doctorName: string
  doctorWallet: string
  timestamp: string
  txHash: string
  filesAccessed: number
}

export interface Doctor {
  id: string
  name: string
  specialty: string
  avatar: string
  rating: number
  available: boolean
}

export const mockDocuments: MedicalDocument[] = [
  { id: "doc1", name: "Blood Test Results - Feb 2026", type: "lab", date: "2026-02-15", size: "245 KB", category: "Lab Results" },
  { id: "doc2", name: "Chest X-Ray Report", type: "image", date: "2026-01-20", size: "1.2 MB", category: "Imaging" },
  { id: "doc3", name: "Annual Physical Exam", type: "pdf", date: "2025-12-10", size: "580 KB", category: "General" },
  { id: "doc4", name: "Prescription - Amoxicillin", type: "pdf", date: "2026-02-01", size: "120 KB", category: "Prescriptions" },
  { id: "doc5", name: "ECG Report", type: "lab", date: "2026-01-05", size: "340 KB", category: "Cardiology" },
  { id: "doc6", name: "MRI Brain Scan", type: "image", date: "2025-11-18", size: "4.5 MB", category: "Imaging" },
  { id: "doc7", name: "Vaccination Record", type: "pdf", date: "2025-10-22", size: "95 KB", category: "General" },
  { id: "doc8", name: "Allergy Panel Results", type: "lab", date: "2026-02-10", size: "310 KB", category: "Lab Results" },
]

/** Mock appointments for testing patient dashboard and doctor schedule */
export const mockAppointments: Appointment[] = [
  { id: "apt1", doctorId: "d1", doctorName: "Dr. Michael Chen", patientId: "p1", patientName: "Alice Johnson", date: "2026-02-25", time: "09:00 AM", status: "confirmed", slotNumber: "SLT-4821", accessGranted: true },
  { id: "apt2", doctorId: "d2", doctorName: "Dr. Sarah Williams", patientId: "p1", patientName: "Alice Johnson", date: "2026-02-28", time: "02:30 PM", status: "pending", slotNumber: "SLT-4822", accessGranted: false },
  { id: "apt3", doctorId: "d3", doctorName: "Dr. James Rodriguez", patientId: "p1", patientName: "Alice Johnson", date: "2026-02-20", time: "11:00 AM", status: "completed", slotNumber: "SLT-4819", accessGranted: true },
  { id: "apt4", doctorId: "d1", doctorName: "Dr. Michael Chen", patientId: "p2", patientName: "Bob Smith", date: "2026-02-25", time: "10:30 AM", status: "confirmed", slotNumber: "SLT-4823", accessGranted: true },
  { id: "apt5", doctorId: "d1", doctorName: "Dr. Michael Chen", patientId: "p3", patientName: "Clara Davis", date: "2026-02-26", time: "01:00 PM", status: "confirmed", slotNumber: "SLT-4824", accessGranted: true },
  { id: "apt6", doctorId: "d4", doctorName: "Dr. Emily Park", patientId: "p1", patientName: "Alice Johnson", date: "2026-03-02", time: "03:00 PM", status: "pending", slotNumber: "SLT-4825", accessGranted: false },
  { id: "apt7", doctorId: "d1", doctorName: "Dr. Michael Chen", patientId: "p1", patientName: "Alice Johnson", date: "2026-02-10", time: "09:30 AM", status: "completed", slotNumber: "SLT-4815", accessGranted: true },
]

/** Mock audit trail for access management testing */
export const mockAuditLogs: AuditLog[] = [
  { id: "log1", event: "access_granted", doctorName: "Dr. Michael Chen", doctorWallet: "0x1a2B...8F9a", timestamp: "2026-02-20 09:15:32", txHash: "0xabc123...def456", filesAccessed: 4 },
  { id: "log2", event: "access_revoked", doctorName: "Dr. James Rodriguez", doctorWallet: "0x5e6F...3c4D", timestamp: "2026-02-20 17:00:00", txHash: "0x789ghi...012jkl", filesAccessed: 2 },
  { id: "log3", event: "access_granted", doctorName: "Dr. Sarah Williams", doctorWallet: "0x9c0D...7a8B", timestamp: "2026-02-18 14:22:10", txHash: "0xmno345...pqr678", filesAccessed: 6 },
  { id: "log4", event: "access_granted", doctorName: "Dr. Michael Chen", doctorWallet: "0x1a2B...8F9a", timestamp: "2026-02-15 08:45:00", txHash: "0xstu901...vwx234", filesAccessed: 3 },
  { id: "log5", event: "access_revoked", doctorName: "Dr. Sarah Williams", doctorWallet: "0x9c0D...7a8B", timestamp: "2026-02-14 16:30:45", txHash: "0xyza567...bcd890", filesAccessed: 6 },
  { id: "log6", event: "access_granted", doctorName: "Dr. James Rodriguez", doctorWallet: "0x5e6F...3c4D", timestamp: "2026-02-12 10:00:00", txHash: "0xefg123...hij456", filesAccessed: 2 },
  { id: "log7", event: "access_granted", doctorName: "Dr. Emily Park", doctorWallet: "0x2b3C...9d0E", timestamp: "2026-02-22 11:20:00", txHash: "0xklm789...nop012", filesAccessed: 5 },
]

/** Mock doctors for booking and schedule testing */
export const mockDoctors: Doctor[] = [
  { id: "d1", name: "Dr. Michael Chen", specialty: "Internal Medicine", avatar: "MC", rating: 4.9, available: true },
  { id: "d2", name: "Dr. Sarah Williams", specialty: "Cardiology", avatar: "SW", rating: 4.8, available: true },
  { id: "d3", name: "Dr. James Rodriguez", specialty: "Neurology", avatar: "JR", rating: 4.7, available: false },
  { id: "d4", name: "Dr. Emily Park", specialty: "Dermatology", avatar: "EP", rating: 4.9, available: true },
  { id: "d5", name: "Dr. David Kim", specialty: "Orthopedics", avatar: "DK", rating: 4.6, available: true },
  { id: "d6", name: "Dr. Priya Sharma", specialty: "General Practice", avatar: "PS", rating: 4.8, available: true },
]

/** Mock patient summaries for testing (one per patient); aligns with RAG mock responses and mockDocuments */

/** Patient 1 – Alice Johnson */
export const mockPatientSummaryP1 = `**Patient Summary - Alice Johnson**

**Demographics:** Female, 34 years old, Blood Type: A+

**Vitals (last recorded Jan 2026):**
- BP: 118/76 mmHg (normal)
- HR: 72 bpm, Temp: 98.4°F, SpO2: 99%
- BMI: 22.4 (normal range)

**Active Conditions:**
- Mild seasonal allergies (managed with antihistamines)
- Occasional tension headaches

**Recent Lab Results (Feb 2026):**
- CBC: Within normal limits
- Metabolic Panel: All values within reference range
- Cholesterol: Total 185 mg/dL (borderline, trending down); LDL 110, HDL 52
- Fasting Glucose: 92 mg/dL (normal)
- Allergy panel (Feb 2026): Mild reactivity to pollen; no drug allergies

**Imaging:**
- Chest X-Ray (Jan 2026): Clear, no abnormalities
- MRI Brain (Nov 2025): Normal findings, no lesions
- ECG (Jan 2026): Sinus rhythm, no acute changes

**Medications:**
- Amoxicillin 500mg (short course, completed Feb 2026)
- Cetirizine 10mg daily (as needed for seasonal allergies)

**Vaccinations:** Up to date including COVID-19 booster (Oct 2025); vaccination record on file.

**Discharge / ER:** One ER visit Nov 2025; discharge summary on file—resolved without admission.

**Key Notes:** Patient is in good overall health. Continue monitoring cholesterol levels with follow-up in 6 months.`

/** Patient 2 – Bob Smith */
export const mockPatientSummaryP2 = `**Patient Summary - Bob Smith**

**Demographics:** Male, 52 years old, Blood Type: O+

**Vitals (last recorded Feb 2026):**
- BP: 132/84 mmHg (elevated)
- HR: 78 bpm, Temp: 98.2°F, SpO2: 98%
- BMI: 28.1 (overweight)

**Active Conditions:**
- Hypertension (newly diagnosed, lifestyle + monitoring)
- Type 2 diabetes (diet-controlled, HbA1c 6.2% Jan 2026)
- GERD (on PPI as needed)

**Recent Lab Results (Feb 2026):**
- Metabolic Panel: Fasting glucose 108 mg/dL; creatinine 1.1 mg/dL
- Lipid panel: Total cholesterol 212 mg/dL; LDL 135, HDL 42; triglycerides 165
- HbA1c: 6.2% (Jan 2026)

**Imaging:**
- Abdominal ultrasound (Jan 2026): Mild fatty liver; no focal lesions
- Chest X-Ray (Dec 2025): Unremarkable

**Medications:**
- Metformin 500mg BID
- Omeprazole 20mg as needed for GERD
- No anticoagulants; aspirin not currently recommended per risk assessment

**Vaccinations:** Up to date; flu shot Oct 2025, COVID-19 booster on file.

**Key Notes:** Focus on BP and glucose control; weight loss and diet counseling in progress. Repeat HbA1c and lipids in 3 months.`

/** Patient 3 – Clara Davis */
export const mockPatientSummaryP3 = `**Patient Summary - Clara Davis**

**Demographics:** Female, 28 years old, Blood Type: B+

**Vitals (last recorded Feb 2026):**
- BP: 106/68 mmHg (normal)
- HR: 64 bpm, Temp: 98.6°F, SpO2: 100%
- BMI: 21.0 (normal)

**Active Conditions:**
- None chronic; previous ankle fracture (2024), fully healed
- Annual wellness visits only

**Recent Lab Results (Jan 2026):**
- CBC, metabolic panel, lipids: All within normal limits
- TSH: 2.1 mIU/L (normal)
- Vitamin D: 38 ng/mL (sufficient)

**Imaging:**
- None in last 12 months; prior ankle X-rays (2024) on file

**Medications:**
- Multivitamin daily
- No prescription medications

**Vaccinations:** Up to date; last flu shot Nov 2025, COVID-19 booster on file.

**Key Notes:** Low-risk, healthy adult. Next routine physical recommended in 1 year.`

/** Map patientId → summary for use in views */
export const mockPatientSummaries: Record<string, string> = {
  p1: mockPatientSummaryP1,
  p2: mockPatientSummaryP2,
  p3: mockPatientSummaryP3,
}

/** Default summary (p1) for backward compatibility */
export const mockPatientSummary = mockPatientSummaryP1
