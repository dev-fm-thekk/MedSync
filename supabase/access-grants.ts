import { createClient } from "./client"

export interface AccessGrantRow {
  id: string
  token_id: string
  patient_id: string
  doctor_id: string
  doctor_name: string | null
  expiry_at: string | null
  tx_hash: string | null
  created_at: string | null
}

export interface AccessGrant {
  id: string
  tokenId: string
  patientId: string
  doctorId: string
  doctorName: string
  expiryAt: string | null
  txHash: string | null
  createdAt: string
}

function rowToAccessGrant(row: AccessGrantRow): AccessGrant {
  return {
    id: row.id,
    tokenId: row.token_id,
    patientId: row.patient_id,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name ?? "Unknown",
    expiryAt: row.expiry_at,
    txHash: row.tx_hash,
    createdAt: row.created_at ?? "",
  }
}

export async function getAccessGrantsByPatient(patientId: string): Promise<AccessGrant[]> {
  const supabase = createClient()
  const id = patientId.toLowerCase()
  const { data, error } = await supabase
    .from("access_grants")
    .select("*")
    .eq("patient_id", id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[Supabase] getAccessGrantsByPatient:", error.message)
    return []
  }
  return (data as AccessGrantRow[]).map(rowToAccessGrant)
}

export interface InsertAccessGrantInput {
  token_id: string
  patient_id: string
  doctor_id: string
  doctor_name?: string | null
  expiry_at?: string | null
  tx_hash?: string | null
}

export async function insertAccessGrant(
  input: InsertAccessGrantInput
): Promise<{ data: AccessGrant | null; error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("access_grants")
    .insert({
      token_id: input.token_id,
      patient_id: input.patient_id.toLowerCase(),
      doctor_id: input.doctor_id.toLowerCase(),
      doctor_name: input.doctor_name ?? null,
      expiry_at: input.expiry_at ?? null,
      tx_hash: input.tx_hash ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error("[Supabase] insertAccessGrant:", error.message)
    return { data: null, error: error.message }
  }
  return { data: rowToAccessGrant(data as AccessGrantRow), error: null }
}
