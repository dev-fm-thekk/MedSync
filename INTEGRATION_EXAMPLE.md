# Integration Example: Adding API Components to Patient Dashboard

This guide shows how to integrate the API components into your existing patient dashboard.

## Step 1: Update Patient Dashboard

Edit `components/patient/patient-dashboard.tsx` to include the API components:

```tsx
"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { MedicalRecords } from "@/components/medical-records"
import { AccessManagement } from "@/components/access-management"
import { SystemStatus } from "@/components/system-status"
import { PatientSidebar } from "./patient-sidebar"

export function PatientDashboard() {
  const { user } = useAuth()
  const [selectedView, setSelectedView] = useState<"overview" | "records" | "access" | "status">(
    "overview"
  )

  return (
    <div className="flex h-screen">
      <PatientSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="space-y-6 p-6">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
            <p className="text-gray-600">Manage your medical records securely</p>
          </div>

          <div className="space-y-6">
            {selectedView === "overview" && (
              <>
                <SystemStatus />
                <div className="grid grid-cols-2 gap-6">
                  <button
                    onClick={() => setSelectedView("records")}
                    className="rounded-lg border p-6 hover:bg-gray-50"
                  >
                    <h3 className="font-semibold">Medical Records</h3>
                    <p className="text-sm text-gray-600">Mint and manage your records</p>
                  </button>
                  <button
                    onClick={() => setSelectedView("access")}
                    className="rounded-lg border p-6 hover:bg-gray-50"
                  >
                    <h3 className="font-semibold">Access Control</h3>
                    <p className="text-sm text-gray-600">Grant access to doctors</p>
                  </button>
                </div>
              </>
            )}

            {selectedView === "records" && (
              <>
                <button
                  onClick={() => setSelectedView("overview")}
                  className="text-sm text-blue-600 hover:underline"
                >
                  ← Back
                </button>
                <MedicalRecords />
              </>
            )}

            {selectedView === "access" && (
              <>
                <button
                  onClick={() => setSelectedView("overview")}
                  className="text-sm text-blue-600 hover:underline"
                >
                  ← Back
                </button>
                <AccessManagement />
              </>
            )}

            {selectedView === "status" && (
              <>
                <button
                  onClick={() => setSelectedView("overview")}
                  className="text-sm text-blue-600 hover:underline"
                >
                  ← Back
                </button>
                <SystemStatus />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

## Step 2: Update Patient Sidebar

Add navigation items to `components/patient/patient-sidebar.tsx`:

```tsx
import { FileText, Share2, Activity } from "lucide-react"

// Inside the navigation section, add:
<Button
  variant={selectedView === "records" ? "default" : "ghost"}
  className="w-full justify-start"
  onClick={() => setSelectedView("records")}
>
  <FileText className="mr-2 h-4 w-4" />
  My Records
</Button>

<Button
  variant={selectedView === "access" ? "default" : "ghost"}
  className="w-full justify-start"
  onClick={() => setSelectedView("access")}
>
  <Share2 className="mr-2 h-4 w-4" />
  Access Control
</Button>

<Button
  variant={selectedView === "status" ? "default" : "ghost"}
  className="w-full justify-start"
  onClick={() => setSelectedView("status")}
>
  <Activity className="mr-2 h-4 w-4" />
  System Status
</Button>
```

## Step 3: Configure Backend URL

Create `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## Step 4: Test

1. Start your backend server:
   ```bash
   cd backend
   npm start  # or your start command
   ```

2. Start the frontend:
   ```bash
   npm run dev
   ```

3. Visit `http://localhost:3000`

4. Connect wallet and navigate to Medical Records

## API Flow Example

When a user clicks "New Record" in the MedicalRecords component:

```
1. User fills form and clicks "Mint Record"
   ↓
2. Component calls mintRecord(userId, data)
   ↓
3. Hook calls apiClient.mintRecord()
   ↓
4. API Client creates fetch request with:
   - Base URL: NEXT_PUBLIC_API_BASE_URL (http://localhost:3001)
   - Endpoint: /v1/records/{userId}/mint
   - Full URL: http://localhost:3001/v1/records/{userId}/mint
   ↓
5. Backend receives request and processes
   ↓
6. Response returned to component
   ↓
7. UI shows success or error message
```

## Changing Backend URL

To connect to a different server, just update `.env.local`:

```bash
# Development
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# Staging
NEXT_PUBLIC_API_BASE_URL=https://staging-api.medvault.com

# Production  
NEXT_PUBLIC_API_BASE_URL=https://api.medvault.com
```

**No code changes needed!**

## Custom Integration

If you want to integrate the API differently:

```tsx
import useApi from '@/hooks/use-api'
import { useAuth } from '@/lib/auth-context'

export function CustomComponent() {
  const { user, walletAddress } = useAuth()
  const { mintRecord, mint } = useApi()

  const handleClick = async () => {
    try {
      const result = await mintRecord(user.id, {
        patientAddress: walletAddress as `0x${string}`,
        encryptedPayload: "your-data",
        account: walletAddress as `0x${string}`,
      })
      console.log('Success:', result.txHash)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <button onClick={handleClick} disabled={mint.isLoading}>
      {mint.isLoading ? 'Loading...' : 'Submit'}
    </button>
  )
}
```

## Error Handling

All components have built-in error handling:

```tsx
// In MedicalRecords component
{mint.error && <div className="text-red-600">{mint.error}</div>}

// In useApi hook
if (grantAccessState.error) {
  return <div className="text-red-600">{grantAccessState.error}</div>
}
```

## Authentication

Set authentication after user login:

```tsx
import useApi from '@/hooks/use-api'

function LoginPage() {
  const { setAuthToken } = useApi()

  const handleLogin = async (credentials) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    const { token } = await response.json()
    setAuthToken(token) // Now all future requests include the token
  }
}
```

## Complete Integration Checklist

- [ ] `.env.local` created with `NEXT_PUBLIC_API_BASE_URL`
- [ ] Backend server running and accessible
- [ ] Components imported into dashboard
- [ ] Sidebar navigation updated
- [ ] Tested mint functionality
- [ ] Tested grant access functionality
- [ ] Tested system status endpoint
- [ ] Verified CORS is configured on backend
- [ ] Set up authentication if needed
- [ ] Tested with different backend URL (staging/production)

