import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema, contactSchema, shippingSchema, addressSchema, flattenZodErrors } from './schemas'

describe('loginSchema', () => {
  it('accepts valid login data', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '123456' })
    expect(result.success).toBe(true)
  })

  it('rejects empty email', () => {
    const result = loginSchema.safeParse({ email: '', password: '123456' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email format', () => {
    const result = loginSchema.safeParse({ email: 'not-email', password: '123456' })
    expect(result.success).toBe(false)
  })

  it('rejects short password', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '123' })
    expect(result.success).toBe(false)
  })

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '' })
    expect(result.success).toBe(false)
  })
})

describe('registerSchema', () => {
  const validData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: '12345678',
    confirmPassword: '12345678',
    acceptTerms: true as const,
  }

  it('accepts valid registration data', () => {
    const result = registerSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({ ...validData, confirmPassword: 'different' })
    expect(result.success).toBe(false)
  })

  it('rejects unaccepted terms', () => {
    const result = registerSchema.safeParse({ ...validData, acceptTerms: false })
    expect(result.success).toBe(false)
  })

  it('rejects short password', () => {
    const result = registerSchema.safeParse({ ...validData, password: '1234', confirmPassword: '1234' })
    expect(result.success).toBe(false)
  })

  it('rejects empty firstName', () => {
    const result = registerSchema.safeParse({ ...validData, firstName: '' })
    expect(result.success).toBe(false)
  })
})

describe('contactSchema', () => {
  const validData = {
    email: 'test@example.com',
    phone: '+380501234567',
    firstName: 'Test',
    lastName: 'User',
  }

  it('accepts valid contact data', () => {
    const result = contactSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejects invalid phone format', () => {
    const result = contactSchema.safeParse({ ...validData, phone: '123' })
    expect(result.success).toBe(false)
  })

  it('rejects empty firstName', () => {
    const result = contactSchema.safeParse({ ...validData, firstName: '' })
    expect(result.success).toBe(false)
  })
})

describe('shippingSchema', () => {
  it('accepts valid shipping data', () => {
    const result = shippingSchema.safeParse({
      city: 'Kyiv',
      warehouse: 'Branch 5',
      shippingMethodId: 'nova-poshta',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty city', () => {
    const result = shippingSchema.safeParse({
      city: '',
      warehouse: 'Branch 5',
      shippingMethodId: 'nova-poshta',
    })
    expect(result.success).toBe(false)
  })
})

describe('addressSchema', () => {
  it('accepts valid address', () => {
    const result = addressSchema.safeParse({
      firstName: 'Test',
      lastName: 'User',
      phone: '+380501234567',
      city: 'Kyiv',
      address1: 'Street 1',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid phone', () => {
    const result = addressSchema.safeParse({
      firstName: 'Test',
      lastName: 'User',
      phone: '12',
      city: 'Kyiv',
      address1: 'Street 1',
    })
    expect(result.success).toBe(false)
  })
})

describe('flattenZodErrors', () => {
  it('returns empty object for successful parse', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '123456' })
    expect(flattenZodErrors(result)).toEqual({})
  })

  it('returns flat error map for failed parse', () => {
    const result = loginSchema.safeParse({ email: '', password: '' })
    const errors = flattenZodErrors(result)
    expect(errors).toHaveProperty('email')
    expect(errors).toHaveProperty('password')
  })
})
