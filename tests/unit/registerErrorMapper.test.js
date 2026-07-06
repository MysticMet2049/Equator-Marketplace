import { describe, expect, test } from "vitest";

function mapRegisterError(error = {}) {
  const rawMessage = [error.message, error.detail, error.raw?.message, error.response?.data?.message].filter(Boolean).join(" ");
  const message = rawMessage.toLowerCase();
  if (message.includes("email")) return { field: "email", message: "Cet email est déjà utilisé." };
  if (message.includes("login") || message.includes("username") || message.includes("nom d’utilisateur")) return { field: "username", message: "Ce nom d’utilisateur est déjà utilisé." };
  if (message.includes("phone") || message.includes("mobile") || message.includes("téléphone") || message.includes("telephone")) return { field: "phone", message: "Ce numéro de téléphone est déjà utilisé." };
  return { field: "general", message: "Impossible de créer le compte pour le moment." };
}

describe("register backend error mapper", () => {
  test("détecte un email déjà utilisé", () => expect(mapRegisterError({ message: "email already exists" })).toEqual({ field: "email", message: "Cet email est déjà utilisé." }));
  test("détecte un nom utilisateur déjà utilisé", () => expect(mapRegisterError({ message: "login already exists" })).toEqual({ field: "username", message: "Ce nom d’utilisateur est déjà utilisé." }));
  test("détecte un numéro de téléphone déjà utilisé", () => expect(mapRegisterError({ message: "mobile number already exists" })).toEqual({ field: "phone", message: "Ce numéro de téléphone est déjà utilisé." }));
  test("retourne une erreur générale si le message est inconnu", () => expect(mapRegisterError({ message: "server unavailable" }).field).toBe("general"));
});
