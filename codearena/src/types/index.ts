export type Difficulty = 'Easy' | 'Medium' | 'Hard'
export type Language = 'javascript' | 'python' | 'java' | 'cpp' | 'c'

export interface TestCase {
  input: string
  expected: string
}

export interface Problem {
  slug: string
  title: string
  difficulty: Difficulty
  tags: string[]
  statement: string
  constraints: string[]
  hints: string[]
  examples: TestCase[]
  starterCode: Record<Language, string>
}

export interface Submission {
  id: string
  problemSlug: string
  problemTitle: string
  language: Language
  sourceCode: string
  action: 'run' | 'submit'
  status: string
  verdict: string | null
  createdAt: string
}

export interface User {
  id: number
  name: string
  username: string
  email: string
  role: string
}
