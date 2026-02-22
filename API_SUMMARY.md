# API Integration - Complete Summary

## What's Been Added

A complete API integration layer that connects your MedSync frontend to your backend server with environment-based configuration.

## Key Files Created

### Core API Layer
- **`lib/api-config.ts`** - Centralized configuration managing all endpoints and base URL
- **`lib/api-client.ts`** - HTTP client with type-safe methods for each endpoint
- **`hooks/use-api.ts`** - React hook for easy component integration

### Pre-built UI Components
- **`components/medical-records.tsx`** - Mint medical records as NFTs
- **`components/access-management.tsx`** - Grant/revoke doctor access
- **`components/system-status.tsx`** - Monitor backend and blockchain health

### Configuration
- **`.env.example`** - Template showing required environment variables
- **`API_INTEGRATION.md`** - Complete reference documentation
- **`API_SETUP_QUICK_START.md`** - Quick setup guide
- **`INTEGRATION_EXAMPLE.md`** - Real-world integration examples

## Quick Start (3 Steps)

### 1. Set Backend URL
Create `.env.local`:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### 2. Use Components
```tsx
import { MedicalRecords } from '@/components/medical-records'
import { AccessManagement } from '@/components/access-management'
import { SystemStatus } from '@/components/system-status'

export default function Dashboard() {
  return (
    <>
      <MedicalRecords />
      <AccessManagement />
      <SystemStatus />
    </>
  )
}
```

### 3. That's It!
All API calls automatically use your configured backend URL.

## Key Features

### 1. Centralized Configuration
- All endpoints defined in one place (`lib/api-config.ts`)
- Backend URL controlled by single environment variable
- Easy to switch between local/staging/production

### 2. Type Safety
- Full TypeScript support
- Request/response types for every endpoint
- Compile-time error checking

### 3. Error Handling
- Comprehensive try-catch in API client
- State management in hook (data, error, loading)
- User-friendly error messages

### 4. Authentication
- Support for Bearer JWT tokens
- Support for X-Patient-Signature headers
- Methods to set/clear auth data

### 5. Pre-built Components
- Ready-to-use UI for common operations
- Built-in error states and loading indicators
- Fully styled with Tailwind CSS

## How It Works

```
Frontend Component
       ↓
  useApi Hook (manages state + calls methods)
       ↓
  API Client (makes HTTP requests)
       ↓
  API Config (provides base URL + endpoints)
       ↓
Backend Server
```

## Endpoints Integrated

All from your `access-route.ts`:

- **POST /v1/records/{userId}/mint** - Mint medical record NFT
- **POST /v1/records/access/{userId}/grant** - Grant doctor access
- **GET /v1/records/{tokenId}** - Get record (if authorized)
- **GET /v1/system/status** - Check system health

## Environment Configuration

### Development
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### Staging
```bash
NEXT_PUBLIC_API_BASE_URL=https://staging-api.medvault.com
```

### Production
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.medvault.com
```

**Change only the URL, no code changes needed!**

## Usage Examples

### In a Component

```tsx
import useApi from '@/hooks/use-api'
import { useAuth } from '@/lib/auth-context'

function MyComponent() {
  const { user, walletAddress } = useAuth()
  const { mintRecord, mint, setPatientSignature } = useApi()

  const handle = async () => {
    // Set auth if needed
    setPatientSignature("0x...")

    // Call API
    const result = await mintRecord(user.id, {
      patientAddress: walletAddress as `0x${string}`,
      encryptedPayload: "ipfs-cid",
      account: walletAddress as `0x${string}`,
    })

    console.log('Success:', result.txHash)
  }

  return (
    <button onClick={handle} disabled={mint.isLoading}>
      {mint.isLoading ? 'Loading...' : 'Submit'}
    </button>
  )
}
```

## Architecture Benefits

1. **Centralized**: All endpoints in one place
2. **Flexible**: Change backend URL without code changes
3. **Type-safe**: Full TypeScript support
4. **Reusable**: Hook works in any component
5. **Maintainable**: Easy to add new endpoints
6. **Testable**: Mock API for testing
7. **Scalable**: Ready for new features

## Adding New Endpoints

To add a new endpoint:

1. Add to `lib/api-config.ts`:
```typescript
endpoints: {
  myNewEndpoint: (id: string) => `/v1/path/${id}`,
}
```

2. Add method to `lib/api-client.ts`:
```typescript
async myNewMethod(id: string, data: MyType): Promise<MyResponse> {
  const url = apiConfig.getFullUrl(apiConfig.endpoints.myNewEndpoint(id))
  // ... handle request
}
```

3. Add hook method to `hooks/use-api.ts`:
```typescript
const myNew = useCallback(async (id: string, data: MyType) => {
  // ... state management
}, [])
```

4. Use in component:
```typescript
const { myNew, myNew: state } = useApi()
await myNew(id, data)
```

## Security Considerations

1. **Never expose sensitive data**: Use `NEXT_PUBLIC_` only for non-sensitive URLs
2. **Use HTTPS**: Always use HTTPS for production
3. **CORS**: Configure CORS on backend to accept requests from frontend domain
4. **Authentication**: Use secure tokens/signatures for sensitive operations
5. **Rate limiting**: Implement on backend to prevent abuse

## Debugging

All API calls log with `[v0]` prefix:

```
[v0] Mint record successful: { txHash: "0x...", ... }
[v0] Grant access successful: { ... }
[v0] System status: { chain: "connected", ... }
```

Check browser console to debug.

## Common Issues & Solutions

### "Failed to connect to backend"
- Verify `NEXT_PUBLIC_API_BASE_URL` is correct
- Check backend server is running
- Check CORS configuration on backend

### "Unauthorized" error
- Call `setAuthToken()` or `setPatientSignature()` first
- Verify token/signature format

### "404 Not Found"
- Verify endpoint paths match exactly
- Check `lib/api-config.ts` endpoints

### CORS errors
Configure backend:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true
}))
```

## Integration Steps

1. ✅ Create `.env.local` with backend URL
2. ✅ Import components/hook
3. ✅ Verify backend server running
4. ✅ Test each endpoint
5. ✅ Add error handling
6. ✅ Deploy to production

## Next Steps

1. Read `API_SETUP_QUICK_START.md` for quick start
2. Read `API_INTEGRATION.md` for detailed reference
3. Read `INTEGRATION_EXAMPLE.md` for real-world examples
4. Integrate components into your dashboards
5. Test all endpoints
6. Deploy with correct backend URL

## File Structure Reference

```
lib/
├── api-config.ts          # Configuration & endpoints
├── api-client.ts          # HTTP client
└── auth-context.tsx       # Auth (existing)

hooks/
├── use-api.ts             # API hook (NEW)
└── use-medsync-auth.ts    # Auth hook (existing)

components/
├── medical-records.tsx    # Pre-built UI (NEW)
├── access-management.tsx  # Pre-built UI (NEW)
├── system-status.tsx      # Pre-built UI (NEW)
└── ... (other components)
```

## Summary

You now have a complete, production-ready API integration layer that:
- Connects to your backend server
- Supports all endpoints from access-route.ts
- Is configurable via environment variables
- Includes pre-built UI components
- Has full TypeScript support
- Includes comprehensive error handling
- Is easy to extend with new endpoints

All you need to do is set `NEXT_PUBLIC_API_BASE_URL` and start using it!

