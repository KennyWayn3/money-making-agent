import 'dotenv/config'
import { Payments } from '@nevermined-io/payments'

const SERVER_URL = process.env.AGENT_URL || 'http://localhost:3000'

async function main() {
  const payments = Payments.getInstance({
    nvmApiKey: process.env.NVM_API_KEY!,
    environment: (process.env.NVM_ENVIRONMENT as 'sandbox' | 'live') || 'sandbox',
  })

  // 1. First request — expect 402
  console.log('1. Sending request without payment...')
  const resp1 = await fetch(`${SERVER_URL}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: `function hello() { console.log("hi") }`,
      language: 'javascript',
    }),
  })

  if (resp1.status === 402) {
    console.log('    Got 402 — payment required (expected)\n')

    // 2. Generate x402 token
    console.log('2. Purchasing plan & generating access token...')
    const planId = process.env.NVM_PLAN_ID!
    const agentId = process.env.NVM_AGENT_ID!
    await payments.plans.orderPlan(planId)
    const { accessToken } = await payments.x402.getX402AccessToken(planId, agentId)
    console.log('    Token generated!\n')

    // 3. Request with payment
    console.log('3. Sending request WITH payment...')
    const resp2 = await fetch(`${SERVER_URL}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'payment-signature': accessToken,
      },
      body: JSON.stringify({
        code: `
          function unsafeEval(userInput) {
            return eval(userInput)
          }

          const password = "supersecret123"
          const db = mysql.createConnection({ host: process.env.DB_HOST })
        `,
        language: 'javascript',
        context: 'Node.js backend app',
      }),
    })

    const result = await resp2.json() as any
    console.log('    Review results:')
    console.log(`    Score: ${result.overallScore}/100`)
    console.log(`    Findings: ${result.findings?.length || 0}`)
    if (result.findings?.length) {
      for (const f of result.findings) {
        console.log(`      [${f.severity}] ${f.title}`)
      }
    }
    console.log()
  }
}

main().catch(console.error)
