import { z } from 'zod'

// ─── Auth schemas ───────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Обов'язкове поле")
    .email('Невірний формат email'),
  password: z
    .string()
    .min(1, "Обов'язкове поле")
    .min(6, 'Мінімум 6 символів'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    firstName: z.string().min(1, "Обов'язкове поле").max(100, 'Максимум 100 символів'),
    lastName: z.string().min(1, "Обов'язкове поле").max(100, 'Максимум 100 символів'),
    email: z
      .string()
      .min(1, "Обов'язкове поле")
      .email('Невірний формат email'),
    password: z
      .string()
      .min(1, "Обов'язкове поле")
      .min(8, 'Мінімум 8 символів'),
    confirmPassword: z.string().min(1, "Обов'язкове поле"),
    acceptTerms: z.literal(true, { message: 'Прийміть умови використання' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Паролі не співпадають',
    path: ['confirmPassword'],
  })

export type RegisterInput = z.infer<typeof registerSchema>

// ─── Checkout schemas ───────────────────────────────────────────

export const contactSchema = z.object({
  email: z
    .string()
    .min(1, "Обов'язкове поле")
    .email('Невірний формат email'),
  phone: z
    .string()
    .min(1, "Обов'язкове поле")
    .regex(/^[\d\s+()-]{10,}$/, 'Невірний формат номера'),
  firstName: z.string().min(1, "Обов'язкове поле").max(100, 'Максимум 100 символів'),
  lastName: z.string().min(1, "Обов'язкове поле").max(100, 'Максимум 100 символів'),
})

export type ContactInput = z.infer<typeof contactSchema>

export const shippingSchema = z.object({
  city: z.string().min(1, "Обов'язкове поле").max(100, 'Максимум 100 символів'),
  warehouse: z.string().min(1, "Обов'язкове поле"),
  shippingMethodId: z.string().min(1, 'Оберіть спосіб доставки'),
})

export type ShippingInput = z.infer<typeof shippingSchema>

// ─── Address schema ─────────────────────────────────────────────

export const addressSchema = z.object({
  firstName: z.string().min(1, "Обов'язкове поле").max(100, 'Максимум 100 символів'),
  lastName: z.string().min(1, "Обов'язкове поле").max(100, 'Максимум 100 символів'),
  phone: z
    .string()
    .min(1, "Обов'язкове поле")
    .regex(/^[\d\s+()-]{7,20}$/, 'Невірний формат телефону'),
  city: z.string().min(1, "Обов'язкове поле").max(100, 'Максимум 100 символів'),
  address1: z.string().min(1, "Обов'язкове поле"),
  postalCode: z.string().optional(),
})

export type AddressInput = z.infer<typeof addressSchema>

// ─── Cart address update schema (for server-side validation) ────

export const cartAddressUpdateSchema = z.object({
  email: z.string().email('Невірний формат email').optional(),
  shippingAddress: z
    .object({
      firstName: z.string().max(100, "Занадто довге ім'я").optional(),
      lastName: z.string().max(100, 'Занадто довге прізвище').optional(),
      phone: z.string().regex(/^[\d\s+()-]{7,20}$/, 'Невірний формат телефону').optional(),
      city: z.string().max(100, 'Занадто довга назва міста').optional(),
      address1: z.string().optional(),
      countryCode: z.string().optional(),
      postalCode: z.string().optional(),
    })
    .optional(),
  billingAddress: z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional(),
      city: z.string().optional(),
      address1: z.string().optional(),
      countryCode: z.string().optional(),
      postalCode: z.string().optional(),
    })
    .optional(),
})

export type CartAddressUpdateInput = z.infer<typeof cartAddressUpdateSchema>

// ─── Helper: extract Zod errors into a flat object ──────────────

export function flattenZodErrors(
  result: { success: boolean; error?: { issues: Array<{ path: PropertyKey[]; message: string }> } }
): Record<string, string> {
  if (result.success || !result.error) return {}
  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = issue.path.map(String).join('.')
    if (!errors[key]) {
      errors[key] = issue.message
    }
  }
  return errors
}
