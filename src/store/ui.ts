import { create } from 'zustand'

interface UIState {
  // Mobile menu
  isMobileMenuOpen: boolean
  
  // Search
  isSearchOpen: boolean
  searchQuery: string
  
  // Modals
  isLoginModalOpen: boolean
  isCartModalOpen: boolean
  
  // Theme
  theme: 'light' | 'dark' | 'system'
  
  // Loading states
  isPageLoading: boolean
  
  // Actions
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
  
  toggleSearch: () => void
  setSearchQuery: (query: string) => void
  
  openLoginModal: () => void
  closeLoginModal: () => void
  
  toggleCartModal: () => void
  closeCartModal: () => void
  
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  
  setPageLoading: (loading: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  isMobileMenuOpen: false,
  isSearchOpen: false,
  searchQuery: '',
  isLoginModalOpen: false,
  isCartModalOpen: false,
  theme: 'system',
  isPageLoading: false,
  
  // Mobile menu actions
  toggleMobileMenu: () => 
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  
  // Search actions
  toggleSearch: () => 
    set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  
  // Modal actions
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
  
  toggleCartModal: () => 
    set((state) => ({ isCartModalOpen: !state.isCartModalOpen })),
  
  closeCartModal: () => set({ isCartModalOpen: false }),
  
  // Theme actions
  setTheme: (theme) => set({ theme }),
  
  // Loading actions
  setPageLoading: (isPageLoading) => set({ isPageLoading }),
}))
