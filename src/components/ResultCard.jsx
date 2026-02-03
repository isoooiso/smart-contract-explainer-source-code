import { useState } from 'react'
import { getLastDebug } from '../services/contractService'

function RiskPill({ level }) {
  const l = String(level || 'UNKNOWN').toUpperCase()
  const map = {
    LOW: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/20',
    MEDIUM: 'bg-amber-500/15 text-amber-200 border-amber-400/20',
    HIGH: 'bg-rose-500/15 text-rose-200 border-rose-400/20',
    UNKNOWN: 'bg-slate-200/10 text-slate-200 border-slate-200/10'
  }
  const cls = map[l] || map.UNKNOWN
  return <span className={`text-xs px-3 py-1 rounded-full border ${cls}`}>{l}</span>
}

export default function ResultCard({ result, walletAddress, onNew }) {
  const [debug, setDebug] = useState(null)
  const [debugLoading, setDebugLoading] = useState(false)

  async function loadDebug() {
    try {
      setDebugLoading(true)
      const d = await getLastDebug(walletAddress)
      setDebug(d)
    } finally {
      setDebugLoading(false)
    }
  }

  const mode = result?.fallback ? 'Fallback' : 'On-chain AI'
  const risk = result?.risk_level || 'UNKNOWN'
  const shareText = [
    'TX Explainer',
    `AI Mode: ${mode}`,
    `Risk: ${risk}`,
    '',
    'Actions:',
    ...(Array.isArray(result?.actions) ? result.actions : []),
    '',
    'Warnings:',
    ...(Array.isArray(result?.warnings) ? result.warnings : []),
    '',
    'Recommendation:',
    String(result?.recommendation || '')
  ].join('\n')

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareText)
      alert('Copied to clipboard!')
    } catch {
      alert('Failed to copy')
    }
  }

  return (
    <div className="bg-slate-900/70 border border-indigo-500/20 rounded-3xl shadow-2xl p-8 w-full fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Explanation</h2>
          <div className="mt-1 text-xs text-slate-400">
            AI Mode: <span className="text-slate-200 font-semibold">{mode}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-slate-300 text-sm">Risk</div>
          <RiskPill level={risk} />
        </div>
      </div>

      <div className="mt-5 bg-slate-950/35 border border-indigo-500/10 rounded-2xl p-5">
        <div className="text-sm text-slate-300 font-semibold">Plain-English summary</div>
        <div className="mt-2 text-slate-100 whitespace-pre-wrap leading-relaxed">
          {String(result?.summary || '—')}
        </div>

        {Array.isArray(result?.actions) && result.actions.length > 0 && (
          <div className="mt-4">
            <div className="text-sm text-slate-300 font-semibold">What it will do</div>
            <ul className="mt-2 space-y-1 text-slate-100">
              {result.actions.slice(0, 6).map((it, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-indigo-300">•</span>
                  <span className="leading-relaxed">{String(it)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {Array.isArray(result?.warnings) && result.warnings.length > 0 && (
          <div className="mt-4">
            <div className="text-sm text-slate-300 font-semibold">Warnings</div>
            <ul className="mt-2 space-y-1 text-slate-100">
              {result.warnings.slice(0, 6).map((it, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-rose-300">⚠</span>
                  <span className="leading-relaxed">{String(it)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4">
          <div className="text-sm text-slate-300 font-semibold">Recommendation</div>
          <div className="mt-2 text-slate-100 whitespace-pre-wrap leading-relaxed">
            {String(result?.recommendation || '—')}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={copy}
            className="bg-slate-200/10 text-slate-200 px-6 py-2 rounded-full hover:bg-slate-200/15 transition border border-slate-200/10"
          >
            Share 📤
          </button>
          <button
            onClick={onNew}
            className="bg-slate-200/10 text-slate-200 px-6 py-2 rounded-full hover:bg-slate-200/15 transition border border-slate-200/10"
          >
            New ↻
          </button>
        </div>

        {result?.fallback && (
          <div className="mt-4">
            <button
              onClick={loadDebug}
              disabled={debugLoading}
              className="bg-slate-200/10 text-slate-200 px-5 py-2 rounded-full hover:bg-slate-200/15 transition border border-slate-200/10 disabled:opacity-60"
            >
              {debugLoading ? 'Loading debug…' : 'Show debug'}
            </button>

            {debug && (
              <div className="mt-3 text-xs text-slate-300 bg-slate-950/40 border border-indigo-500/10 rounded-2xl p-4 whitespace-pre-wrap">
                <div className="text-slate-400">eq:</div>
                <div className="text-slate-200">{String(debug.eq ?? '')}</div>
                <div className="mt-3 text-slate-400">error:</div>
                <div className="text-rose-300">{String(debug.error ?? '')}</div>
                <div className="mt-3 text-slate-400">raw:</div>
                <div className="text-slate-200">{String(debug.raw ?? '')}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-center text-xs text-slate-500 mt-6">
        This is an AI explainer, not a security audit. Always verify and trust your sources.
      </div>
    </div>
  )
}
