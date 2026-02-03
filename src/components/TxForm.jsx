import { useMemo, useState } from 'react'
import { ethers } from 'ethers'
import { tryDecodeCalldata } from '../services/txDecoder'

export default function TxForm({ onSubmit, disabled }) {
  const [to, setTo] = useState('')
  const [valueEth, setValueEth] = useState('0')
  const [data, setData] = useState('0x')
  const [chainHint, setChainHint] = useState('GenLayer Studio')

  const decoded = useMemo(() => tryDecodeCalldata(data), [data])

  function validate() {
    if (!ethers.isAddress(to)) {
      alert('Please provide a valid "to" address.')
      return false
    }
    const d = String(data || '0x')
    if (!d.startsWith('0x')) {
      alert('Calldata must start with 0x.')
      return false
    }
    return true
  }

  function handleSubmit() {
    if (!validate()) return
    let valueWei = 0n
    try {
      valueWei = ethers.parseEther(String(valueEth || '0'))
    } catch {
      alert('Invalid ETH value.')
      return
    }
    onSubmit({ to, data, valueWei, chainHint })
  }

  return (
    <div className="bg-slate-900/70 border border-indigo-500/20 rounded-3xl shadow-2xl p-8 w-full fade-in">
      <h2 className="text-xl font-bold text-slate-100">Paste transaction draft</h2>
      <p className="text-slate-300 text-sm mt-2">
        This tool explains intent and risk before you sign. It does not execute the transaction.
      </p>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className="text-xs text-slate-400 mb-2">To</div>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full p-4 border-2 border-indigo-500/20 bg-slate-950/40 text-slate-100 rounded-2xl focus:border-indigo-400 focus:outline-none transition"
            placeholder="0x..."
            disabled={disabled}
          />
        </div>

        <div>
          <div className="text-xs text-slate-400 mb-2">Value (ETH)</div>
          <input
            value={valueEth}
            onChange={(e) => setValueEth(e.target.value)}
            className="w-full p-4 border-2 border-indigo-500/20 bg-slate-950/40 text-slate-100 rounded-2xl focus:border-indigo-400 focus:outline-none transition"
            placeholder="0.0"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs text-slate-400 mb-2">Calldata</div>
        <textarea
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="w-full p-4 border-2 border-indigo-500/20 bg-slate-950/40 text-slate-100 rounded-2xl h-36 resize-none focus:border-indigo-400 focus:outline-none transition"
          placeholder="0x..."
          disabled={disabled}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className="text-xs text-slate-400 mb-2">Chain hint (optional)</div>
          <input
            value={chainHint}
            onChange={(e) => setChainHint(e.target.value)}
            className="w-full p-4 border-2 border-indigo-500/20 bg-slate-950/40 text-slate-100 rounded-2xl focus:border-indigo-400 focus:outline-none transition"
            placeholder="Ethereum / Base / Polygon..."
            disabled={disabled}
          />
        </div>

        <div className="bg-slate-950/35 border border-indigo-500/10 rounded-2xl p-4">
          <div className="text-xs text-slate-400">Quick decode</div>
          <div className="mt-1 text-slate-100 font-semibold text-sm">
            {decoded ? `${decoded.family}: ${decoded.name}` : 'Unknown'}
          </div>
          <div className="mt-1 text-xs text-slate-400 break-all">
            {decoded ? decoded.args.join(' , ') : 'Tip: ERC20 approve/transfer can be decoded locally'}
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={disabled}
        className="mt-6 w-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white px-8 py-3 rounded-full font-bold text-lg hover:shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
      >
        Explain & Risk-Check ✨
      </button>
    </div>
  )
}
