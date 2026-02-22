export interface MetaMaskProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  on: (event: string, listener: (...args: unknown[]) => void) => void
  removeListener: (event: string, listener: (...args: unknown[]) => void) => void
  isConnected: () => boolean
  isMetaMask?: boolean
}

declare global {
  interface Window {
    ethereum?: MetaMaskProvider
  }
}
