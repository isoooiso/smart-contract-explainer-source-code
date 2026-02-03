import { ethers } from 'ethers'

const ERC20_IFACE = new ethers.Interface([
  'function approve(address spender, uint256 value)',
  'function transfer(address to, uint256 value)',
  'function transferFrom(address from, address to, uint256 value)'
])

export function tryDecodeCalldata(data) {
  const hex = String(data || '')
  if (!hex || hex === '0x' || hex.length < 10) return null
  try {
    const parsed = ERC20_IFACE.parseTransaction({ data: hex })
    return {
      family: 'ERC20',
      name: parsed.name,
      args: parsed.args?.map((x) => (typeof x === 'bigint' ? x.toString() : String(x))) || []
    }
  } catch {
    return null
  }
}

export function formatEthFromWei(valueWei) {
  try {
    return ethers.formatEther(BigInt(valueWei || 0))
  } catch {
    return '0'
  }
}
