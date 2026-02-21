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

export const mockAppointments: Appointment[] = [
  { id: "apt1", doctorId: "d1", doctorName: "Dr. Michael Chen", patientId: "p1", patientName: "Alice Johnson", date: "2026-02-25", time: "09:00 AM", status: "confirmed", slotNumber: "SLT-4821", accessGranted: true },
  { id: "apt2", doctorId: "d2", doctorName: "Dr. Sarah Williams", patientId: "p1", patientName: "Alice Johnson", date: "2026-02-28", time: "02:30 PM", status: "pending", slotNumber: "SLT-4822", accessGranted: false },
  { id: "apt3", doctorId: "d3", doctorName: "Dr. James Rodriguez", patientId: "p1", patientName: "Alice Johnson", date: "2026-02-20", time: "11:00 AM", status: "completed", slotNumber: "SLT-4819", accessGranted: true },
  { id: "apt4", doctorId: "d1", doctorName: "Dr. Michael Chen", patientId: "p2", patientName: "Bob Smith", date: "2026-02-25", time: "10:30 AM", status: "confirmed", slotNumber: "SLT-4823", accessGranted: true },
  { id: "apt5", doctorId: "d1", doctorName: "Dr. Michael Chen", patientId: "p3", patientName: "Clara Davis", date: "2026-02-26", time: "01:00 PM", status: "confirmed", slotNumber: "SLT-4824", accessGranted: true },
]

export const mockAuditLogs: AuditLog[] = [
  { id: "log1", event: "access_granted", doctorName: "Dr. Michael Chen", doctorWallet: "0x1a2B...8F9a", timestamp: "2026-02-20 09:15:32", txHash: "0xabc123...def456", filesAccessed: 4 },
  { id: "log2", event: "access_revoked", doctorName: "Dr. James Rodriguez", doctorWallet: "0x5e6F...3c4D", timestamp: "2026-02-20 17:00:00", txHash: "0x789ghi...012jkl", filesAccessed: 2 },
  { id: "log3", event: "access_granted", doctorName: "Dr. Sarah Williams", doctorWallet: "0x9c0D...7a8B", timestamp: "2026-02-18 14:22:10", txHash: "0xmno345...pqr678", filesAccessed: 6 },
  { id: "log4", event: "access_granted", doctorName: "Dr. Michael Chen", doctorWallet: "0x1a2B...8F9a", timestamp: "2026-02-15 08:45:00", txHash: "0xstu901...vwx234", filesAccessed: 3 },
  { id: "log5", event: "access_revoked", doctorName: "Dr. Sarah Williams", doctorWallet: "0x9c0D...7a8B", timestamp: "2026-02-14 16:30:45", txHash: "0xyza567...bcd890", filesAccessed: 6 },
  { id: "log6", event: "access_granted", doctorName: "Dr. James Rodriguez", doctorWallet: "0x5e6F...3c4D", timestamp: "2026-02-12 10:00:00", txHash: "0xefg123...hij456", filesAccessed: 2 },
]

export const mockDoctors: Doctor[] = [
  { id: "d1", name: "Dr. Michael Chen", specialty: "Internal Medicine", avatar: "MC", rating: 4.9, available: true },
  { id: "d2", name: "Dr. Sarah Williams", specialty: "Cardiology", avatar: "SW", rating: 4.8, available: true },
  { id: "d3", name: "Dr. James Rodriguez", specialty: "Neurology", avatar: "JR", rating: 4.7, available: false },
  { id: "d4", name: "Dr. Emily Park", specialty: "Dermatology", avatar: "EP", rating: 4.9, available: true },
  { id: "d5", name: "Dr. David Kim", specialty: "Orthopedics", avatar: "DK", rating: 4.6, available: true },
]

export const mockPatientSummary = `**Patient Summary - Alice Johnson**

**Demographics:** Female, 34 years old, Blood Type: A+

**Active Conditions:**
- Mild seasonal allergies (managed with antihistamines)
- Occasional tension headaches

**Recent Lab Results (Feb 2026):**
- CBC: Within normal limits
- Metabolic Panel: All values within reference range
- Cholesterol: Total 185 mg/dL (borderline, trending down)
- Fasting Glucose: 92 mg/dL (normal)

**Imaging:**
- Chest X-Ray (Jan 2026): Clear, no abnormalities
- MRI Brain (Nov 2025): Normal findings, no lesions

**Medications:**
- Amoxicillin 500mg (short course, completed)
- Cetirizine 10mg daily (as needed)

**Vaccinations:** Up to date including COVID-19 booster (Oct 2025)

**Key Notes:** Patient is in good overall health. Continue monitoring cholesterol levels with follow-up in 6 months.`
