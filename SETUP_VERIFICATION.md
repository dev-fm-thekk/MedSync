# Setup Verification Checklist

Use this checklist to verify your API integration is complete and working.

## Files Verification

### Core API Files
- [ ] `lib/api-config.ts` exists
- [ ] `lib/api-client.ts` exists
- [ ] `hooks/use-api.ts` exists

### UI Components
- [ ] `components/medical-records.tsx` exists
- [ ] `components/access-management.tsx` exists
- [ ] `components/system-status.tsx` exists

### Configuration
- [ ] `.env.example` exists
- [ ] Created `.env.local` in project root

### Documentation
- [ ] `API_INDEX.md` exists
- [ ] `API_SETUP_QUICK_START.md` exists
- [ ] `API_INTEGRATION.md` exists
- [ ] `INTEGRATION_EXAMPLE.md` exists
- [ ] `API_ARCHITECTURE.md` exists
- [ ] `API_SUMMARY.md` exists
- [ ] `API_FILES_CREATED.md` exists

## Configuration Verification

### .env.local
```bash
# Check that .env.local contains:
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
# (or your backend URL)
```

- [ ] `.env.local` file created
- [ ] `NEXT_PUBLIC_API_BASE_URL` set
- [ ] Backend URL is accessible

### Verify Environment Variable
Run in terminal:
```bash
# Should show your backend URL
grep "NEXT_PUBLIC_API_BASE_URL" .env.local
```

- [ ] Command shows correct URL

## Code Verification

### Import Paths
Verify these imports work:

```typescript
// Should work
import apiConfig from '@/lib/api-config'
import apiClient from '@/lib/api-client'
import useApi from '@/hooks/use-api'
import { MedicalRecords } from '@/components/medical-records'
import { AccessManagement } from '@/components/access-management'
import { SystemStatus } from '@/components/system-status'
```

- [ ] All imports resolve without errors
- [ ] No TypeScript errors in IDE

### Component Usage
Create a test file:

```tsx
import { MedicalRecords } from '@/components/medical-records'

export default function Test() {
  return <MedicalRecords />
}
```

- [ ] Component renders without errors
- [ ] No console errors in browser

## Backend Verification

### Server Running
```bash
# Verify backend is running
curl http://localhost:3001/v1/system/status
# Should return status response
```

- [ ] Backend server is running
- [ ] Server is accessible at configured URL
- [ ] /v1/system/status endpoint works

### CORS Configuration
Check that backend allows requests from frontend:

```javascript
// Backend should have CORS configured
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true
}))
```

- [ ] CORS headers present
- [ ] Frontend domain allowed
- [ ] No CORS errors in browser

## Functionality Verification

### System Status Component
```tsx
import { SystemStatus } from '@/components/system-status'

export default function Test() {
  return <SystemStatus />
}
```

Test:
- [ ] Component loads
- [ ] Displays system status
- [ ] Shows chain/IPFS/contract status
- [ ] Refresh button works

### Medical Records Component
```tsx
import { MedicalRecords } from '@/components/medical-records'
import { useAuth } from '@/lib/auth-context'

export default function Test() {
  const { user } = useAuth()
  
  if (!user) return <div>Connect wallet first</div>
  
  return <MedicalRecords />
}
```

Test (with wallet connected):
- [ ] Component loads
- [ ] "New Record" button appears
- [ ] Dialog opens
- [ ] Form fields appear
- [ ] Can fill in data
- [ ] Submit button works

### Access Management Component
```tsx
import { AccessManagement } from '@/components/access-management'
import { useAuth } from '@/lib/auth-context'

export default function Test() {
  const { user } = useAuth()
  
  if (!user) return <div>Connect wallet first</div>
  
  return <AccessManagement />
}
```

Test (with wallet connected):
- [ ] Component loads
- [ ] "Grant Access" button appears
- [ ] Dialog opens
- [ ] Form fields appear
- [ ] Can fill in data
- [ ] Submit button works

## Browser Console Verification

