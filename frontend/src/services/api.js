const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://vlpt1123-4001.inc1.devtunnels.ms'

export async function getVendors() {
  const res = await fetch(`${API_BASE}/api/vendors`)
  if (!res.ok) throw new Error('Failed to load vendors')
  const json = await res.json()
  if (!json.ok) throw new Error(json.error || 'Failed to load vendors')
  return json.vendors
}

export async function registerUser(payload) {
  const res = await fetch(`${API_BASE}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  if (!res.ok || !json.ok) throw new Error(json.error || 'Register failed')
  return json.user
}

export async function loginUser(payload) {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  if (!res.ok || !json.ok) throw new Error(json.error || 'Login failed')
  return json.user
}

export async function fraudCheck({ studentWallet, vendorId, amount }) {
  const res = await fetch(`${API_BASE}/api/fraud-check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentWallet, vendorId, amount }),
  })
  const json = await res.json()
  if (!res.ok || !json.ok) {
    throw new Error(json.reason || json.error || 'Fraud check failed')
  }
  return json
}

export async function saveTransaction(tx) {
  const res = await fetch(`${API_BASE}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tx),
  })
  const json = await res.json()
  if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to save transaction')
  return json.transaction
}

export function getSseUpdates(onTransaction) {
  const url = `${API_BASE}/events`
  const es = new EventSource(url)
  es.addEventListener('transaction', (event) => {
    try {
      const data = JSON.parse(event.data)
      onTransaction(data)
    } catch {
      // ignore
    }
  })
  es.onerror = () => {
    // reconnect is automatic in browsers
  }
  return es
}
