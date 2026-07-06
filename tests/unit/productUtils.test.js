import { describe, expect, test } from "vitest";

function getProductId(product = {}) {
  return (
    product.productId ||
    product.id ||
    product.refId ||
    product.promoId ||
    product.summaryId ||
    product?._raw?.productId ||
    product?._raw?.id ||
    null
  );
}

function getProductName(product = {}) {
  return (
    product.name ||
    product.title ||
    product.label ||
    product.designation ||
    product?._raw?.name ||
    product?._raw?.title ||
    "Produit sans nom"
  );
}

describe("product utils", () => {
  test("recupere productId en priorite", () => {
    const product = {
      productId: 16423,
      id: 10,
    };

    expect(getProductId(product)).toBe(16423);
  });

  test("recupere id si productId est absent", () => {
    const product = {
      id: 80,
    };

    expect(getProductId(product)).toBe(80);
  });

  test("retourne null si aucun identifiant n'existe", () => {
    expect(getProductId({})).toBe(null);
  });

  test("recupere le nom du produit", () => {
    const product = {
      name: "DIOR FAHRENHEIT EDT 50ML VAPO",
    };

    expect(getProductName(product)).toBe("DIOR FAHRENHEIT EDT 50ML VAPO");
  });

  test("retourne un nom par defaut si le produit n'a pas de nom", () => {
    expect(getProductName({})).toBe("Produit sans nom");
  });
});
