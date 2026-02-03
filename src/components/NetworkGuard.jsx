const GENLAYER_CHAIN_ID = 61999
const GENLAYER_PARAMS = {
  chainId: '0xF23F',
  chainName: 'GenLayer Studio',
  nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
  rpcUrls: ['https://studio.genlayer.com/api'],
  blockExplorerUrls: []
}

export default function NetworkGuard() {
  async function addOrSwitch() {
    if (!window.ethereum) {
      alert('Please install MetaMask!')
      return
    }

    try {
      const current = await window.ethereum.request({ method: 'eth_chainId' })
      if (parseInt(current, 16) === GENLAYER_CHAIN_ID) return

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: GENLAYER_PARAMS.chainId }]
        })
      } catch (e) {
        if (e?.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [GENLAYER_PARAMS]
          })
        } else {
          throw e
        }
      }
    } catch (e) {
      alert(e?.message || 'Failed to switch network')
    }
  }

  return (
    <div className="bg-slate-900/60 border border-indigo-500/15 rounded-2xl p-4 text-sm text-slate-200 fade-in">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold">Network</div>
          <div className="text-slate-400">
            Switch MetaMask to GenLayer Studio (Chain ID 61999) to submit explanations on-chain.
          </div>
        </div>
        <button
          onClick={addOrSwitch}
          className="bg-slate-200/10 text-slate-200 px-5 py-2 rounded-full hover:bg-slate-200/15 transition border border-slate-200/10 whitespace-nowrap"
        >
          Switch Network
        </button>
      </div>
    </div>
  )
}
