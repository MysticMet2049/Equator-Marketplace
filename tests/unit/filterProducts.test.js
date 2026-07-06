import { describe, expect, test } from "vitest";

function filterProducts(products = [], filters = {}) {
  const search = String(filters.search || "").trim().toLowerCase();
  const category = String(filters.category || "").trim().toLowerCase();

  return products.filter((product) => {
    const name = String(product.name || product.title || "").toLowerCase();
    const productCategory = String(product.category || "").toLowerCase();

    const matchesSearch = !search || name.includes(search);
    const matchesCategory =
      !category || category === "tout" || productCategory === category;

    return matchesSearch && matchesCategory;
  });
}

describe("filterProducts", () => {
  const products = [
    {
      name: "iPhone 13 Pro Max",
      category: "Electronique",
    },
    {
      name: "Parfum Dior",
      category: "Beaute",
    },
    {
      name: "Valise rigide rose",
      category: "Mode",
    },
  ];

  test("retourne tous les produits si aucun filtre n'est applique", () => {
    expect(filterProducts(products)).toHaveLength(3);
  });

  test("filtre les produits par recherche", () => {
    const result = filterProducts(products, {
      search: "iphone",
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("iPhone 13 Pro Max");
  });

  test("filtre les produits par categorie", () => {
    const result = filterProducts(products, {
      category: "Beaute",
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Parfum Dior");
  });

  test("retourne une liste vide si aucun produit ne correspond", () => {
    const result = filterProducts(products, {
      search: "ordinateur gamer",
    });

    expect(result).toHaveLength(0);
  });
});
