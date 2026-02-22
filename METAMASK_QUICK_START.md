# MetaMask Integration - Quick Start

## Setup (No Environment Variables Needed!)

MetaMask works directly with the browser extension - no backend configuration required.

## Key Files Changed

1. **lib/auth-context.tsx** - Complete rewrite
   - Old: Privy hooks for email/OTP
   - New: ethers.js + MetaMask window.ethereum

2. **components/login-page.tsx** - Simplified
   - Old: Email input + OTP verification
   - New: Single "Connect MetaMask" button

3. **components/wallet-details.tsx** - Updated
   - Old: Mock balance from Privy
   - New: Real balance from blockchain RPC

4. **app/providers.tsx** - Cleaned up
   - Removed: PrivyProvider wrapper
   - New: Just AuthProvider

5. **app/page.tsx** - Updated routing
   - Old: usePrivy hook
   - New: useAuth hook

## Authentication Flow

```
User → "Connect MetaMask" → MetaMask Popup → Approve → Wallet Connected
                                                            ↓
                                                    Save to localStorage
                                                            ↓
                                                    Render Dashboard
```

## Using useAuth in Components

```tsx
import { useAuth } from "@/lib/auth-context"

export function MyComponent() {
  const { 
    user,              // { id, name, email, role, walletAddress }
    isAuthenticated,   // true/false
    isLoading,         // Loading state
    connectWallet,     // async () => void
    logout,            // () => void
    walletAddress,     // "0x..."
    chainId,           // 1, 137, etc
  } = useAuth()

  if (isLoading) return <Spinner />
  if (!isAuthenticated) return <LoginPage />
  
  return <div>Connected: {walletAddress}</div>
}
```

## Session Persistence

Wallet address is automatically saved to localStorage:
- Key: `medsync_wallet_address`
- Persists across page refreshes
- Clears on logout or account switch

## Wallet Details Modal

Click the wallet button in the header/sidebar to see:
- Wallet Address (with copy button)
- Wallet ID
- Network Name (Ethereum, Polygon, etc)
- Balance in ETH (fetched from blockchain)
- Link to Etherscan

## Testing Checklist

- [ ] MetaMask extension installed
- [ ] Click "Connect MetaMask" on login
- [ ] See wallet address in sidebar
- [ ] Click wallet button to open modal
- [ ] See balance display
- [ ] Test disconnect/logout
- [ ] Test reconnect

## Common Issues

| Issue | Solution |
|-------|----------|
| MetaMask not detected | Install the extension, refresh page |
| Balance showing as 0 | Account may not have ETH on this chain |
| Session lost on refresh | Check localStorage is enabled |
| Account mismatch error | Switch back to the original MetaMask account |

## Type Support

MetaMask types are declared in `types/metamask.d.ts`:

```ts
declare global {
  interface Window {
    ethereum?: MetaMaskProvider
  }
}
```

## Advanced Usage

### Getting balance programmatically
```tsx
const { walletAddress } = useAuth()

useEffect(() => {
  if (!walletAddress) return
  
  const provider = new BrowserProvider(window.ethereum)
  const balance = await provider.getBalance(walletAddress)
  console.log(formatEther(balance))
}, [walletAddress])
```

### Listening for account changes
The useAuth hook handles this automatically via event listeners.

### Switching networks
Users can switch networks in MetaMask UI directly - the app detects it via `chainChanged` event.

## Next Steps

1. Test the MetaMask flow
2. Add network selection UI if needed
3. Implement transaction signing
4. Add smart contract integration
5. Deploy to production

## Support

For MetaMask issues, visit: https://support.metamask.io/
