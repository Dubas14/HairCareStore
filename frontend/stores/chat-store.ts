import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const safeStorage = () => ({
  getItem: (name: string) => {
    try { return localStorage.getItem(name) } catch { return null }
  },
  setItem: (name: string, value: string) => {
    try { localStorage.setItem(name, value) } catch { /* quota exceeded */ }
  },
  removeItem: (name: string) => {
    try { localStorage.removeItem(name) } catch { /* ignore */ }
  },
})

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface ChatState {
  messages: ChatMessage[]
  isOpen: boolean
  isLoading: boolean
  addMessage: (message: Omit<ChatMessage, 'timestamp'>) => void
  setLoading: (loading: boolean) => void
  toggleChat: () => void
  openChat: () => void
  closeChat: () => void
  clearMessages: () => void
}

const MAX_MESSAGES = 50

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      isOpen: false,
      isLoading: false,
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, { ...message, timestamp: Date.now() }].slice(-MAX_MESSAGES),
        })),
      setLoading: (isLoading) => set({ isLoading }),
      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
      openChat: () => set({ isOpen: true }),
      closeChat: () => set({ isOpen: false }),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'hair-lab-chat',
      storage: createJSONStorage(safeStorage),
      partialize: (state) => ({
        messages: state.messages,
      }),
    }
  )
)
