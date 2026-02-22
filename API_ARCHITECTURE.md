# API Integration Architecture

## Overview Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    MedSync Frontend (Next.js)              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          UI Components (Pre-built)                  │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  - MedicalRecords                                    │  │
│  │  - AccessManagement                                 │  │
│  │  - SystemStatus                                     │  │
│  │  - Your Custom Components                           │  │
│  └─────────────────────────┬──────────────────────────┘  │
│                            │                               │
│  ┌─────────────────────────▼──────────────────────────┐  │
│  │         useApi Hook                                │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  - mintRecord()                                      │  │
│  │  - grantAccess()                                     │  │
│  │  - getRecord()                                       │  │
│  │  - getSystemStatus()                                │  │
│  │  - setAuthToken()                                    │  │
│  │  - State management (data, error, loading)           │  │
│  └─────────────────────────┬──────────────────────────┘  │
│                            │                               │
│  ┌─────────────────────────▼──────────────────────────┐  │
│  │       API Client (api-client.ts)                   │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  - HTTP request handling                             │  │
│  │  - Error handling                                    │  │
│  │  - Authentication headers                            │  │
│  │  - Response parsing                                  │  │
│  │  - Type-safe methods                                 │  │
│  └─────────────────────────┬──────────────────────────┘  │
│                            │                               │
│  ┌─────────────────────────▼──────────────────────────┐  │
│  │   API Config (api-config.ts)                       │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  - NEXT_PUBLIC_API_BASE_URL (from .env.local)      │  │
│  │  - Endpoint paths                                    │  │
│  │  - URL builder utilities                             │  │
│  │  - Default headers                                   │  │
│  └─────────────────────────┬──────────────────────────┘  │
│                            │                               │
│                            │ fetch()                       │
│                            │                               │
└────────────────────────────┼───────────────────────────────┘
                             │
                    HTTP Request / Response
                             │
┌────────────────────────────▼───────────────────────────────┐
│             Backend Server (Express.js)                    │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  POST   /v1/records/{userId}/mint                        │
│  POST   /v1/records/access/{userId}/grant                │
│  GET    /v1/records/{tokenId}                            │
│  GET    /v1/system/status                                │
│                                                            │
│  ├─ Database Operations                                   │
│  ├─ Blockchain Interactions                               │
│  ├─ IPFS Upload/Retrieval                                 │
│  └─ Authentication                                        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Data Flow Example: Minting a Record

```
User fills form with medical data
         │
         ▼
┌─────────────────────────┐
│ Click "Mint Record"     │
└────────────┬────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ Component calls:                         │
│ mintRecord(userId, {                     │
│   patientAddress: "0x...",               │
│   encryptedPayload: "ipfs-cid",          │
│   account: "0x..."                       │
│ })                                       │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ useApi Hook:                             │
│ - Sets isLoading = true                  │
│ - Calls apiClient.mintRecord()           │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ API Client:                              │
│ - Gets auth header                       │
│ - Builds full URL using api-config       │
│ - Makes fetch request                    │
│ - Parses response                        │
│ - Returns typed result                   │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ API Config:                              │
│ - Provides baseURL from env              │
│ - Provides endpoint path                 │
│ - Combines to full URL:                  │
│   http://localhost:3001/v1/records/123/mint
└────────────┬─────────────────────────────┘
             │
             ▼
        HTTP POST to Backend
             │
             ▼
┌──────────────────────────────────────────┐
│ Backend Processes:                       │
│ - Validate auth                          │
│ - Encrypt payload                        │
│ - Upload to IPFS                         │
│ - Mint NFT via smart contract            │
│ - Return txHash                          │
└────────────┬─────────────────────────────┘
             │
             ▼
        HTTP Response (200 OK)
             │
             ▼
┌──────────────────────────────────────────┐
│ API Client:                              │
│ - Parses JSON response                   │
│ - Returns MintRecordResponse              │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ useApi Hook:                             │
│ - Sets data = response                   │
│ - Sets isLoading = false                 │
│ - Component re-renders                   │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ Component:                               │
│ - Shows success message                  │
│ - Displays txHash                        │
│ - User sees confirmation                 │
└──────────────────────────────────────────┘
```

## File Organization

