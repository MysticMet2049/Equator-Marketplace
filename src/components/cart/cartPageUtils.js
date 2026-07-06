// Fonctions utilitaires du panier : elles centralisent les conversions et les libellés.
export const RECOMMENDED_PRODUCTS = [];

// Récupère l'identifiant du compte client peu importe le nom utilisé par le backend.
export const getCustomerAccountId = (account) =>
  account?.id ??
  account?.customerAccountId ??
  account?.accountId ??
  account?.customerAccount?.id ??
  account?.storecardCustomerAccountId ??
  account?.storecardCustomerAccount?.id ??
  null;

// Prépare le nom affiché dans la modal de sélection du compte client.
export const getCustomerAccountLabel = (account) => {
  const person =
    account?.personalInfo ?? account?.customer ?? account?.customerAccount ?? {};

  return (
    account?.fullName ||
    person?.fullName ||
    [person?.firstName, person?.lastName].filter(Boolean).join(" ") ||
    account?.name ||
    account?.label ||
    account?.phoneNumber ||
    account?.principalPhoneNumber?.phoneNumber ||
    `Compte client #${getCustomerAccountId(account) ?? ""}`
  );
};

// Convertit les items du contexte panier vers le format simple consommé par l'interface.
export const normalizeCartItems = (cartItems = []) =>
  cartItems.map((item) => {
    const product = item.product || {};

    return {
      id: item.id,
      productId: item.productId,
      name: product.name || item.name || "Produit",
      store: product.storeName || product.store || "",
      image: product.image || item.image,
      price: item.price || product.price || 0,
      qty: item.quantity || 1,
    };
  });

// Formate un montant en FCFA pour toutes les zones du panier.
export const formatPrice = (value) =>
  `${Number(value || 0).toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
  })} FCFA`;
