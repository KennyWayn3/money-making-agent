export interface CodeReviewRequest {
  code: string
  language: string
  context?: string
}

export interface ReviewFinding {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  category: 'security' | 'performance' | 'bug' | 'style' | 'best-practice' | 'maintainability'
  title: string
  description: string
  line?: number
  suggestion?: string
}

export interface CodeReviewResponse {
  summary: string
  overallScore: number
  findings: ReviewFinding[]
  suggestions: string[]
}

export interface HealthResponse {
  status: string
  version: string
  agent: string
}
