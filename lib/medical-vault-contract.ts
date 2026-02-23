import { createPublicClient, createWalletClient, custom, sha256, stringToBytes, type Address, type Hex } from "viem"
import { sepolia } from "viem/chains"

// Sepolia deployment of MedicalVaultNFT
export const MEDICAL_VAULT_NFT_ADDRESS = "0xc05bB50C090A3F8255a28094301de787afe6e41F" as const

// Minimal ABI for the MedicalVaultNFT contract + ERC721URIStorage pieces we need
export const medicalVaultNftAbi = [
  // mintRecord(address patient, string cid, bytes32 fileHash) external returns (uint256)
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "mintRecord",
    inputs: [
      { name: "patient", type: "address" },
      { name: "cid", type: "string" },
      { name: "fileHash", type: "bytes32" },
    ],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
  // grantViewerRole(uint256 tokenId, address doctor, uint256 durationInSeconds)
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "grantViewerRole",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "doctor", type: "address" },
      { name: "durationInSeconds", type: "uint256" },
    ],
    outputs: [],
  },
  // hasAccess(uint256 tokenId, address doctor) public view returns (bool)
  {
    type: "function",
    stateMutability: "view",
    name: "hasAccess",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "doctor", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  // tokenURI(uint256 tokenId) external view returns (string memory)
  {
    type: "function",
    stateMutability: "view",
    name: "tokenURI",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
  // balanceOf(address owner) view returns (uint256) — ERC721
  {
    type: "function",
    stateMutability: "view",
    name: "balanceOf",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  // tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256) — ERC721Enumerable
  {
    type: "function",
    stateMutability: "view",
    name: "tokenOfOwnerByIndex",
    inputs: [
      { name: "owner", type: "address" },
      { name: "index", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  // ownerOf(uint256 tokenId) view returns (address) — ERC721
  {
    type: "function",
    stateMutability: "view",
    name: "ownerOf",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
] as const

// ERC721 Transfer event for fallback when contract doesn't support enumeration
const transferEventAbi = [
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
    ],
  },
] as const

function getEthereumProvider() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Wallet provider (window.ethereum) is not available")
  }
  return window.ethereum
}

async function ensureSepoliaNetwork() {
  const provider = getEthereumProvider()
  const expectedHex = `0x${sepolia.id.toString(16)}` // 0xaa36a7

  let chainIdHex = (await provider.request({ method: "eth_chainId" })) as string

  if (chainIdHex.toLowerCase() === expectedHex.toLowerCase()) {
    return
  }

  // Try to switch the wallet to Sepolia
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: expectedHex }],
    })
  } catch (switchError) {
    // If Sepolia is not added, try adding it
    try {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: expectedHex,
            chainName: "Sepolia Test Network",
            nativeCurrency: {
              name: "Sepolia ETH",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: ["https://sepolia.infura.io/v3/"], // user can override via wallet
            blockExplorerUrls: ["https://sepolia.etherscan.io"],
          },
        ],
      })
    } catch {
      throw new Error(
        "Please switch your wallet to the Sepolia test network (chain id 11155111) and try again.",
      )
    }
  }

  // Verify we are now on Sepolia
  chainIdHex = (await provider.request({ method: "eth_chainId" })) as string
  if (chainIdHex.toLowerCase() !== expectedHex.toLowerCase()) {
    throw new Error(
      "Please switch your wallet to the Sepolia test network (chain id 11155111) and try again.",
    )
  }
}

function getClients() {
  const transport = custom(getEthereumProvider())

  const publicClient = createPublicClient({
    chain: sepolia,
    transport,
  })

  const walletClient = createWalletClient({
    chain: sepolia,
    transport,
  })

  return { publicClient, walletClient }
}

export async function mintRecordOnChain(params: {
  patientAddress: Address
  cid: string
  account: Address
}) {
  await ensureSepoliaNetwork()
  const { publicClient, walletClient } = getClients()

  // Derive a deterministic SHA-256 hash from the CID/encrypted payload
  const fileHash: Hex = sha256(stringToBytes(params.cid))

  const hash = await walletClient.writeContract({
    address: MEDICAL_VAULT_NFT_ADDRESS,
    abi: medicalVaultNftAbi,
    functionName: "mintRecord",
    account: params.account,
    args: [params.patientAddress, params.cid, fileHash],
  })

  const receipt = await publicClient.waitForTransactionReceipt({ hash })

  return { hash, receipt, fileHash }
}

