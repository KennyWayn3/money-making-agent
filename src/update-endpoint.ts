import 'dotenv/config'
import { Payments } from '@nevermined-io/payments'

async function main() {
  const url = process.argv[2]
  if (!url) {
    console.error('Usage: npx tsx src/update-endpoint.ts https://your-app.railway.app')
    process.exit(1)
  }

  const payments = Payments.getInstance({
    nvmApiKey: process.env.NVM_API_KEY!,
    environment: (process.env.NVM_ENVIRONMENT as 'sandbox' | 'live') || 'sandbox',
  })

  const agentId = process.env.NVM_AGENT_ID!
  const endpoint = `${url}/review`

  await payments.agents.updateAgentMetadata(agentId,
    { name: 'Code Review & Security Audit Agent', tags: ['code-review', 'security-audit'] },
    { agentDefinitionUrl: `${url}/openapi.json`, endpoints: [{ POST: endpoint }] }
  )

  console.log(`  ✅  Endpoint updated to: ${endpoint}`)
}

main().catch(console.error)
