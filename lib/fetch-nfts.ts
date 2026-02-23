/**
 * Fetch NFTs owned by an address using third-party APIs (Alchemy).
 * Falls back to on-chain calls when no API key is set.
 */

import { MEDICAL_VAULT_NFT_ADDRESS } from "./medical-vault-contract"
import type { Address } from "viem"

const ALCHEMY_SEPOLIA_NFT_BASE = "https://eth-sepolia.g.alchemy.com/nft/v2"

/** Alchemy getNFTsForOwner response shape */
interface AlchemyOwnedNft {
  tokenId?: string
  id?: { tokenId: string }
}

interface AlchemyNftsResponse {
  ownedNfts?: AlchemyOwnedNft[]
  totalCount?: number
}

function parseTokenId(raw: string | undefined): bigint | null {
  if (raw == null || raw === "") return null
  try {
    if (raw.startsWith("0x")) return BigInt(raw)
    return BigInt(raw)
  } catch {
    return null
  }
}

/**
 * Fetch token IDs of MedicalVault NFTs owned by the given address using Alchemy NFT API.
 * Requires NEXT_PUBLIC_ALCHEMY_API_KEY to be set. Returns [] if key is missing or request fails.
 */
export async function fetchOwnedTokenIdsFromAlchemy(
  ownerAddress: Address,
  contractAddress: string = MEDICAL_VAULT_NFT_ADDRESS
): Promise<bigint[]> {
  const apiKey = typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
    : process.env.NEXT_PUBLIC_ALCHEMY_API_KEY

  if (!apiKey?.trim()) {
    return []
  }

  const url = new URL(`${ALCHEMY_SEPOLIA_NFT_BASE}/${apiKey}/getNFTsForOwner`)
  url.searchParams.set("owner", ownerAddress)
  url.searchParams.set("contractAddresses[]", contractAddress)

  try {
    const res = await fetch(url.toString(), { method: "GET" })
    if (!res.ok) return []

    const data = (await res.json()) as AlchemyNftsResponse
    const list = data?.ownedNfts ?? []
    const tokenIds: bigint[] = []

    for (const nft of list) {
      const raw = nft.tokenId ?? nft.id?.tokenId
      const id = parseTokenId(raw)
      if (id != null) tokenIds.push(id)
    }

    return tokenIds.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
  } catch {
    return []
  }
}

/**
 * Get owned MedicalVault token IDs via Alchemy. Returns null if API key is not set
 * or request failed (caller should fall back to on-chain). Returns array (possibly empty)
 * when API key is set and request succeeded.
 */
export async function getOwnedTokenIdsViaApi(ownerAddress: Address): Promise<bigint[] | null> {
  if (!process.env.NEXT_PUBLIC_ALCHEMY_API_KEY?.trim()) return null
  try {
    const ids = await fetchOwnedTokenIdsFromAlchemy(ownerAddress)
    return ids
  } catch {
    return null
  }
}
