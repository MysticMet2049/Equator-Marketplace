import { describe, expect, test } from "vitest";

function calculateCartTotal(items = []) {
  return items.reduce((total, item) => {
    const price = Number(item.price || item.unitPrice || 0);
    const quantity = Number(item.quantity || 0);

    return total + price * quantity;
  }, 0);
}

describe("calculateCartTotal", () => {
  test("calcule le total du panier", () => {
    const items = [
      { price: 1000, quantity: 2 },
      { price: 500, quantity: 3 },
    ];

    expect(calculateCartTotal(items)).toBe(3500);
  });

  test("retourne 0 si le panier est vide", () => {
    expect(calculateCartTotal([])).toBe(0);
  });

  test("ignore les prix absents", () => {
    const items = [
      { price: 1000, quantity: 2 },
      { quantity: 5 },
    ];

    expect(calculateCartTotal(items)).toBe(2000);
  });

  test("supporte unitPrice au lieu de price", () => {
    const items = [{ unitPrice: 2500, quantity: 2 }];

    expect(calculateCartTotal(items)).toBe(5000);
  });
});
