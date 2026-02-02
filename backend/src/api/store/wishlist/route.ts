import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * GET /store/wishlist
 * Отримати wishlist поточного customer
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const customerId = (req as any).auth_context?.actor_id

  if (!customerId) {
    res.status(401).json({ message: "Not authenticated" })
    return
  }

  const customerModuleService = req.scope.resolve(Modules.CUSTOMER)
  const customer = await customerModuleService.retrieveCustomer(customerId)

  const wishlist = (customer.metadata?.wishlist as string[]) || []

  res.json({ wishlist })
}

/**
 * POST /store/wishlist
 * Додати товар в wishlist
 */
export async function POST(
  req: MedusaRequest<{ product_id: string }>,
  res: MedusaResponse
): Promise<void> {
  const customerId = (req as any).auth_context?.actor_id
  const { product_id } = req.body

  if (!customerId) {
    res.status(401).json({ message: "Not authenticated" })
    return
  }

  if (!product_id) {
    res.status(400).json({ message: "product_id is required" })
    return
  }

  const customerModuleService = req.scope.resolve(Modules.CUSTOMER)
  const customer = await customerModuleService.retrieveCustomer(customerId)

  const currentWishlist = (customer.metadata?.wishlist as string[]) || []

  // Перевіряємо чи товар вже є в wishlist
  if (currentWishlist.includes(product_id)) {
    res.json({ wishlist: currentWishlist })
    return
  }

  const newWishlist = [...currentWishlist, product_id]

  // Оновлюємо customer metadata
  await customerModuleService.updateCustomers(customerId, {
    metadata: {
      ...customer.metadata,
      wishlist: newWishlist,
    },
  })

  res.json({ wishlist: newWishlist })
}

/**
 * DELETE /store/wishlist/:product_id
 * Видалити товар з wishlist
 */
export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const customerId = (req as any).auth_context?.actor_id
  const { product_id } = req.params

  if (!customerId) {
    res.status(401).json({ message: "Not authenticated" })
    return
  }

  if (!product_id) {
    res.status(400).json({ message: "product_id is required" })
    return
  }

  const customerModuleService = req.scope.resolve(Modules.CUSTOMER)
  const customer = await customerModuleService.retrieveCustomer(customerId)

  const currentWishlist = (customer.metadata?.wishlist as string[]) || []
  const newWishlist = currentWishlist.filter((id) => id !== product_id)

  // Оновлюємо customer metadata
  await customerModuleService.updateCustomers(customerId, {
    metadata: {
      ...customer.metadata,
      wishlist: newWishlist,
    },
  })

  res.json({ wishlist: newWishlist })
}
