import { formatAddress } from '../services/contractService'

export default function TopBar({ address, onDisconnect }) {
  return (
    <div className="w-full flex items-center justify-between gap-3 py-4">
      <div className="text-slate-200 font-extrabold tracking-tight flex items-center gap-2">
        <span className="text-2xl">🛡️</span>
        <span className="text-xl">TX Explainer</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-sm text-slate-300">
          Wallet: <span className="font-semibold text-slate-100">{formatAddress(address)}</span>
        </div>
        <button
          onClick={onDisconnect}
          className="bg-slate-200/10 text-slate-200 px-5 py-2 rounded-full hover:bg-slate-200/15 transition border border-slate-200/10"
        >
          Disconnect
        </button>
      </div>
    </div>
  )
}
