export function patchMetaMaskFillTransaction() {
  if (!window.ethereum?.request) return
  const originalRequest = window.ethereum.request.bind(window.ethereum)

  window.ethereum.request = async (payload) => {
    if (payload?.method === 'eth_fillTransaction') {
      const tx = payload?.params?.[0] ? { ...payload.params[0] } : {}
      if (!tx.from) {
        try {
          const accounts = await originalRequest({ method: 'eth_accounts' })
          if (accounts?.[0]) tx.from = accounts[0]
        } catch {}
      }
      return tx
    }
    return originalRequest(payload)
  }
}
