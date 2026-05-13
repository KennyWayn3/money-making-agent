import 'dotenv/config'
import { Payments } from '@nevermined-io/payments'
import { type Address } from '@nevermined-io/payments'

// Base Sepolia (sandbox) USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
// Base Mainnet (live) USDC:    0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

async function main() {
  const nvmApiKey = process.env.NVM_API_KEY
  const builderAddress = process.env.NVM_BUILDER_ADDRESS

  if (!nvmApiKey) {
    console.error('❌ NVM_API_KEY is required. Set it in .env')
    process.exit(1)
  }

  const environment = (process.env.NVM_ENVIRONMENT || 'sandbox') as 'sandbox' | 'live'

  const payments = Payments.getInstance({
    nvmApiKey,
    environment,
  })

  const USDC_ADDRESS = environment === 'live'
    ? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
    : '0x036CbD53842c5426634e7929541eC2318f3dCF7e'

  console.log(`\n  Registering agent on Nevermined (${environment})...\n`)

  // Price: 5 USDC for 50 code reviews
  const price = 5_000_000n // 5 USDC (6 decimals)
  const credits = 50n       // 50 reviews

  const { agentId, planId } = await payments.agents.registerAgentAndPlan(
    {
      name: 'Code Review & Security Audit Agent',
      description: 'AI-powered code review agent that analyzes code for bugs, security vulnerabilities, performance issues, and best practices. Pay per review.',
      tags: ['code-review', 'security-audit', 'ai-agent', 'developer-tools'],
      dateCreated: new Date(),
    },
    {
      agentDefinitionUrl: 'https://your-domain.com/openapi.json',
      endpoints: [
        { POST: 'https://your-domain.com/review' },
      ],
    },
    {
      name: 'Starter Pack — 50 Code Reviews',
      description: '50 code review credits for $5 USD. Each review analyzes your code for security, performance, and quality issues.',
      dateCreated: new Date(),
    },
    payments.plans.getERC20PriceConfig(
      price,
      USDC_ADDRESS,
      (builderAddress || '0x0000000000000000000000000000000000000000') as Address
    ),
    payments.plans.getFixedCreditsConfig(credits, 1n)
  )

  console.log('  ✅  Registered successfully!\n')
  console.log(`  📌  Agent ID: ${agentId}`)
  console.log(`  📌  Plan ID:  ${planId}`)
  console.log(`\n  Add these to your .env file:\n`)
  console.log(`  NVM_AGENT_ID=${agentId}`)
  console.log(`  NVM_PLAN_ID=${planId}`)
  console.log()
}

main().catch((err) => {
  console.error('Registration failed:', err)
  process.exit(1)
})
