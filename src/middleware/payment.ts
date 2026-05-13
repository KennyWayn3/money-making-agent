import { Payments } from '@nevermined-io/payments'
import { paymentMiddleware } from '@nevermined-io/payments/express'

const payments = Payments.getInstance({
  nvmApiKey: process.env.NVM_API_KEY!,
  environment: process.env.NVM_ENVIRONMENT === 'live' ? 'live' : 'sandbox',
})

export const paymentsMiddleware = paymentMiddleware(
  payments,
  {
    'POST /review': {
      planId: process.env.NVM_PLAN_ID!,
      agentId: process.env.NVM_AGENT_ID!,
      credits: 1,
    },
  },
  {
    onAfterSettle: (req, creditsUsed) => {
      console.log(`[Nevermined] Settled ${creditsUsed} credits for ${req.path}`)
    },
  }
)
