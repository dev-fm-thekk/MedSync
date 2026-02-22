# API Integration - Quick Start

## 1. Configure Backend URL

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

**That's it!** All API calls will use this base URL.

## 2. Use in Your Components

### Option A: Use Pre-built Components

```tsx
import { MedicalRecords } from '@/components/medical-records'
import { AccessManagement } from '@/components/access-management'
import { SystemStatus } from '@/components/system-status'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <MedicalRecords />
      <AccessManagement />
      <SystemStatus />
    </div>
  )
}
```

### Option B: Use the Hook Directly

```tsx
import useApi from '@/hooks/use-api'
import { useAuth } from '@/lib/auth-context'

export default function MyComponent() {
  const { user, walletAddress } = useAuth()
  const { mintRecord, mint } = useApi()

  const handleMint = async () => {
    try {
      const result = await mintRecord(user.id, {
        patientAddress: walletAddress as `0x${string}`,
        encryptedPayload: "ipfs-cid-here",
        metadata: { type: "lab_result" },
        account: walletAddress as `0x${string}`,
      })
      console.log('Minted:', result.txHash)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <button onClick={handleMint} disabled={mint.isLoading}>
      {mint.isLoading ? 'Minting...' : 'Mint Record'}
    </button>
  )
}
```

## 3. Common Tasks

### Check System Status
```tsx
import { SystemStatus } from '@/components/system-status'

// Just render the component
return <SystemStatus />
```

### Grant Access to Doctor
```tsx
const { grantAccess } = useApi()

await grantAccess(userId, {
  tokenId: "123",
  doctorAddress: "0x1234...",
  account: walletAddress as `0x${string}`,
  durationSeconds: 2592000, // 30 days
})
```

### Get Record (if authorized)
```tsx
const { getRecord, record } = useApi()

const data = await getRecord("123", "0x1234...")
console.log(data.cid) // IPFS CID
```

## 4. Change Backend URL (When Needed)

Just update `.env.local`:

```bash
# Development
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# Staging
NEXT_PUBLIC_API_BASE_URL=https://staging-api.medvault.com

# Production
NEXT_PUBLIC_API_BASE_URL=https://api.medvault.com
```

No code changes needed!

## 5. Set Authentication (If Needed)

```tsx
import useApi from '@/hooks/use-api'

export function LoginFlow() {
  const { setAuthToken, setPatientSignature } = useApi()

  // After receiving token from backend
  setAuthToken("your-jwt-token")
  
  // Or for signature-based auth
  setPatientSignature("0x...")
}
```

## File Structure

```
lib/
  ├── api-config.ts       ← Configuration and endpoints
  └── api-client.ts       ← HTTP client with methods

hooks/
  └── use-api.ts          ← React hook for components

components/
  ├── medical-records.tsx     ← Pre-built UI
  ├── access-management.tsx   ← Pre-built UI
  └── system-status.tsx       ← Pre-built UI
```

## Environment Variables

One variable controls everything:

```bash
NEXT_PUBLIC_API_BASE_URL=http://your-backend:port
```

That's all you need!

## API Endpoints (All Prefixed with Base URL)

- `POST /v1/records/{userId}/mint` - Create NFT
- `POST /v1/records/access/{userId}/grant` - Grant access
- `GET /v1/records/{tokenId}?doctorAddress=0x...` - Get record
- `GET /v1/system/status` - Check health

## Debugging

Check browser console for API calls:
```
[v0] Mint record successful: {...}
[v0] Grant access successful: {...}
[v0] System status: {...}
```

All requests log with `[v0]` prefix.

## Next: Read Full Documentation

For detailed information, see `API_INTEGRATION.md`