Connect wallet and perform an API call. Check console for:

```
[v0] Mint record successful: {...}
[v0] Grant access successful: {...}
[v0] System status: {...}
```

- [ ] No console errors
- [ ] API calls log with `[v0]` prefix
- [ ] Responses contain expected data
- [ ] No network 404/500 errors

## TypeScript Verification

Run TypeScript check:
```bash
npm run build
# or
tsc --noEmit
```

- [ ] No TypeScript errors
- [ ] All types are correct
- [ ] No import errors

## npm Dependencies

Verify no new dependencies needed:
```bash
npm list | grep -E "(api|ethers|react)"
```

All existing dependencies should be used:
- [ ] ethers (for blockchain)
- [ ] react (for components)
- [ ] react-dom (for DOM)
- [ ] @radix-ui components (for UI)

## Network Requests Verification

Open DevTools Network tab and:

1. Mint a record
   - [ ] POST to `/v1/records/{userId}/mint`
   - [ ] Status 200
   - [ ] Response has txHash

2. Grant access
   - [ ] POST to `/v1/records/access/{userId}/grant`
   - [ ] Status 200
   - [ ] Response has txHash

3. Get system status
   - [ ] GET to `/v1/system/status`
   - [ ] Status 200
   - [ ] Response has chain, ipfs, contract

## Performance Verification

Check DevTools Performance:

- [ ] Initial load < 3 seconds
- [ ] API calls < 2 seconds
- [ ] No memory leaks
- [ ] Smooth animations

## Security Verification

- [ ] API_BASE_URL uses HTTPS in production
- [ ] No sensitive data in localStorage
- [ ] Authentication tokens are secure
- [ ] CORS properly configured
- [ ] No console errors about security

## Production Checklist

Before deploying to production:

```bash
# Update .env.production
NEXT_PUBLIC_API_BASE_URL=https://your-backend.com
```

- [ ] Updated backend URL for production
- [ ] Verified production backend is running
- [ ] CORS configured for production domain
- [ ] SSL certificate valid
- [ ] Database migrations complete
- [ ] Smart contract deployed
- [ ] IPFS access configured
- [ ] Backups in place
- [ ] Monitoring set up

## Rollback Plan

If something goes wrong:

1. Revert `.env.local` to previous URL
2. Check backend logs for errors
3. Clear browser cache/localStorage
4. Restart backend server
5. Review documentation

- [ ] Have backup of previous `.env.local`
- [ ] Know how to restart backend
- [ ] Can check backend logs
- [ ] Have monitoring/alerts set up

## Success Criteria

If all boxes are checked:
✅ API integration is complete and working
✅ Backend communication verified
✅ UI components functioning
✅ Error handling in place
✅ Ready for development/production

## Troubleshooting

If something isn't working:

### Component doesn't load
- [ ] Check all imports are correct
- [ ] Verify file paths
- [ ] Check TypeScript errors
- [ ] Review browser console

### API calls fail
- [ ] Check backend is running
- [ ] Verify `NEXT_PUBLIC_API_BASE_URL`
- [ ] Check CORS configuration
- [ ] Review network tab
- [ ] Check backend logs

### Types errors
- [ ] Verify api-client.ts types
- [ ] Check hook return types
- [ ] Review component prop types

### Environment variable not working
- [ ] Restart dev server
- [ ] Verify `.env.local` syntax
- [ ] Check file exists in root
- [ ] Ensure variable name is correct

## Support

If you're stuck:

1. Check API_SETUP_QUICK_START.md
2. Check INTEGRATION_EXAMPLE.md
3. Review API_INTEGRATION.md troubleshooting section
4. Check browser console for errors
5. Check backend logs
6. Review this checklist

## Final Verification

Run this command to test everything:

```bash
# Should show your backend URL
echo "Backend: $NEXT_PUBLIC_API_BASE_URL"

# Start dev server
npm run dev

# Visit http://localhost:3000
# Check console for [v0] logs
# Try each component
```

✅ **All verified!** Your API integration is ready to use.

