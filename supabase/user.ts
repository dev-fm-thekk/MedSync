// supabase/queries.ts
// ✅ Uses the browser client — safe to call from Client Components

import { createClient } from "./client"


/**
 * Upsert a profile after MetaMask connects.
 * insert → upsert: handles returning wallets without duplicate key errors.
 */

export type UserRole = "patient" | "doctor"


export interface Profile {
  id: string          // wallet address (text)
  full_name: string | null
  role: UserRole
  updated_at: string | null
}
export async function upsertProfile(
  walletAddress: string,
  fullName: string,
  role: UserRole
): Promise<{ data: Profile | null; error: string | null }> {
    console.log(walletAddress, fullName, role);
    const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: walletAddress.toLowerCase(),
        full_name: fullName.trim(),
        role,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
    .select()
    .single()

    console.log(``);
  console.log("[upsertProfile] error:", error)

  if (error) {
    console.error("[Supabase] upsertProfile error:", error.message)
    return { data: null, error: error.message }
  }

  return { data: data as Profile, error: null }
}

/**
 * Fetch an existing profile by wallet address.
 * Returns null if the wallet has never signed up.
 */
export async function getProfile(
  walletAddress: string
): Promise<Profile | null> {
    const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", walletAddress.toLowerCase())
    .single()

  console.log("[getProfile] data:", data)

  if (error || !data) return null
  return data as Profile
}

/** Fetch all profiles with a given role (e.g. "doctor" for booking). */
export async function getProfilesByRole(role: UserRole): Promise<Profile[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", role)
    .order("full_name", { ascending: true })

  if (error) {
    console.error("[Supabase] getProfilesByRole:", error.message)
    return []
  }
  return (data ?? []) as Profile[]
}