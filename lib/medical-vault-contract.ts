import { createPublicClient, createWalletClient, custom, sha256, stringToBytes, type Address, type Hex } from "viem"
import { sepolia } from "viem/chains"

// Sepolia deployment of MedicalVaultNFT
export const MEDICAL_VAULT_NFT_ADDRESS = "0x29f3C1F07D088d05c0423ffB6c55A15B9dBd97e6" as const

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
] as const

function getEthereumProvider() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Wallet provider (window.ethereum) is not available")
  }
  return window.ethereum
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
  const { publicClient } = getClients()

  const uri = await publicClient.readContract({
    address: MEDICAL_VAULT_NFT_ADDRESS,
    abi: medicalVaultNftAbi,
    functionName: "tokenURI",
    args: [tokenId],
  })

  return uri as string
}

