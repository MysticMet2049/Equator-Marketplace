import { useCallback, useEffect, useMemo, useState } from "react";
import authApi, { AUTH_STATUS } from "../../api/authApi";
import { mapUserFromApi } from "../../api/mappers/customerMapper";
import { tokenStorage, ApiError } from "../../api/httpClient";
import { authUserStorage, pendingEmailStorage } from "./authStorage";

// Prépare le payload d'inscription quel que soit le format reçu par la page.

const normalizeErrorText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const extractRegisterFieldErrors = (error) => {
  const data = error?.data || {};
  const content = data?.content || {};
  const fieldErrors = Array.isArray(content.fieldErrors)
    ? content.fieldErrors
    : Array.isArray(data.fieldErrors)
      ? data.fieldErrors
      : Array.isArray(data.errors)
        ? data.errors
        : [];

  const fullText = normalizeErrorText([
    error?.message,
    data?.message,
    content?.message,
    data?.error,
    data?.detail,
    ...fieldErrors.map((item) => `${item?.field || ""} ${item?.name || ""} ${item?.message || ""}`),
  ].filter(Boolean).join(" "));

  const result = {};
  const alreadyUsed =
    fullText.includes("deja") ||
    fullText.includes("already") ||
    fullText.includes("existe") ||
    fullText.includes("exist") ||
    fullText.includes("used") ||
    fullText.includes("unique") ||
    fullText.includes("duplicate") ||
    fullText.includes("constraint");

  if (alreadyUsed && (fullText.includes("email") || fullText.includes("mail"))) {
    result.email = "Cette adresse email est déjà utilisée.";
  }

  if (alreadyUsed && (fullText.includes("login") || fullText.includes("username") || fullText.includes("utilisateur"))) {
    result.registerUsername = "Ce nom d'utilisateur est déjà utilisé.";
  }

  if (alreadyUsed && (fullText.includes("mobile") || fullText.includes("phone") || fullText.includes("telephone"))) {
    result.mobileNumber = "Ce numéro de téléphone est déjà utilisé.";
  }

  fieldErrors.forEach((item) => {
    const field = normalizeErrorText(item?.field || item?.name || "");
    const message = item?.message || "Valeur invalide.";

    if (field.includes("email") || field.includes("mail")) result.email = message;
    if (field.includes("login") || field.includes("username")) result.registerUsername = message;
    if (field.includes("mobile") || field.includes("phone") || field.includes("telephone")) result.mobileNumber = message;
  });

  return result;
};

const buildRegisterPayload = (usernameOrPayload, emailArg, passwordArg) => {
  const payload =
    typeof usernameOrPayload === "object"
      ? usernameOrPayload
      : {
          username: usernameOrPayload,
          email: emailArg,
          password: passwordArg,
        };

  return {
    username: String(payload.username || payload.login || "").trim(),
    email: String(payload.email || "").trim(),
    password: String(payload.password || ""),
    mobileNumber: String(payload.mobileNumber || "").trim(),
  };
};

