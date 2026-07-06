import { createContext, useContext } from "react";
import { useFavoritesProviderValue } from "./favorites/useFavoritesProviderValue";

// Contexte public des favoris produit.
const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const value = useFavoritesProviderValue();

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used inside FavoritesProvider");
  }

  return context;
}

export default FavoritesContext;
