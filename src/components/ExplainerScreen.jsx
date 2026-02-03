import { useState } from 'react'
import TopBar from './TopBar'
import NetworkGuard from './NetworkGuard'
import TxForm from './TxForm'
import LoadingCard from './LoadingCard'
import ResultCard from './ResultCard'
import { explainTransaction } from '../services/contractService'

export default function ExplainerScreen({ walletAddress, onDisconnect }) {
  const [isLoading, setIsLoading] = useState(false)
  const [stage, setStage] = useState('submitting')
  const [result, setResult] = useState(null)

  async function handleSubmit(tx) {
    setResult(null)
    setIsLoading(true)
    setStage('submitting')

    try {
      setStage('judging')
      const res = await explainTransaction(walletAddress, tx)
      setResult(res)
    } catch (e) {
      alert(e?.message || 'Failed to explain transaction')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-fuchsia-950 px-4">
      <div className="max-w-4xl mx-auto">
        <TopBar address={walletAddress} onDisconnect={onDisconnect} />

        <div className="pb-10">
          <div className="text-center mt-2 mb-6">
            <h1 className="text-4xl font-extrabold text-slate-50 tracking-tight">
              Explain before you sign 🛡️
            </h1>
            <p className="text-slate-300 mt-3">
              On-chain AI explains transaction intent and flags risky patterns like approvals and drains.
            </p>
          </div>

          <div className="space-y-6">
            <NetworkGuard />

            {!result && !isLoading && <TxForm onSubmit={handleSubmit} disabled={isLoading} />}

            {isLoading && <LoadingCard stage={stage} />}

            {result && !isLoading && (
              <ResultCard result={result} walletAddress={walletAddress} onNew={() => setResult(null)} />
            )}
          </div>

          <div className="text-center text-xs text-slate-500 mt-10 pb-6">
            Built for the GenLayer ecosystem.
          </div>
        </div>
      </div>
    </div>
  )
}
