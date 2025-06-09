import { create } from 'zustand'

interface CartItem {
  id: string
  name: string
  price: number
  quantity?: number
}

interface CartStore {
  cart: CartItem[]
  isOpen: boolean
  toggleCart: (open?: boolean) => void
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
  calculateTotal: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: [],
  isOpen: false,
  toggleCart: (open?: boolean) =>
    set((state) => ({ isOpen: open ?? !state.isOpen })),
  addToCart: (item) =>
    set((state) => ({
      cart: [...state.cart, item],
    })),
  removeFromCart: (id) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== id),
    })),
  clearCart: () => set({ cart: [] }),
  calculateTotal: () =>
    get().cart.reduce(
      (total, item) => total + item.price * (item.quantity || 1),
      0
    ),
}))