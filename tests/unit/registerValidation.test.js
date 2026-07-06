import { describe, expect, test } from "vitest";

function validateUsername(username = "") {
  const value = username.trim();
  if (!value) return "Nom d’utilisateur requis.";
  if (/\s/.test(value)) return "Le nom d’utilisateur ne doit pas contenir d’espace.";
  if (value.length < 3) return "Le nom d’utilisateur doit contenir au moins 3 caractères.";
  if (!/^[a-zA-Z0-9._-]+$/.test(value)) return "Le nom d’utilisateur contient des caractères non autorisés.";
  return "";
}
function validateEmail(email = "") {
  const value = email.trim();
  if (!value) return "Email requis.";
  if (/\s/.test(value)) return "L’email ne doit pas contenir d’espace.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Email invalide.";
  return "";
}
function validatePassword(password = "") {
  if (!password) return "Mot de passe requis.";
  if (password.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
  if (!/[A-Z]/.test(password)) return "Le mot de passe doit contenir une majuscule.";
  if (!/[a-z]/.test(password)) return "Le mot de passe doit contenir une minuscule.";
  if (!/[0-9]/.test(password)) return "Le mot de passe doit contenir un chiffre.";
  return "";
}
function validatePasswordConfirmation(password, confirmation) {
  if (!confirmation) return "Confirmation du mot de passe requise.";
  if (password !== confirmation) return "Les mots de passe ne correspondent pas.";
  return "";
}

describe("register field validation", () => {
  test("refuse un nom utilisateur avec espace", () => expect(validateUsername("Yann Ulrich")).toBe("Le nom d’utilisateur ne doit pas contenir d’espace."));
  test("accepte un nom utilisateur valide", () => expect(validateUsername("YannUlrich_22")).toBe(""));
  test("refuse un email invalide", () => expect(validateEmail("yann@")).toBe("Email invalide."));
  test("refuse un email avec espace", () => expect(validateEmail("yann ulrich@gmail.com")).toBe("L’email ne doit pas contenir d’espace."));
  test("refuse un mot de passe trop faible", () => expect(validatePassword("password")).toBe("Le mot de passe doit contenir une majuscule."));
  test("accepte un mot de passe valide", () => expect(validatePassword("Password123")).toBe(""));
  test("refuse une confirmation différente", () => expect(validatePasswordConfirmation("Password123", "Password456")).toBe("Les mots de passe ne correspondent pas."));
});
