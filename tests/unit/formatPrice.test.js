import { describe, expect, test } from "vitest";

function formatPrice(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    return "0 FCFA";
  }

  return `${amount.toLocaleString("fr-FR")} FCFA`;
}

function normalizeSpaces(value) {
  return value.replace(/\u202F|\u00A0/g, " ");
}

describe("formatPrice", () => {
  test("formate un prix normal en FCFA", () => {
    expect(normalizeSpaces(formatPrice(82300))).toBe("82 300 FCFA");
  });

  test("retourne 0 FCFA si la valeur est null", () => {
    expect(formatPrice(null)).toBe("0 FCFA");
  });

  test("retourne 0 FCFA si la valeur est négative", () => {
    expect(formatPrice(-5000)).toBe("0 FCFA");
  });

  test("formate une valeur string numérique", () => {
    expect(normalizeSpaces(formatPrice("5000"))).toBe("5 000 FCFA");
  });
});