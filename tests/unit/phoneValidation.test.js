import { describe, expect, test } from "vitest";
function normalizeCameroonPhone(phone = "") { const digits = String(phone).replace(/\D/g, ""); if (digits.startsWith("237") && digits.length === 12) return `+${digits}`; if (digits.length === 9) return `+237${digits}`; return ""; }
function validateCameroonPhone(phone = "") { const normalized = normalizeCameroonPhone(phone); if (!normalized) return "Numéro de téléphone invalide."; if (!/^\+237[2368][0-9]{8}$/.test(normalized)) return "Numéro camerounais invalide."; return ""; }
describe("Cameroon phone validation", () => {
  test("accepte un numéro local de 9 chiffres", () => expect(validateCameroonPhone("690000000")).toBe(""));
  test("accepte un numéro avec +237", () => expect(validateCameroonPhone("+237690000000")).toBe(""));
  test("refuse un numéro trop court", () => expect(validateCameroonPhone("69000")).toBe("Numéro de téléphone invalide."));
  test("refuse les lettres", () => expect(validateCameroonPhone("abcdefghi")).toBe("Numéro de téléphone invalide."));
  test("normalise correctement le téléphone", () => expect(normalizeCameroonPhone("690 000 000")).toBe("+237690000000"));
});
