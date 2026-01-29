// Common types for the application

export type HairType = 'straight' | 'wavy' | 'curly' | 'coily'

export type HairProblem = 'dry' | 'oily' | 'dandruff' | 'hair_loss' | 'damage' | 'frizz'

export type ProductCategory = 'shampoo' | 'conditioner' | 'mask' | 'oil' | 'spray' | 'styling'

export type LoyaltyLevel = 'bronze' | 'silver' | 'gold'

export interface QuizStep {
  id: string
  question: string
  options: QuizOption[]
}

export interface QuizOption {
  value: string
  label: string
  description?: string
}

export interface QuizResult {
  recommendations: string[]
  explanation: string
}
