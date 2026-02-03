export default function LoadingCard({ stage }) {
  const label =
    stage === 'submitting' ? 'Submitting to chain...' :
    stage === 'judging' ? 'Analyzing transaction...' :
    'Working...'

  return (
    <div className="bg-slate-900/70 border border-indigo-500/20 rounded-3xl shadow-2xl p-8 w-full fade-in">
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-400 border-t-transparent"></div>
        <span className="ml-4 text-slate-200 font-semibold">{label}</span>
      </div>
      <p className="text-slate-400 text-sm mt-4 text-center">
        Consensus + model inference can take a moment.
      </p>
    </div>
  )
}
