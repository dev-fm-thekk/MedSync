# API Integration Guide

## Overview

MedSync now includes a complete API integration layer that connects to your backend server. The configuration is centralized and environment-based, making it seamless to switch between different deployment environments.

## Configuration

### Setting the Backend URL

The backend base URL is configured via the `NEXT_PUBLIC_API_BASE_URL` environment variable:

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# For production
NEXT_PUBLIC_API_BASE_URL=https://api.medvault.com

# For staging
NEXT_PUBLIC_API_BASE_URL=https://staging-api.medvault.com
```

**Important:** Only change the `NEXT_PUBLIC_API_BASE_URL` value. All API endpoints are relative to this base URL, so no code changes are needed when switching environments.

## Architecture

### Files Overview

- `lib/api-config.ts` - Centralized configuration for all API endpoints
- `lib/api-client.ts` - HTTP client with methods for each endpoint
- `hooks/use-api.ts` - React hook for using the API client in components
- `components/medical-records.tsx` - UI for minting medical records
- `components/access-management.tsx` - UI for managing access grants
- `components/system-status.tsx` - UI for monitoring system health

### Data Flow

```
Component
   ↓
useApi Hook
   ↓
API Client
   ↓
API Config (gets base URL)
   ↓
Backend Server
```

## Usage Examples

### Minting a Medical Record

```typescript
import useApi from '@/hooks/use-api'
import { useAuth } from '@/lib/auth-context'

function MyComponent() {
  const { user, walletAddress } = useAuth()
  const { mintRecord, mint } = useApi()

  const handleMint = async () => {
    const result = await mintRecord(user.id, {
      patientAddress: walletAddress as `0x${string}`,
      encryptedPayload: "QmXxxx...", // IPFS CID
      metadata: { recordType: "lab_result" },
      account: walletAddress as `0x${string}`,
    })
    
    console.log("Minted:", result.txHash)
  }

  return (
    <button onClick={handleMint} disabled={mint.isLoading}>
      {mint.isLoading ? "Minting..." : "Mint Record"}
    </button>
  )
}
```

### Granting Access to a Doctor

```typescript
const { grantAccess, grantAccess: state } = useApi()

const result = await grantAccess(user.id, {
  tokenId: "123",
  doctorAddress: "0x1234...",
  account: walletAddress as `0x${string}`,
  durationSeconds: 2592000, // 30 days
})
```

### Getting a Medical Record

```typescript
const { getRecord, record } = useApi()

const recordData = await getRecord("123", "0x1234...")
console.log("IPFS CID:", recordData.cid)
```

### Checking System Status

```typescript
const { getSystemStatus, status } = useApi()

const systemStatus = await getSystemStatus()
console.log("Blockchain:", systemStatus.chain)
console.log("IPFS:", systemStatus.ipfs)
```

## API Endpoints

All endpoints are automatically prefixed with your `NEXT_PUBLIC_API_BASE_URL`.

### POST /v1/records/{userId}/mint
Mint a medical record as an NFT.

**Authentication:** Required (X-Patient-Signature or Bearer JWT)

**Request:**
```json
{
  "patientAddress": "0x...",
  "encryptedPayload": "QmXxxx...",
  "metadata": { "recordType": "lab_result" },
  "account": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "txHash": "0x...",
  "receipt": {...},
  "message": "Record minted successfully"
}
```

### POST /v1/records/access/{userId}/grant
Grant a doctor access to a medical record.

**Authentication:** Required

**Request:**
```json
{
  "tokenId": "123",
  "doctorAddress": "0x...",
  "account": "0x...",
  "durationSeconds": 2592000
}
```

**Response:**
```json
{
  "status": "success",
  "expiry": 1234567890,
  "txHash": "0x...",
  "receipt": {...},
  "message": "Access granted"
}
```

### GET /v1/records/{tokenId}?doctorAddress=0x...
Retrieve a medical record (if authorized).

**Authentication:** Required

**Query Parameters:**
- `doctorAddress` - Doctor's wallet address

**Response:**
```json
{
  "accessActive": true,
  "tokenId": 123,
  "doctorAddress": "0x...",
  "cid": "ipfs://QmXxxx...",
  "fileHash": "abc123..."
}
```

### GET /v1/system/status
Get system health status.

**Response:**
```json
{
  "chain": "connected",
  "ipfs": "online",
  "contract": "0x...",
  "contractStatus": "Live"
}
```

## Authentication

### Setting Authentication Tokens

For endpoints that require authentication, set the token:

```typescript
const { setAuthToken, setPatientSignature } = useApi()

// For Bearer JWT
setAuthToken("eyJhbGc...")

// For X-Patient-Signature header
setPatientSignature("0x...")
```

The API client automatically includes these headers on all requests.

### Clearing Authentication

```typescript
const { clearAuth } = useApi()
clearAuth()
```

## Pre-built Components

### Medical Records Component
Handles minting and displaying medical records.

```tsx
import { MedicalRecords } from '@/components/medical-records'

export default function Page() {
  return <MedicalRecords />
}
```

### Access Management Component
Handles granting and revoking access to records.

```tsx
import { AccessManagement } from '@/components/access-management'

export default function Page() {
  return <AccessManagement />
}
```

### System Status Component
Displays backend and blockchain health.

```tsx
import { SystemStatus } from '@/components/system-status'

export default function Page() {
  return <SystemStatus />
}
```

## Environment Setup

### Development

1. Create `.env.local`:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

2. Make sure your backend is running on `localhost:3001`

3. Start the frontend:
```bash
npm run dev
```

### Production

1. Update `.env.production.local`:
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.medvault.com
```

2. Build and deploy:
```bash
npm run build
npm start
```

## Error Handling

All API methods include comprehensive error handling:

```typescript
try {
  const result = await mintRecord(userId, data)
  // Handle success
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error'
  console.error('Mint failed:', message)
}
```

The useApi hook also provides error state:

```typescript
const { mint } = useApi()

if (mint.error) {
  return <div className="text-red-600">{mint.error}</div>
}
```

## CORS Configuration

If you get CORS errors, ensure your backend is configured to accept requests from your frontend domain:

```javascript
// Backend (Express)
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))
```

## Debugging

Enable detailed logging:

```typescript
// All API calls log to console with [v0] prefix
const result = await mintRecord(userId, data)
// Check console for: [v0] Mint record successful: {...}
```

## Troubleshooting

### "Failed to connect to backend"
- Check that `NEXT_PUBLIC_API_BASE_URL` is correctly set
- Verify your backend server is running
- Check browser console for CORS errors

### "Unauthorized" errors
- Ensure authentication token/signature is set via `setAuthToken()` or `setPatientSignature()`
- Verify the backend expects the correct header format

### "404 Not Found"
- Check that your backend routes match exactly
- Verify the endpoint paths in `lib/api-config.ts`

## Next Steps

1. Integrate the pre-built components into your dashboards
2. Test each endpoint with your backend
3. Add error handling and user feedback as needed
4. Deploy to production with the correct API URL

