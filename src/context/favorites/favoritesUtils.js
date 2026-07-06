// Fonctions utilitaires pures du module favoris.
export const ROLLBACK_ON_ERROR =
  String(import.meta.env.VITE_FAVORITES_ROLLBACK_ON_ERROR || "false") === "true";

// Normalise tout identifiant produit en chaîne stable.
export function normalizeId(value) {
  return value === undefined || value === null || value === "" ? null : String(value);
}

// Extrait l'identifiant produit, même si l'objet vient d'un DTO backend différent.
export function getProductId(productOrId) {
  if (typeof productOrId === "string" || typeof productOrId === "number") {
    return normalizeId(productOrId);
  }

  return normalizeId(
    productOrId?.productId ||
      productOrId?.refId ||
      productOrId?.id ||
      productOrId?.promoId ||
      productOrId?.summaryId ||
      productOrId?.productPromoSummaryDto?.productId ||
      productOrId?.productPromoHeaderSummaryDto?.productId ||
      null
  );
}

// Détecte l'état favori déjà présent sur certains objets produit.
export function extractIsFavorite(productOrId) {
  if (!productOrId || typeof productOrId !== "object") return false;

  return Boolean(
    productOrId.isFavorite ||
      productOrId.favorite ||
      productOrId.userPreferenceSummaryDto?.isFavorite ||
      productOrId.userPreference?.isFavorite
  );
}

// Prépare un snapshot local quand l'API n'a pas encore rechargé la liste.
export function normalizeFavoriteSnapshot(productOrId, productId) {
  if (!productOrId || typeof productOrId !== "object") {
    return {
      id: productId,
      productId,
      name: "Produit favori",
      isFavorite: true,
      userPreferenceSummaryDto: {
        refId: productId,
        refType: "PRODUCT",
        isFavorite: true,
      },
    };
  }

  return {
    ...productOrId,
    id: productId,
    productId,
    isFavorite: true,
    userPreferenceSummaryDto: {
      ...(productOrId.userPreferenceSummaryDto || {}),
      refId: productId,
      refType: "PRODUCT",
      isFavorite: true,
    },
  };
}

// Émet un événement global pour synchroniser les autres composants de la page.
export function dispatchFavoritesChanged({ productId, favorite, products }) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("equator:favorites-changed", {
      detail: { productId, favorite, products },
    })
  );
}