export async function grantViewerRoleOnChain(params: {
  tokenId: bigint
  doctorAddress: Address
  durationSeconds: bigint
  account: Address
}) {
  await ensureSepoliaNetwork()
  const { publicClient, walletClient } = getClients()

  const hash = await walletClient.writeContract({
    address: MEDICAL_VAULT_NFT_ADDRESS,
    abi: medicalVaultNftAbi,
    functionName: "grantViewerRole",
    account: params.account,
    args: [params.tokenId, params.doctorAddress, params.durationSeconds],
  })

  const receipt = await publicClient.waitForTransactionReceipt({ hash })

  return { hash, receipt }
}

export async function hasAccessOnChain(params: {
  tokenId: bigint
  doctorAddress: Address
}) {
  await ensureSepoliaNetwork()
  const { publicClient } = getClients()

  const accessActive = await publicClient.readContract({
    address: MEDICAL_VAULT_NFT_ADDRESS,
    abi: medicalVaultNftAbi,
    functionName: "hasAccess",
    args: [params.tokenId, params.doctorAddress],
  })

  return accessActive as boolean
}

export async function getTokenUriOnChain(tokenId: bigint) {
  await ensureSepoliaNetwork()
  const { publicClient } = getClients()

  const uri = await publicClient.readContract({
    address: MEDICAL_VAULT_NFT_ADDRESS,
    abi: medicalVaultNftAbi,
    functionName: "tokenURI",
    args: [tokenId],
  })

  return uri as string
}

/**
 * Get all token IDs owned by an address (patient).
 * Tries ERC721Enumerable first; if the contract doesn't support it (revert), falls back to
 * querying Transfer events and filtering by current owner.
 */
export async function getOwnedTokenIds(ownerAddress: Address): Promise<bigint[]> {
  await ensureSepoliaNetwork()
  const { publicClient } = getClients()

  // 1) Try enumeration (works with new contract that has ERC721Enumerable)
  try {
    const balance = await publicClient.readContract({
      address: MEDICAL_VAULT_NFT_ADDRESS,
      abi: medicalVaultNftAbi,
      functionName: "balanceOf",
      args: [ownerAddress],
    })

    const count = Number(balance)
    if (count === 0) return []

    const tokenIds: bigint[] = []
    for (let i = 0; i < count; i++) {
      const tokenId = await publicClient.readContract({
        address: MEDICAL_VAULT_NFT_ADDRESS,
        abi: medicalVaultNftAbi,
        functionName: "tokenOfOwnerByIndex",
        args: [ownerAddress, BigInt(i)],
      })
      tokenIds.push(tokenId as bigint)
    }
    return tokenIds
  } catch {
    // 2) Fallback: contract doesn't support tokenOfOwnerByIndex — use Transfer events
    return getOwnedTokenIdsFromEvents(publicClient, ownerAddress)
  }
}

/**
 * Get owned token IDs by scanning Transfer events (for contracts without ERC721Enumerable).
 */
async function getOwnedTokenIdsFromEvents(
  publicClient: ReturnType<typeof createPublicClient>,
  ownerAddress: Address
): Promise<bigint[]> {
  const logs = await publicClient.getLogs({
    address: MEDICAL_VAULT_NFT_ADDRESS,
    event: transferEventAbi[0],
    args: { to: ownerAddress },
    fromBlock: BigInt(0),
    toBlock: "latest",
  })

  const tokenIds = [...new Set(logs.map((log) => (log.args.tokenId as bigint)!))].filter(
    (id): id is bigint => id != null
  )

  // Only return tokens still owned by the address (in case of transfers out)
  const owned: bigint[] = []
  for (const tokenId of tokenIds) {
    try {
      const owner = await publicClient.readContract({
        address: MEDICAL_VAULT_NFT_ADDRESS,
        abi: medicalVaultNftAbi,
        functionName: "ownerOf",
        args: [tokenId],
      })
      if (owner && String(owner).toLowerCase() === String(ownerAddress).toLowerCase()) {
        owned.push(tokenId)
      }
    } catch {
      // token may be burned or invalid, skip
    }
  }

  return owned.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
}

