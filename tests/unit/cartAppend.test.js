import { describe, expect, test } from "vitest";

function getCartItemKey(item = {}) {
  const productId = item.productId ?? item.id ?? item.product?.id;
  const storeId = item.storeId ?? item.store?.id ?? "default-store";
  return `${storeId}:${productId}`;
}
function addItemToCart(items = [], newItem = {}) {
  const quantityToAdd = Number(newItem.quantity || 1);
  const newKey = getCartItemKey(newItem);
  const exists = items.some((item) => getCartItemKey(item) === newKey);
  if (!exists) return [...items, { ...newItem, quantity: quantityToAdd }];
  return items.map((item) => getCartItemKey(item) === newKey ? { ...item, quantity: Number(item.quantity || 0) + quantityToAdd } : item);
}

describe("cart append logic", () => {
  test("ajoute plusieurs produits différents sans remplacer le panier", () => {
    let cart = [];
    cart = addItemToCart(cart, { productId: 1, storeId: 10, name: "iPhone", quantity: 1 });
    cart = addItemToCart(cart, { productId: 2, storeId: 10, name: "Samsung", quantity: 1 });
    expect(cart).toHaveLength(2);
    expect(cart.map((item) => item.name)).toEqual(["iPhone", "Samsung"]);
  });
  test("augmente la quantité si le même produit du même store est ajouté", () => {
    let cart = [{ productId: 1, storeId: 10, name: "iPhone", quantity: 1 }];
    cart = addItemToCart(cart, { productId: 1, storeId: 10, name: "iPhone", quantity: 2 });
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(3);
  });
  test("garde deux lignes si le même produit vient de deux stores différents", () => {
    let cart = [];
    cart = addItemToCart(cart, { productId: 1, storeId: 10, name: "iPhone Store A", quantity: 1 });
    cart = addItemToCart(cart, { productId: 1, storeId: 20, name: "iPhone Store B", quantity: 1 });
    expect(cart).toHaveLength(2);
  });
});
