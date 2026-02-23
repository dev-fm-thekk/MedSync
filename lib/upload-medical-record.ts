// lib/upload-medical-record.ts
import { createClient } from "@/supabase/client"

const BUCKET = "medical-records" // create this bucket in Supabase Storage

/**
 * Uploads the (already “encrypted”) blob to Supabase Storage and
 * returns the storage path, which you then use as the CID/encryptedPayload.
 */
export async function uploadEncryptedRecord(
  patientId: string,
  recordId: string,
  encryptedBlob: Blob,
  fileName: string
): Promise<{ path: string }> {
  const supabase = createClient()

  // Sanitize pieces for a safe path
  const safePatient = patientId.replace(/[^a-zA-Z0-9-_]/g, "_")
  const safeRecord = recordId.replace(/[^a-zA-Z0-9-_]/g, "_")
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_") || "file"

  // Path inside the bucket (this string is what you use as `encryptedPayload`)
  const path = `${safePatient}/records/${safeRecord}/${safeName}`

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, encryptedBlob, {
      contentType: encryptedBlob.type || "application/octet-stream",
      upsert: false, // avoid overwriting by default
    })

  if (error) {
    throw new Error(error.message)
  }

  // supabase-js v2 returns `data.path`; fall back to our constructed path
  return { path: data?.path ?? path }
}