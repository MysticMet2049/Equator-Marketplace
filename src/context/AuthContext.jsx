import { createContext, useContext } from "react";
import { useAuthProviderValue } from "./auth/useAuthProviderValue";

// Contexte public utilisé par les pages pour accéder à l'état d'authentification.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const value = useAuthProviderValue();

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}

export default AuthContext;