```
frontend/
│
├── lib/
│   ├── api-config.ts         ← Configuration hub
│   ├── api-client.ts         ← HTTP requests
│   └── auth-context.tsx      ← Auth (existing)
│
├── hooks/
│   ├── use-api.ts            ← Component integration
│   └── use-medsync-auth.ts   ← Auth (existing)
│
├── components/
│   ├── medical-records.tsx       ← Pre-built UI
│   ├── access-management.tsx     ← Pre-built UI
│   ├── system-status.tsx         ← Pre-built UI
│   └── ... (other components)
│
├── .env.example
├── .env.local               ← ADD THIS: NEXT_PUBLIC_API_BASE_URL=...
│
└── docs/
    ├── API_INTEGRATION.md        ← Full reference
    ├── API_SETUP_QUICK_START.md  ← Quick start
    ├── INTEGRATION_EXAMPLE.md    ← Examples
    └── API_ARCHITECTURE.md       ← This file
```

## Configuration Flow

```
┌──────────────────────┐
│   .env.local         │
│ (Development)        │
│ NEXT_PUBLIC_API_     │
│ BASE_URL=            │
│ http://localhost:    │
│ 3001                 │
└──────────────┬───────┘
               │
               ▼
┌──────────────────────────────────────┐
│ api-config.ts                        │
│                                      │
│ const API_BASE_URL =                 │
│  process.env.NEXT_PUBLIC_API_BASE_URL│
│  || "http://localhost:3001"          │
│                                      │
│ baseURL: http://localhost:3001       │
│ endpoints: {...}                     │
│ getFullUrl(endpoint) → full URL      │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ api-client.ts                        │
│                                      │
│ async mintRecord(userId, data) {     │
│   url = apiConfig.getFullUrl(...)    │
│   fetch(url, ...)                    │
│ }                                    │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ Component / useApi Hook              │
│                                      │
│ const { mintRecord } = useApi()      │
│ await mintRecord(userId, data)       │
└──────────────────────────────────────┘
```

## Change Backend URL

```
Development:
  .env.local:
  NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
  
Staging:
  .env.staging.local:
  NEXT_PUBLIC_API_BASE_URL=https://staging-api.medvault.com
  
Production:
  .env.production.local:
  NEXT_PUBLIC_API_BASE_URL=https://api.medvault.com
```

**NO CODE CHANGES NEEDED!** Only change the environment variable.

## Authentication Flow

```
┌──────────────────┐
│ User Login       │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Backend returns JWT token             │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Component calls:                      │
│ setAuthToken("eyJhbGc...")            │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Token stored in localStorage           │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Future API calls auto-include:        │
│ Authorization: Bearer eyJhbGc...      │
└──────────────────────────────────────┘
```

## Component Hierarchy

```
App
├── Layout
│   └── Providers
│       └── AuthProvider
│           └── Your Page
│               ├── MedicalRecords
│               │   └── useApi Hook
│               ├── AccessManagement
│               │   └── useApi Hook
│               └── SystemStatus
│                   └── useApi Hook
```

## Error Handling Flow

```
User Action
    │
    ▼
Component calls API method
    │
    ├─ Try: make request
    │
    ├─ Success: return data
    │   └─ Hook updates state
    │       └─ Component shows success
    │
    └─ Error: catch exception
        └─ Hook sets error state
            └─ Component shows error message
```

## Type Safety Chain

```
┌──────────────────────────────────────┐
│ Request Type (MintRecordRequest)     │
│ - patientAddress: 0x...              │
│ - encryptedPayload: string           │
│ - metadata?: object                  │
│ - account: 0x...                     │
└────────────┬───────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ API Client Method                    │
│ async mintRecord(                    │
│   userId: string,                    │
│   request: MintRecordRequest         │
│ ): Promise<MintRecordResponse>        │
└────────────┬───────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Response Type (MintRecordResponse)   │
│ - success: boolean                   │
│ - txHash: string                     │
│ - receipt: unknown                   │
│ - message: string                    │
└────────────┬───────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ TypeScript catches type errors       │
│ at compile time!                     │
└──────────────────────────────────────┘
```

## Summary

- **Centralized**: All configuration in `api-config.ts`
- **Flexible**: Change URL in `.env.local` only
- **Type-safe**: Full TypeScript support
- **Reusable**: Hook works in any component
- **Maintainable**: Easy to add new endpoints
- **Scalable**: Ready for growth

