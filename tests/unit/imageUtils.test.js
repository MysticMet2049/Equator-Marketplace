import { describe, expect, test } from "vitest";

function getProductAssetId(product = {}) {
  return (
    product.coverAssetId ||
    product.mainImageAssetId ||
    product.imageAssetId ||
    product.assetId ||
    product.assetIds?.[0] ||
    product?._raw?.coverAssetId ||
    product?._raw?.assetId ||
    product?._raw?.imageAssetId ||
    product?._raw?.productPromoSummaryDto?.coverAssetId ||
    product?._raw?.productHeaderSummaryDto?.coverAssetId ||
    null
  );
}

function hasProductImage(product = {}) {
  return Boolean(getProductAssetId(product) || product.image || product.imageUrl);
}

describe("image utils", () => {
  test("recupere coverAssetId", () => {
    const product = {
      coverAssetId: 123,
    };

    expect(getProductAssetId(product)).toBe(123);
  });

  test("recupere le premier assetId dans assetIds", () => {
    const product = {
      assetIds: [45, 46, 47],
    };

    expect(getProductAssetId(product)).toBe(45);
  });

  test("recupere assetId depuis _raw", () => {
    const product = {
      _raw: {
        assetId: 999,
      },
    };

    expect(getProductAssetId(product)).toBe(999);
  });

  test("retourne null si aucune image n'existe", () => {
    expect(getProductAssetId({})).toBe(null);
  });

  test("detecte si un produit possede une image", () => {
    expect(hasProductImage({ coverAssetId: 10 })).toBe(true);
  });

  test("detecte si un produit n'a aucune image", () => {
    expect(hasProductImage({})).toBe(false);
  });
});
