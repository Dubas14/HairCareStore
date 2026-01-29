import { create } from 'zustand'

interface UIStore {
  isMobileMenuOpen: boolean
  isCartDrawerOpen: boolean
  isSearchDialogOpen: boolean
  toggleMobileMenu: () => void
  toggleCartDrawer: () => void
  toggleSearchDialog: () => void
  closeMobileMenu: () => void
  closeCartDrawer: () => void
  closeSearchDialog: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  isMobileMenuOpen: false,
  isCartDrawerOpen: false,
  isSearchDialogOpen: false,
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  toggleCartDrawer: () => set((state) => ({ isCartDrawerOpen: !state.isCartDrawerOpen })),
  toggleSearchDialog: () => set((state) => ({ isSearchDialogOpen: !state.isSearchDialogOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  closeCartDrawer: () => set({ isCartDrawerOpen: false }),
  closeSearchDialog: () => set({ isSearchDialogOpen: false }),
}))
