import { createContext, useContext } from "react";
import { useCartProviderValue } from "./cart/useCartProviderValue";

// Contexte public du panier. La logique métier est déplacée dans des hooks dédiés.
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const value = useCartProviderValue();

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error("useCartContext must be used within CartProvider");
  }

  return ctx;
}

export default CartContext;
