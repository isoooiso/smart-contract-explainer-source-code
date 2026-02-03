import { useMemo, useState } from 'react'
import { ethers } from 'ethers'

export default function WalletConnect({ onConnected }) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState('')
  const hasMetaMask = useMemo(() => Boolean(window.ethereum), [])

  async function connectWallet() {
    setError('')
    if (!window.ethereum) {
      alert('Please install MetaMask!')
      return
    }
    try {
      setIsConnecting(true)
      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send('eth_requestAccounts', [])
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      onConnected({ provider, signer, address })
    } catch (e) {
      setError(e?.message || 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-fuchsia-950 flex items-center justify-center px-4">
      <div className="bg-slate-900/70 border border-indigo-500/20 rounded-3xl shadow-2xl p-10 max-w-xl w-full text-center fade-in">
        <div className="text-5xl mb-4">🛡️</div>
        <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight">AI Smart Contract Explainer</h1>
        <p className="text-slate-300 mt-3">
          Paste a transaction draft (to, value, calldata). On-chain AI explains what it will do and flags risks.
        </p>

        <div className="mt-8">
          <button
            onClick={connectWallet}
            disabled={!hasMetaMask || isConnecting}
            className="w-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white px-8 py-3 rounded-full font-bold text-lg hover:shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>

          {!hasMetaMask && (
            <p className="text-sm text-amber-300 mt-3">
              MetaMask is not detected. Please install it to continue.
            </p>
          )}
          {error && <p className="text-sm text-rose-300 mt-3">{error}</p>}
        </div>

        <p className="text-xs text-slate-400 mt-8">
          This is an AI risk explainer, not a formal security audit.
        </p>
      </div>
    </div>
  )
}
