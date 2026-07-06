import { useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const USERNAME_PATTERN = /^[_.@A-Za-z0-9-]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CAMEROON_PHONE_PATTERN = /^(\+237)?6\d{8}$/;

function normalizeComparableText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function normalizeMobileNumberInput(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("+")) return "+" + raw.slice(1).replace(/\D/g, "");

  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("237")) return `+${digits}`;
  if (digits.length === 9 && digits.startsWith("6")) return `+237${digits}`;
  return digits;
}

export function validateRegisterField(name, value, form = {}) {
  const nextForm = { ...form, [name]: value };
  const rawValue = String(value || "");
  const trimmedValue = rawValue.trim();

  if (name === "username") {
    if (!trimmedValue) return "Le nom d'utilisateur est requis.";
    if (/\s/.test(rawValue)) return "Le nom d'utilisateur ne doit pas contenir d'espaces.";
    if (trimmedValue.length < 3) return "Le nom d'utilisateur doit contenir au moins 3 caractères.";
    if (trimmedValue.length > 30) return "Le nom d'utilisateur ne doit pas dépasser 30 caractères.";
    if (!USERNAME_PATTERN.test(trimmedValue)) {
      return "Utilisez seulement des lettres, chiffres, tirets, points, underscores ou @.";
    }
    return "";
  }

  if (name === "email") {
    if (!trimmedValue) return "L'adresse email est requise.";
    if (/\s/.test(rawValue)) return "L'adresse email ne doit pas contenir d'espaces.";
    if (!EMAIL_PATTERN.test(trimmedValue)) return "Adresse email invalide.";
    return "";
  }

  if (name === "mobileNumber") {
    if (!trimmedValue) return "Le numéro de téléphone est requis.";
    if (/[A-Za-z]/.test(rawValue)) return "Le numéro de téléphone ne doit contenir que des chiffres.";

    const normalized = normalizeMobileNumberInput(rawValue);
    if (!CAMEROON_PHONE_PATTERN.test(normalized)) {
      return "Entrez un numéro camerounais valide. Exemple : 699000000 ou +237699000000.";
    }
    return "";
  }

  if (name === "password") {
    if (!rawValue) return "Le mot de passe est requis.";
    if (rawValue.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
    if (/\s/.test(rawValue)) return "Le mot de passe ne doit pas contenir d'espaces.";
    if (!/[A-Z]/.test(rawValue) || !/[a-z]/.test(rawValue) || !/\d/.test(rawValue)) {
      return "Ajoutez au moins une majuscule, une minuscule et un chiffre.";
    }
    return "";
  }

  if (name === "confirmPassword") {
    if (!rawValue) return "Veuillez confirmer le mot de passe.";
    if (rawValue !== nextForm.password) return "Les mots de passe ne correspondent pas.";
    return "";
  }

  return "";
}

function validateLoginForm(form) {
  const errors = {};

  if (!form.username.trim()) errors.username = "Le nom d'utilisateur est requis.";
  if (!form.password) errors.password = "Le mot de passe est requis.";

  return errors;
}

export function validateRegisterForm(form) {
  const errors = {};

  const usernameError = validateRegisterField("username", form.username, form);
  const emailError = validateRegisterField("email", form.email, form);
  const mobileNumberError = validateRegisterField("mobileNumber", form.mobileNumber, form);
  const passwordError = validateRegisterField("password", form.password, form);
  const confirmPasswordError = validateRegisterField("confirmPassword", form.confirmPassword, form);

  if (usernameError) errors.registerUsername = usernameError;
  if (emailError) errors.email = emailError;
  if (mobileNumberError) errors.mobileNumber = mobileNumberError;
  if (passwordError) errors.registerPassword = passwordError;
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

  return errors;
}

export function mapRegisterBackendErrors(errorOrResponse) {
  const raw = errorOrResponse?.data || errorOrResponse?.raw || errorOrResponse || {};
  const content = raw.content || errorOrResponse?.content || {};
  const message = normalizeComparableText(
    errorOrResponse?.message ||
      raw.message ||
      content.message ||
      raw.error ||
      raw.detail ||
      JSON.stringify(raw)
  );

  const fieldErrors = Array.isArray(content.fieldErrors)
    ? content.fieldErrors
    : Array.isArray(raw.fieldErrors)
      ? raw.fieldErrors
      : Array.isArray(raw.errors)
        ? raw.errors
        : [];

  const result = {};
  const allFieldText = normalizeComparableText(
    fieldErrors
      .map((item) => `${item?.field || ""} ${item?.name || ""} ${item?.message || ""}`)
      .join(" ")
  );

  const fullText = `${message} ${allFieldText}`;
  const alreadyUsed =
    fullText.includes("deja") ||
    fullText.includes("déjà") ||
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

  if (
    alreadyUsed &&
    (fullText.includes("mobile") || fullText.includes("phone") || fullText.includes("telephone") || fullText.includes("téléphone"))
  ) {
    result.mobileNumber = "Ce numéro de téléphone est déjà utilisé.";
  }

  fieldErrors.forEach((item) => {
    const field = normalizeComparableText(item?.field || item?.name || "");
    const itemMessage = item?.message || "Valeur invalide.";

    if (field.includes("email") || field.includes("mail")) result.email = itemMessage;
    if (field.includes("login") || field.includes("username")) result.registerUsername = itemMessage;
    if (field.includes("mobile") || field.includes("phone") || field.includes("telephone")) result.mobileNumber = itemMessage;
  });

  return result;
}

export default function useLoginPageForm() {
  const { login, register, authLoading, authError, setAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const from = location.state?.from || "/";
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";

  const [mode, setMode] = useState(initialMode);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [localSuccess, setLocalSuccess] = useState(location.state?.registerSuccess || null);

  const [loginForm, setLoginForm] = useState({ username: location.state?.login || "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });

  const title = useMemo(() => (mode === "login" ? "Se connecter" : "Créer un compte"), [mode]);
  const subtitle = useMemo(
    () =>
      mode === "login"
        ? "Entrez votre nom d'utilisateur et votre mot de passe pour accéder à votre compte."
        : "Créez votre compte avec un nom d'utilisateur, une adresse email, un numéro de téléphone et un mot de passe.",
    [mode]
  );

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setErrors({});
    setAuthError(null);
    setLocalSuccess(null);
    setSearchParams(nextMode === "register" ? { mode: "register" } : {});
  };

  const handleRegisterFieldChange = (name, value) => {
    setRegisterForm((previous) => {
      const nextForm = { ...previous, [name]: value };
      const fieldError = validateRegisterField(name, value, nextForm);
      const errorKey =
        name === "username"
          ? "registerUsername"
          : name === "password"
            ? "registerPassword"
            : name;

      setErrors((previousErrors) => {
        const nextErrors = { ...previousErrors };

        if (fieldError) nextErrors[errorKey] = fieldError;
        else delete nextErrors[errorKey];

        if (name === "password" && nextForm.confirmPassword) {
          const confirmError = validateRegisterField("confirmPassword", nextForm.confirmPassword, nextForm);
          if (confirmError) nextErrors.confirmPassword = confirmError;
          else delete nextErrors.confirmPassword;
        }

        return nextErrors;
      });

      return nextForm;
    });
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setAuthError(null);
    setLocalSuccess(null);

    const nextErrors = validateLoginForm(loginForm);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    const response = await login(loginForm.username.trim(), loginForm.password);

    if (response.success) {
      navigate(from, { replace: true });
      return;
    }

    if (response.needsVerification) {
      navigate("/verify-email", { state: { email: loginForm.username.trim() } });
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setAuthError(null);
    setLocalSuccess(null);

    const nextErrors = validateRegisterForm(registerForm);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    const username = registerForm.username.trim();
    const email = registerForm.email.trim();

    const response = await register({
      username,
      email,
      mobileNumber: normalizeMobileNumberInput(registerForm.mobileNumber),
      password: registerForm.password,
    });

    if (!response.success) {
      const backendFieldErrors = response.fieldErrors || mapRegisterBackendErrors(response);
      if (Object.keys(backendFieldErrors).length) {
        setErrors((previous) => ({ ...previous, ...backendFieldErrors }));
      }
      return;
    }

    if (response.success) {
      changeMode("login");
      setLoginForm({ username, password: "" });
      setRegisterForm({ username: "", email: "", mobileNumber: "", password: "", confirmPassword: "" });
      setLocalSuccess("Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.");
    }
  };

  return {
    mode,
    title,
    subtitle,
    authLoading,
    authError,
    localSuccess,
    errors,
    loginForm,
    setLoginForm,
    registerForm,
    setRegisterForm,
    showLoginPassword,
    setShowLoginPassword,
    showRegisterPassword,
    setShowRegisterPassword,
    changeMode,
    handleRegisterFieldChange,
    handleLoginSubmit,
    handleRegisterSubmit,
  };
}
