// lib/file-encryption.ts

/**
 * Minimal implementation:
 * - reads the file into bytes
 * - computes a SHA‑256 hash for reference
 * - returns the original file as "encryptedBlob" (no-op encryption)
 */
export async function encryptAndHashFile(file: File): Promise<{
    encryptedBlob: Blob
    fileHash: string
  }> {
    // Read file bytes
    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
  
    // Compute SHA‑256 hash of file content
    const hashBuffer = await crypto.subtle.digest("SHA-256", bytes)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const fileHash =
      "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  
    // In a real setup you would encrypt here; for now we just re-wrap the bytes
    const encryptedBlob = new Blob([bytes], { type: file.type })
  
    return { encryptedBlob, fileHash }
  }