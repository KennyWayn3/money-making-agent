import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { paymentsMiddleware } from './middleware/payment.js'
import { reviewCode } from './agent.js'
import { CodeReviewRequest, CodeReviewResponse, HealthResponse } from './types.js'

const app = express()
const PORT = parseInt(process.env.PORT || '3000', 10)

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => {
  const health: HealthResponse = {
    status: 'ok',
    version: '1.0.0',
    agent: 'Code Review & Security Audit Agent',
  }
  res.json(health)
})

app.post('/review', paymentsMiddleware, async (req, res) => {
  try {
    const reviewReq: CodeReviewRequest = {
      code: req.body.code,
      language: req.body.language || 'plaintext',
      context: req.body.context,
    }

    if (!reviewReq.code || reviewReq.code.trim().length === 0) {
      res.status(400).json({ error: 'code field is required' })
      return
    }

    const result: CodeReviewResponse = await reviewCode(reviewReq)
    res.json(result)
  } catch (err) {
    console.error('[Agent] Review failed:', err)
    res.status(500).json({ error: 'Code review analysis failed' })
  }
})

app.listen(PORT, () => {
  console.log(`\n  🚀  Code Review Agent running on http://localhost:${PORT}`)
  console.log(`  📋  POST /review  — 1 credit per review`)
  console.log(`  ❤️   GET  /health — free\n`)
})
