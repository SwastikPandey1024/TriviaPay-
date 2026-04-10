/**
 * Single shared PeraWalletConnect instance.
 */
import { PeraWalletConnect } from '@perawallet/connect'

const peraWallet = new PeraWalletConnect({
  shouldShowSignTxnToast: true,
})

async function ensurePeraConnected() {
  try {
    const accounts = await peraWallet.reconnectSession()
    if (Array.isArray(accounts) && accounts.length > 0) {
      return accounts
    }
  } catch (err) {
    // reconnectSession may fail when there is no active session; ignore.
    console.debug('[peraWallet] reconnectSession failed:', err?.message ?? err)
  }

  const accounts = await peraWallet.connect()
  if (!Array.isArray(accounts) || accounts.length === 0) {
    throw new Error('Could not connect to Pera Wallet. Please approve the connection in the app.')
  }
  return accounts
}

const originalSignTransaction = peraWallet.signTransaction.bind(peraWallet)
peraWallet.signTransaction = async function (txnGroups) {
  if (!peraWallet.connector) {
    await ensurePeraConnected()
  }

  if (!peraWallet.connector) {
    // This should not happen, but handle gracefully.
    throw new Error('Pera Wallet connector is not available. Reconnect your wallet and try again.')
  }

  try {
    return await originalSignTransaction(txnGroups)
  } catch (err) {
    const msg = err?.message ?? String(err)
    if (msg.includes('sendCustomRequest') || msg.includes('connector') || msg.includes('null')) {
      throw new Error('Pera Wallet session expired. Please reconnect your wallet and retry the transaction.')
    }
    throw err
  }
}

export async function peraConnect() {
  return ensurePeraConnected()
}

export default peraWallet
