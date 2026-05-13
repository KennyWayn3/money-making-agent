import { Payments } from '@nevermined-io/payments'
import { paymentMiddleware } from '@nevermined-io/payments/express'

let _middleware: ReturnType<typeof paymentMiddleware> | null = null

function getMiddleware() {
  if (!_middleware) {
    const payments = Payments.getInstance({
      nvmApiKey: process.env.NVM_API_KEY!,
      environment: process.env.NVM_ENVIRONMENT === 'live' ? 'live' : 'sandbox',
    })

    _middleware = paymentMiddleware(
      payments,
      {
        'POST /review': {
          planId: process.env.NVM_PLAN_ID!,
          agentId: process.env.NVM_AGENT_ID!,
          credits: 1,
        },
      },
      {
        onAfterSettle: (_req, creditsUsed) => {
          console.log(`[Nevermined] Settled ${creditsUsed} credits`)
        },
      }
    )
  }
  return _middleware
}

export function paymentsMiddleware(req: any, res: any, next: any) {
  getMiddleware()(req, res, next)
}
