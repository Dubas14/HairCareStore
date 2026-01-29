import { useWishlistStore } from '@/stores/wishlist-store'

export function useWishlist() {
  const { items, addItem, removeItem, isInWishlist } = useWishlistStore()

  const toggleWishlist = (productId: string) => {
    if (isInWishlist(productId)) {
      removeItem(productId)
    } else {
      addItem(productId)
    }
  }

  return {
    wishlistItems: items,
    addToWishlist: addItem,
    removeFromWishlist: removeItem,
    toggleWishlist,
    isInWishlist,
  }
}
