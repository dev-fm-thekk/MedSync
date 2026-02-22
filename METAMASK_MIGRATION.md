# MetaMask Integration Migration Guide

## Overview
This document describes the migration from Privy authentication to MetaMask wallet-based authentication in MedSync.

## What Changed

### Removed
- `@privy-io/react-auth` dependency and PrivyProvider
- Email + OTP login flow
- Privy's `usePrivy`, `useWallets`, `useLoginWithEmail` hooks

### Added
- Direct MetaMask integration using `ethers.js`
- Wallet-based authentication (connect MetaMask wallet)
- Real blockchain balance fetching
- localStorage-based session persistence

## Architecture

### Auth Flow
1. User clicks "Connect MetaMask" button
2. MetaMask popup appears requesting account access
3. User approves connection
4. Wallet address is saved to localStorage
5. App initializes with authenticated user state
6. User is routed to appropriate dashboard (patient/doctor)

### File Structure
```
lib/
  auth-context.tsx          # Main auth provider (replaced Privy)
  
types/
  metamask.d.ts            # MetaMask type declarations
  
components/
  wallet-details.tsx       # Wallet info display with real balance
  login-page.tsx          # MetaMask connect button
  
hooks/
  use-medsync-auth.ts     # Deprecated - use useAuth() instead
```

## Key Components

### useAuth Hook
The main hook for accessing authentication state:

```tsx
import { useAuth } from "@/lib/auth-context"

export function MyComponent() {
  const { 
    user,              // Current user object
    isAuthenticated,   // Boolean auth state
    isLoading,         // Loading state
    connectWallet,     // Function to connect MetaMask
    logout,            // Function to disconnect
    walletAddress,     // Current wallet address
    chainId,           // Current chain ID
  } = useAuth()
  
  return <div>{user?.walletAddress}</div>
}
```

### WalletDetails Component
Displays wallet information in a modal:
- Wallet address (with copy button)
- Wallet ID
- Network/Chain
- Balance (fetched from blockchain)

## Environment Variables
No environment variables required for MetaMask! It works with the browser extension.

## Session Persistence
- Wallet address is saved to `localStorage` with key `medsync_wallet_address`
- User role is saved to `localStorage` with key `medsync_user_role`
- Session persists across page refreshes
- Clears when user disconnects or changes wallet

## Event Listeners
The auth context listens for MetaMask events:
- `accountsChanged` - User switched wallet account
- `chainChanged` - User switched blockchain network
- `disconnect` - User disconnected MetaMask

## Balance Fetching
Real ETH balance is fetched using:
```tsx
const provider = new BrowserProvider(window.ethereum)
const balance = await provider.getBalance(walletAddress)
const formattedBalance = formatEther(balance)
```

## Migration Checklist
- [x] Remove Privy dependencies
- [x] Replace auth context with MetaMask
- [x] Update login page to use "Connect MetaMask"
- [x] Update wallet details component
- [x] Fix all auth references
- [x] Add MetaMask type declarations
- [x] Remove old hooks

## Testing
1. Install MetaMask extension if not already installed
2. Click "Connect MetaMask" on login page
3. Approve the connection request
4. Verify wallet address displays in sidebar/header
5. Click wallet button to see details modal
6. Test disconnect and re-connect

## Troubleshooting

### "MetaMask is not installed"
- Install MetaMask extension for your browser
- Refresh the page

### Wallet not persisting
- Check browser localStorage is enabled
- Check `medsync_wallet_address` key in localStorage

### Balance showing zero
- Ensure account has some ETH on the network
- Check account has received funds on current chain

### Account mismatch error
- You switched MetaMask accounts - please disconnect and reconnect
- This is a security feature to prevent unauthorized access

## Next Steps
1. Test the MetaMask connection flow thoroughly
2. Consider adding network switching UI
3. Add transaction signing for medical data verification
4. Implement smart contract integration for data storage
