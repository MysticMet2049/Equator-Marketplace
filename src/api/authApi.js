import http from "./httpClient";

export const LOGIN_METHOD = {
  NATIVE: "NATIVE",
  FACEBOOK: "FACEBOOK",
  GOOGLE: "GOOGLE",
  API_KEY: "API_KEY",
};

export const PLATFORM_CONTEXT = {
  CLIENT: "WYLOV_CLIENT",
};

export const AUTH_STATUS = {
  COMPLETE: "COMPLETE",
  INCOMPLETE: "INCOMPLETE",

  AUTHENTICATED: "COMPLETE",
  TWO_FACTOR_REQUIRED: "INCOMPLETE",
  ACTIVATION_REQUIRED: "INCOMPLETE",
};

function cleanObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined)
  );
}

function normalizeAuthResponse(response) {
  if (!response) {
    return {
      token: null,
      authStatus: AUTH_STATUS.INCOMPLETE,
      user: null,
      raw: response,
    };
  }

  return {
    ...response,
    token: response.token || response.accessToken || null,
    authStatus:
      response.authStatus ||
      (response.token || response.accessToken
        ? AUTH_STATUS.COMPLETE
        : AUTH_STATUS.INCOMPLETE),
    user: response.user || response.userSummaryDto || null,
    raw: response,
  };
}

/**
 * Connexion utilisateur.
 */
export async function login(credentials = {}) {
  const loginValue =
    credentials.login ||
    credentials.username ||
    credentials.email ||
    "";

  const body = cleanObject({
    login: loginValue,
    password: credentials.password || "",
    rememberMe: credentials.rememberMe ?? true,
    loginMethod: LOGIN_METHOD.NATIVE,
    thirdPartyOAuthToken: credentials.thirdPartyOAuthToken,
  });

  const response = await http.post("/api/auth/login", body);
  return normalizeAuthResponse(response);
}

/**
 * Vérifie si le token actuel est valide.
 */
export async function verifyToken() {
  const validResponse = await http.get("/api/auth/verify-token");

  let user = null;

  try {
    const accountResponse = await http.get("/api/accounts/authenticated");

    if (accountResponse && typeof accountResponse === "object") {
      user = accountResponse.user || accountResponse;
    }
  } catch {
    user = null;
  }

  return {
    valid:
      validResponse === true ||
      validResponse?.valid === true ||
      validResponse?.authenticated === true ||
      validResponse !== false,
    user,
    raw: validResponse,
  };
}

/**
 * Création d'un compte client.
 *
 * Champs attendus depuis LoginPage/AuthContext :
 * {
 *   username,
 *   email,
 *   mobileNumber,
 *   password
 * }
 */

function normalizeMobileNumber(value) {
  const raw = String(value || "").trim();

  if (!raw) return "";

  if (raw.startsWith("+")) {
    return "+" + raw.slice(1).replace(/\D/g, "");
  }

  const digits = raw.replace(/\D/g, "");

  if (digits.startsWith("00")) {
    return `+${digits.slice(2)}`;
  }

  if (digits.startsWith("237")) {
    return `+${digits}`;
  }

  if (digits.length === 9 && digits.startsWith("6")) {
    return `+237${digits}`;
  }

  return `+${digits}`;
}

export async function register(payload = {}) {
  const username = String(payload.username || payload.login || "").trim();
  const email = String(payload.email || "").trim();
  const mobileNumber = normalizeMobileNumber(payload.mobileNumber);
  const password = String(payload.password || "");

  const personalInfo = {
    firstName: username,
    lastName: username,
    fullName: username,
    email,
  };

  const body = {
    mobileNumber,
    personalInfo,
    user: {
      login: username,
      password,
      loginMethod: LOGIN_METHOD.NATIVE,
      platformContext: PLATFORM_CONTEXT.CLIENT,
      personalInfo,
      language: "FRENCH",
      countryShortName: "CM",
      mobileNumber,
    },
    activationCodeDoesNotNeedToBeSent: true,
  };

  console.log(
    "[/api/customers/create PAYLOAD]",
    JSON.stringify(
      {
        ...body,
        user: {
          ...body.user,
          password: "***",
        },
      },
      null,
      2
    )
  );

  return http.post("/api/customers/create", body, { skipAuth: true });
}


/**
 * Activation du compte après réception du code.
 */
export async function activateAuth(payload = {}) {
  const body = {
    login: payload.login || payload.username || payload.email || "",
    code: payload.code || "",
  };

  const response = await http.post("/api/auth/activate-auth", body);
  return normalizeAuthResponse(response);
}

/**
 * Vérification d'un code simple.
 */
export async function verifyCode(payload = {}) {
  const body = {
    login: payload.login || payload.username || payload.email || "",
    code: payload.code || "",
    rememberMe: payload.rememberMe ?? true,
  };

  const response = await http.post("/api/auth/verify-code", body);
  return normalizeAuthResponse(response);
}

/**
 * Vérification two-factor.
 */
export async function verifyTwoFactor(payload = {}) {
  const body = {
    login: payload.login || payload.username || payload.email || "",
    code: payload.code || "",
    rememberMe: payload.rememberMe ?? true,
  };

  const response = await http.post("/api/auth/verify-twofactor", body);
  return normalizeAuthResponse(response);
}

/**
 * Renvoi du code two-factor.
 */
export async function resendTwoFactorCode(payload = {}) {
  const loginValue =
    typeof payload === "string"
      ? payload
      : payload.login || payload.username || payload.email || "";

  return http.post("/api/auth/resend-twofactor-code", loginValue);
}

/**
 * Demande de reset password par login/email.
 */
export async function requestPasswordReset(loginValue) {
  return http.post("/api/accounts/reset-password/init", loginValue);
}

/**
 * Demande de reset password avec code.
 */
export async function requestPasswordResetWithCode(loginValue) {
  return http.post("/api/accounts/reset-password/send-code", loginValue);
}

/**
 * Finalisation reset password.
 */
export async function finishPasswordReset(payload = {}) {
  return http.post("/api/accounts/reset-password/finish", payload);
}

/**
 * Changement de mot de passe utilisateur connecté.
 */
export async function changePassword(payload = {}) {
  return http.post("/api/accounts/change-password", payload);
}

const authApi = {
  login,
  verifyToken,
  register,
  activateAuth,
  verifyCode,
  verifyTwoFactor,
  resendTwoFactorCode,
  requestPasswordReset,
  requestPasswordResetWithCode,
  finishPasswordReset,
  changePassword,
};

export default authApi;