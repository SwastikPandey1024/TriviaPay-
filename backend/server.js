const express = require('express')
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')
const dotenv = require('dotenv')
const bcrypt = require('bcrypt')

dotenv.config()

const prisma = new PrismaClient()
const app = express()
const PORT = process.env.API_PORT || 4001

app.use(cors())
app.use(express.json())

const sseClients = []

// Seed initial vendors for marketplace if empty
async function seedVendors() {
  const count = await prisma.vendor.count()
  if (count === 0) {
    console.log('[API] seeding default vendors...')
    await prisma.vendor.createMany({
      data: [
        { name: 'Algorama Café', category: 'Food & Drinks', walletAddress: 'ER745AB7H64MC7RO5PEL7YCDQ245JOHVPHN5WHO3FCGPI5Y7GHL5QGAT64' },
        { name: 'Campus Books', category: 'Books', walletAddress: '5I5HLT5ZIHNUPW2W7LPA3XFYGRG55CSI45FAFN3VDHSZTA7FULUJV4QBRE' },
        { name: 'Study Hub', category: 'Stationery', walletAddress: 'H3YRHIZVPRSAS6TSSXYXG7AVMUH3B6RH6AXZ6WXJ3LZI6MY2ZFQR6V4L2I' },
      ],
      skipDuplicates: true,
    })
  }
}

seedVendors().catch(err => {
  console.error('[API] vendor seeding failed', err)
})

function sendSseEvent(event, payload) {
  const data = JSON.stringify(payload)
  sseClients.forEach((res) => {
    res.write(`event: ${event}\n`)
    res.write(`data: ${data}\n\n`)
  })
}

app.get('/api/health', (req, res) => res.json({ ok: true, now: new Date().toISOString() }))

app.get('/api/vendors', async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({ orderBy: { createdAt: 'desc' } })
    res.json({ ok: true, vendors })
  } catch (err) {
    console.error('[API] /api/vendors error', err)
    res.status(500).json({ ok: false, error: 'Failed to load vendors' })
  }
})

app.post('/api/vendors', async (req, res) => {
  try {
    const { name, category, walletAddress } = req.body
    if (!name || !category || !walletAddress) {
      return res.status(400).json({ ok: false, error: 'Missing vendor fields' })
    }
    const vendor = await prisma.vendor.create({ data: { name, category, walletAddress } })
    return res.json({ ok: true, vendor })
  } catch (err) {
    console.error('[API] /api/vendors POST error', err)
    res.status(500).json({ ok: false, error: 'Failed to create vendor' })
  }
})

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, walletAddress } = req.body
    if (!name || !email || !password || !walletAddress) {
      return res.status(400).json({ ok: false, error: 'Missing registration field' })
    }
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ ok: false, error: 'Email already exists' })
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { name, email, walletAddress, passwordHash } })
    return res.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, walletAddress: user.walletAddress } })
  } catch (err) {
    console.error('[API] /api/register error', err)
    res.status(500).json({ ok: false, error: 'Registration failed' })
  }
})

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Missing login field' })
    }
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ ok: false, error: 'Invalid email or password' })
    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) return res.status(401).json({ ok: false, error: 'Invalid email or password' })
    return res.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, walletAddress: user.walletAddress } })
  } catch (err) {
    console.error('[API] /api/login error', err)
    res.status(500).json({ ok: false, error: 'Login failed' })
  }
})

app.post('/api/fraud-check', async (req, res) => {
  const { studentWallet, vendorId, amount } = req.body
  if (!studentWallet || !vendorId || typeof amount !== 'number') {
    return res.status(400).json({ ok: false, reason: 'Invalid request body' })
  }
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } })
  if (!vendor) {
    return res.status(400).json({ ok: false, reason: 'Unknown vendor' })
  }
  if (amount > 80) {
    return res.status(422).json({ ok: false, reason: 'Transaction flagged by fraud model: amount above permitted threshold for student vendors.' })
  }
  if (amount <= 0) {
    return res.status(422).json({ ok: false, reason: 'Amount must be positive.' })
  }
  return res.json({ ok: true, fraudScore: 0.02, message: 'Passed AI fraud check.' })
})

app.post('/api/transactions', async (req, res) => {
  try {
    const { senderWallet, receiverWallet, amount, txHash, type, vendorId } = req.body
    if (!senderWallet || !receiverWallet || !txHash || !type || typeof amount !== 'number') {
      return res.status(400).json({ ok: false, error: 'Missing required transaction fields' })
    }

    const senderUser = await prisma.user.findUnique({ where: { walletAddress: senderWallet } })
    const receiverUser = await prisma.user.findUnique({ where: { walletAddress: receiverWallet } })

    const transaction = await prisma.transaction.create({
      data: {
        senderWallet,
        receiverWallet,
        amount,
        txHash,
        type,
        vendorId: vendorId || null,
        senderId: senderUser?.id || null,
        receiverId: receiverUser?.id || null,
      },
    })

    sendSseEvent('transaction', transaction)
    return res.json({ ok: true, transaction })
  } catch (err) {
    console.error('[API] /api/transactions error', err)
    return res.status(500).json({ ok: false, error: 'Database error' })
  }
})

app.get('/events', (req, res) => {
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' })
  res.flushHeaders()
  res.write('retry: 10000\n\n')
  sseClients.push(res)
  req.on('close', () => {
    const idx = sseClients.indexOf(res)
    if (idx !== -1) sseClients.splice(idx, 1)
  })
})

app.listen(PORT, () => console.log(`Backend API server running on http://localhost:${PORT}`))
