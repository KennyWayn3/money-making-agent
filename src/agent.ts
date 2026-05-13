import { GoogleGenerativeAI } from '@google/generative-ai'
import { CodeReviewRequest, CodeReviewResponse } from './types.js'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const REVIEW_SYSTEM_PROMPT = `You are an expert code reviewer and security auditor. Analyze the provided code and return ONLY a valid JSON object (no markdown, no code fences) with:
- summary: brief overview of the code quality
- overallScore: number 0-100
- findings: array of objects with { severity, category, title, description, line?, suggestion? }
- suggestions: array of improvement strings

Severity: critical | high | medium | low | info
Category: security | performance | bug | style | best-practice | maintainability

Be thorough but fair. Focus on actionable findings.`

export async function reviewCode(req: CodeReviewRequest): Promise<CodeReviewResponse> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const userPrompt = `Language: ${req.language}
Context: ${req.context || 'N/A'}

Code to review:
\`\`\`${req.language}
${req.code}
\`\`\``

  const result = await model.generateContent({
    systemInstruction: REVIEW_SYSTEM_PROMPT,
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
    },
  })

  const text = result.response.text()
  if (!text) {
    return {
      summary: 'Failed to analyze code',
      overallScore: 0,
      findings: [],
      suggestions: ['Analysis failed — please try again'],
    }
  }

  return JSON.parse(text) as CodeReviewResponse
}
