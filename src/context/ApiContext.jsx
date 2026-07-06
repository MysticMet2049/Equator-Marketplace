import { createContext, useContext } from "react";
import { useApiProviderValue } from "./api/useApiProviderValue";

// Contexte API historique : il expose les données mockées et les helpers UI.
const ApiContext = createContext(null);

export function ApiProvider({ children }) {
  const value = useApiProviderValue();

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApi() {
  const ctx = useContext(ApiContext);

  if (!ctx) {
    throw new Error("useApi must be used within ApiProvider");
  }

  return ctx;
}

export default ApiContext;
