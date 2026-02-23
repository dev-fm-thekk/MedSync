import { createClient } from "./client"

export interface AppointmentRow {
  id: string
  doctor_id: string
  patient_id: string
  doctor_name: string | null
  patient_name: string | null
  slot_number: string
  appointment_date: string | null
  appointment_time: string | null
  status: string
  access_granted: boolean
  created_at: string | null
  updated_at: string | null
}

/** UI shape: camelCase, date/time formatted, patientWallet = patient_id for minting */
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
  patientWallet?: string
}

function rowToAppointment(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name ?? "Unknown",
    patientId: row.patient_id,
    patientName: row.patient_name ?? "Unknown",
    date: row.appointment_date ?? "",
    time: row.appointment_time ?? "",
    status: row.status as "confirmed" | "pending" | "completed",
    slotNumber: row.slot_number,
    accessGranted: row.access_granted,
    patientWallet: row.patient_id,
  }
}

export async function getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
  const supabase = createClient()
  const id = doctorId.toLowerCase()
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("doctor_id", id)
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true })

  if (error) {
    console.error("[Supabase] getAppointmentsByDoctor:", error.message)
    return []
  }
  return (data as AppointmentRow[]).map(rowToAppointment)
}

export async function getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
  const supabase = createClient()
  const id = patientId.toLowerCase()
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("patient_id", id)
    .order("appointment_date", { ascending: false })
    .order("appointment_time", { ascending: false })

  if (error) {
    console.error("[Supabase] getAppointmentsByPatient:", error.message)
    return []
  }
  return (data as AppointmentRow[]).map(rowToAppointment)
}

export interface CreateAppointmentInput {
  doctor_id: string
  patient_id: string
  doctor_name: string | null
  patient_name: string | null
  slot_number: string
  appointment_date?: string
  appointment_time?: string
  status?: string
}

export async function createAppointment(
  input: CreateAppointmentInput
): Promise<{ data: Appointment | null; error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      doctor_id: input.doctor_id.toLowerCase(),
      patient_id: input.patient_id.toLowerCase(),
      doctor_name: input.doctor_name ?? null,
      patient_name: input.patient_name ?? null,
      slot_number: input.slot_number,
      appointment_date: input.appointment_date ?? null,
      appointment_time: input.appointment_time ?? null,
      status: input.status ?? "pending",
      access_granted: false,
    })
    .select()
    .single()

  if (error) {
    console.error("[Supabase] createAppointment:", error.message)
    return { data: null, error: error.message }
  }
  return { data: rowToAppointment(data as AppointmentRow), error: null }
}

export async function updateAppointmentAccessGranted(
  appointmentId: string,
  accessGranted: boolean
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from("appointments")
    .update({ access_granted: accessGranted, updated_at: new Date().toISOString() })
    .eq("id", appointmentId)

  if (error) {
    console.error("[Supabase] updateAppointmentAccessGranted:", error.message)
    return { error: error.message }
  }
  return { error: null }
}