// Hook qui regroupe toute la logique métier du AuthContext.
export function useAuthProviderValue() {
  const [user, setUser] = useState(() => authUserStorage.get());
  const [pendingEmail, setPendingEmail] = useState(() => pendingEmailStorage.get());
  const [token, setToken] = useState(() => tokenStorage.get());
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const isAuthenticated = Boolean(user && token);

  const clearSession = useCallback(() => {
    tokenStorage.remove();
    authUserStorage.remove();
    pendingEmailStorage.remove();
    setToken(null);
    setUser(null);
    setPendingEmail(null);
  }, []);

  const verifyToken = useCallback(async () => {
    const stored = tokenStorage.get();

    if (!stored) {
      authUserStorage.remove();
      setToken(null);
      setUser(null);
      setAuthLoading(false);
      return false;
    }

    setAuthLoading(true);

    try {
      const response = await authApi.verifyToken();
      setToken(stored);

      if (response?.user) {
        const mappedUser = mapUserFromApi(response.user);
        setUser(mappedUser);
        authUserStorage.set(mappedUser);
      } else {
        const cachedUser = authUserStorage.get();
        if (cachedUser) setUser(cachedUser);
      }

      setAuthLoading(false);
      return true;
    } catch {
      tokenStorage.remove();
      authUserStorage.remove();
      setToken(null);
      setUser(null);
      setAuthLoading(false);
      return false;
    }
  }, []);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  const login = useCallback(async (loginValue, password) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const response = await authApi.login({ login: loginValue, password });

      if (response?.authStatus === AUTH_STATUS.INCOMPLETE && !response?.token) {
        setPendingEmail(loginValue);
        pendingEmailStorage.set(loginValue);
        setAuthLoading(false);
        setAuthError("Une vérification supplémentaire est requise pour ce compte.");
        return { success: false, needsVerification: true };
      }

      if (!response?.token) {
        setAuthLoading(false);
        setAuthError("Connexion impossible : aucun token reçu du serveur.");
        return { success: false, error: "NO_TOKEN" };
      }

      tokenStorage.set(response.token);
      setToken(response.token);

      const mappedUser = mapUserFromApi(response.user);
      setUser(mappedUser);
      authUserStorage.set(mappedUser);
      pendingEmailStorage.remove();
      setPendingEmail(null);
      setAuthLoading(false);
      return { success: true };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Impossible de contacter le serveur.";
      console.error("[AuthContext] login failed:", err);
      setAuthError(message);
      setAuthLoading(false);
      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(async (...args) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const payload = buildRegisterPayload(...args);
      console.log("[AuthContext] register values", { ...payload, password: payload.password ? "***" : "" });
      await authApi.register(payload);
      pendingEmailStorage.remove();
      setPendingEmail(null);
      setAuthLoading(false);
      return { success: true, needsVerification: false };
    } catch (err) {
      const fieldErrors = extractRegisterFieldErrors(err);
      const hasFieldErrors = Object.keys(fieldErrors).length > 0;
      const message = hasFieldErrors
        ? "Veuillez corriger les champs signalés."
        : err instanceof ApiError
          ? err.message
          : "Impossible de créer le compte.";

      console.error("[AuthContext] register failed:", err);
      setAuthError(message);
      setAuthLoading(false);
      return { success: false, error: message, fieldErrors };
    }
  }, []);

  const verifyEmail = useCallback(async (email, code) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const response = await authApi.activateAuth({ login: email, code });
      if (response?.token) {
        tokenStorage.set(response.token);
        setToken(response.token);
        if (response?.user) {
          const mappedUser = mapUserFromApi(response.user);
          setUser(mappedUser);
          authUserStorage.set(mappedUser);
        }
      }
      setPendingEmail(null);
      pendingEmailStorage.remove();
      setAuthLoading(false);
      return { success: true };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Code invalide.";
      console.error("[AuthContext] verifyEmail failed:", err);
      setAuthError(message);
      setAuthLoading(false);
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setAuthError(null);
  }, [clearSession]);

  const updateProfile = useCallback((data) => {
    setUser((previous) => {
      const nextUser = { ...previous, ...data };
      authUserStorage.set(nextUser);
      return nextUser;
    });
  }, []);

  const requireAuth = useCallback((action) => {
    if (isAuthenticated) {
      action?.();
      return true;
    }
    return false;
  }, [isAuthenticated]);

  return useMemo(() => ({
    user,
    token,
    isAuthenticated,
    authLoading,
    authError,
    pendingEmail,
    login,
    register,
    verifyEmail,
    verifyToken,
    logout,
    updateProfile,
    requireAuth,
    setAuthError,
  }), [user, token, isAuthenticated, authLoading, authError, pendingEmail, login, register, verifyEmail, verifyToken, logout, updateProfile, requireAuth]);
}
