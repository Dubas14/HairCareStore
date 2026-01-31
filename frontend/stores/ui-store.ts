import { create } from 'zustand'

interface UIStore {
  isMobileMenuOpen: boolean
  isSearchOpen: boolean

  toggleMobileMenu: () => void
  closeMobileMenu: () => void

  openSearch: () => void
  closeSearch: () => void
  toggleSearch: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,

  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
}))
