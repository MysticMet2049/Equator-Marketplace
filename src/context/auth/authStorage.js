// Gestion centralisée des données d'authentification stockées localement.
const AUTH_USER_KEY = "equator_auth_user";
const PENDING_EMAIL_KEY = "equator_pending_email";

// Lit et écrit l'utilisateur connecté dans le localStorage.
export const authUserStorage = {
  get: () => {
    try {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  set: (user) => {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
  },
  remove: () => {
    localStorage.removeItem(AUTH_USER_KEY);
  },
};

// Conserve temporairement l'email en attente de validation.
export const pendingEmailStorage = {
  get: () => localStorage.getItem(PENDING_EMAIL_KEY),
  set: (email) => {
    if (email) {
      localStorage.setItem(PENDING_EMAIL_KEY, email);
    }
  },
  remove: () => {
    localStorage.removeItem(PENDING_EMAIL_KEY);
  },
};
