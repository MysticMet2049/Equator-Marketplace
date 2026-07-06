import { useState, useCallback, useMemo } from "react";
import cartApi from "../../api/cartApi";
import customerAccountApi from "../../api/customerAccountApi";
import customerApi from "../../api/customerApi";
import productApi from "../../api/productApi";
import { ApiError } from "../../api/httpClient";
import { useAuth } from "../AuthContext";

// Hook interne : il regroupe la logique complète du panier pour alléger CartContext.jsx.


const ACTIVE_CART_STORE_KEY = "equator_active_cart_store_id";
const ACTIVE_CART_SNAPSHOT_KEY = "equator_active_cart_snapshot";
const CURRENT_CUSTOMER_KEY = "equator_current_customer";

const activeCartStoreStorage = {
  get: () => localStorage.getItem(ACTIVE_CART_STORE_KEY),
  set: (storeId) => {
    if (storeId) {
      localStorage.setItem(ACTIVE_CART_STORE_KEY, String(storeId));
    }
  },
  remove: () => localStorage.removeItem(ACTIVE_CART_STORE_KEY),
};

const cartSnapshotStorage = {
  get: () => {
    try {
      const raw = localStorage.getItem(ACTIVE_CART_SNAPSHOT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  set: (cart) => {
    if (cart) {
      localStorage.setItem(ACTIVE_CART_SNAPSHOT_KEY, JSON.stringify(cart));
    }
  },
  remove: () => localStorage.removeItem(ACTIVE_CART_SNAPSHOT_KEY),
};

const currentCustomerStorage = {
  get: () => {
    try {
      const raw = localStorage.getItem(CURRENT_CUSTOMER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  set: (customer) => {
    if (customer) {
      localStorage.setItem(CURRENT_CUSTOMER_KEY, JSON.stringify(customer));
    }
  },
  remove: () => localStorage.removeItem(CURRENT_CUSTOMER_KEY),
};

const getErrorMessage = (error) =>
  String(
    error?.message ||
      error?.data?.message ||
      error?.details?.message ||
      error?.raw?.message ||
      error?.response?.message ||
      ""
  ).toLowerCase();

const getBackendSubmitMessage = (error) => {
  const fieldErrors =
    error?.data?.content?.fieldErrors ||
    error?.raw?.content?.fieldErrors ||
    error?.content?.fieldErrors ||
    [];

  if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
    return fieldErrors
      .map((fieldError) => fieldError?.message)
      .filter(Boolean)
      .join("\n");
  }

  return (
    error?.data?.content?.message ||
    error?.raw?.content?.message ||
    error?.content?.message ||
    error?.data?.message ||
    error?.raw?.message ||
    error?.message ||
    "Impossible de valider le panier."
  );
};

const shouldAskCustomerAccountConfirmation = (
  error,
  { missingCustomerAccount = false } = {}
) => {
  const message = getErrorMessage(error);
  const status = Number(error?.status);

  const hasConfirmationMessage =
    message.includes("compte client") ||
    message.includes("customer account") ||
    message.includes("customeraccount") ||
    message.includes("enseigne") ||
    message.includes("organisation") ||
    message.includes("confirmation") ||
    message.includes("confirmer");

  if ([400, 409, 412].includes(status) && hasConfirmationMessage) {
    return true;
  }

  // Le backend renvoie actuellement 500 au lieu d'une erreur métier
  // quand le compte client de l'enseigne est absent.
  return status === 500 && missingCustomerAccount;
};

const getGenericConfirmationMessage = () =>
  "Vous n'avez pas de compte client dans cette enseigne. En confirmant, un compte sera créé dans l'enseigne dès que votre commande sera validée.";

const isAlreadyInCartError = (error) => {
  const message = getErrorMessage(error);

  return (
    error?.status === 412 ||
    error?.httpStatusCode === "PRECONDITION_FAILED" ||
    error?.raw?.httpStatusCode === "PRECONDITION_FAILED" ||
    error?.data?.httpStatusCode === "PRECONDITION_FAILED" ||
    message.includes("déja présent") ||
    message.includes("déjà présent") ||
    message.includes("deja present") ||
    message.includes("already") ||
    message.includes("present dans votre panier")
  );
};


const isNoActiveCartError = (error) => {
  const message = getErrorMessage(error);

  return (
    error?.status === 404 &&
    (message.includes("panier actif") ||
      message.includes("point de vente") ||
      message.includes("no active cart"))
  );
};

const getProductPrice = (product) =>
  product?.price ??
  product?.salesPrice ??
  product?.amount ??
  product?.unitPrice ??
  product?.product?.price ??
  0;

const getProductName = (product, fallback = "Produit") =>
  product?.name ||
  product?.title ||
  product?.designation ||
  product?.label ||
  product?.product?.name ||
  fallback;

const getProductImage = (product) =>
  product?.image ||
  product?.imageUrl ||
  product?.mainImage ||
  product?.thumbnail ||
  product?.product?.image ||
  null;

const sameStore = (cart, storeId) => {
  if (!cart || !storeId || !cart.storeId) return true;
  return String(cart.storeId) === String(storeId);
};

const hasProduct = (cart, productId) => {
  const items = cart?.items ?? [];
  return items.some((item) => String(item.productId) === String(productId));
};

const getBestExistingCart = (currentCart, storeId = null) => {
  if (currentCart && sameStore(currentCart, storeId)) return currentCart;

  const cachedCart = cartSnapshotStorage.get();
  if (cachedCart && sameStore(cachedCart, storeId)) return cachedCart;

  // Quand un store précis est demandé pour rafraîchir ou valider le panier,
  // on évite de réutiliser un ancien panier appartenant à une autre enseigne.
  // Sinon on obtient un payload du type storeId=80 avec des items storeId=6.
  if (storeId) return null;

  return currentCart || cachedCart || null;
};

const getAppendableExistingCart = (currentCart) => {
  // Pour l'ajout depuis les cartes produit, on ne doit pas filtrer le panier par
  // storeId. Sinon l'ajout d'un produit venant d'une autre enseigne remplace le
  // snapshot local au lieu de l'ajouter à la liste visible du panier.
  return currentCart || cartSnapshotStorage.get() || null;
};

const getSafeQuantity = (value, fallback = 1) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : fallback;
};

const getCartItemName = (item, fallback = "Produit") =>
  item?.name ||
  item?.title ||
  item?.designation ||
  item?.label ||
  item?.product?.name ||
  item?.catalogProduct?.name ||
  fallback;

const getCartItemImage = (item) =>
  item?.image ||
  item?.imageUrl ||
  item?.mainImage ||
  item?.thumbnail ||
  item?.product?.image ||
  item?.product?.imageUrl ||
  item?.product?.mainImage ||
  item?.product?.thumbnail ||
  item?.catalogProduct?.image ||
  item?.catalogProduct?.imageUrl ||
  null;

const buildFallbackCartItem = (
  productId,
  storeId,
  product = null,
  response = null,
  quantity = 1
) => {
  const responseProduct = response?.product || response?.catalogProduct || null;
  const safeProduct = product || responseProduct || {};
  const requestedQuantity = getSafeQuantity(
    response?.quantity ?? response?.qty ?? quantity,
    1
  );

  const itemId =
    response?.shoppingCartItemId ??
    response?.cartItemId ??
    response?.itemId ??
    response?.salesItemId ??
    response?.saleItemId ??
    ((response?.productId || response?.product?.id || response?.catalogProduct?.id)
      ? response?.id
      : undefined) ??
    `local-${storeId}-${productId}`;

  const price =
    response?.price ??
    response?.salesPrice ??
    response?.finalSalesPrice ??
    response?.currentListPrice ??
    response?.unitPrice ??
    getProductPrice(safeProduct);

  const image = response?.image ?? getProductImage(safeProduct);
  const name = response?.name ?? getProductName(safeProduct);

  return {
    id: itemId,
    productId: response?.productId ?? response?.product?.id ?? productId,
    storeId: response?.storeId ?? response?.store?.id ?? safeProduct?.storeId ?? storeId,
    quantity: requestedQuantity,
    qty: requestedQuantity,
    price,
    salesPrice: price,
    image,
    name,
    store: response?.storeName ?? response?.store?.name ?? safeProduct?.storeName ?? "",
    product: {
      ...safeProduct,
      ...responseProduct,
      id: safeProduct?.id ?? responseProduct?.id ?? productId,
      productId,
      name,
      image,
      price,
    },
  };
};

const getCartItemProductIdForMerge = (item) =>
  item?.productId ??
  item?.product?.productId ??
  item?.product?.id ??
  item?.catalogProduct?.productId ??
  item?.catalogProduct?.id ??
  null;

const getCartItemStoreIdForMerge = (item, fallbackStoreId = null) =>
  item?.storeId ??
  item?.store?.id ??
  item?.product?.storeId ??
  item?.product?.store?.id ??
  item?.catalogProduct?.storeId ??
  item?.catalogProduct?.store?.id ??
  fallbackStoreId ??
  null;

const getCartItemMergeKey = (item, fallbackStoreId = null) => {
  const productId = getCartItemProductIdForMerge(item);
  const itemStoreId = getCartItemStoreIdForMerge(item, fallbackStoreId);

  if (productId) {
    return `${itemStoreId ?? "unknown-store"}:${productId}`;
  }

  return String(item?.id ?? item?.shoppingCartItemId ?? item?.cartItemId ?? "unknown-item");
};

const mergeCartItem = (
  previousCart,
  item,
  storeId,
  { quantityMode = "increment" } = {}
) => {
  const previousItems = previousCart?.items ?? [];
  const itemKey = getCartItemMergeKey(item, storeId);
  let found = false;

  const items = previousItems.map((existing) => {
    const existingKey = getCartItemMergeKey(existing, existing.storeId ?? storeId);
    if (existingKey !== itemKey) return existing;

    found = true;

    const existingQuantity = getSafeQuantity(existing.quantity ?? existing.qty, 0);
    const incomingQuantity = getSafeQuantity(item.quantity ?? item.qty, 1);
    const nextQuantity =
      quantityMode === "replace"
        ? incomingQuantity
        : existingQuantity + incomingQuantity;

    return {
      ...existing,
      ...item,
      id: existing.id ?? item.id,
      productId: existing.productId ?? item.productId,
      storeId: existing.storeId ?? item.storeId ?? storeId,
      quantity: nextQuantity,
      qty: nextQuantity,
      price: item.price ?? existing.price,
      salesPrice: item.salesPrice ?? existing.salesPrice ?? item.price ?? existing.price,
      name: item.name ?? existing.name ?? getCartItemName(existing),
      image: item.image ?? existing.image ?? getCartItemImage(existing),
      store: item.store ?? existing.store,
      product: {
        ...(existing.product ?? {}),
        ...(item.product ?? {}),
      },
    };
  });

  const nextItems = found ? items : [...previousItems, item];

  return {
    ...(previousCart ?? {}),
    id:
      previousCart?.id ??
      item.shoppingCartId ??
      item.cartId ??
      item.shoppingCart?.id ??
      `${storeId}-local`,
    storeId: previousCart?.storeId ?? storeId,
    items: nextItems,
  };
};

const normalizeCartAfterAdd = (
  response,
  productId,
  storeId,
  product = null,
  previousCart = null,
  quantity = 1,
  { responseItemsQuantityMode = "replace", fallbackQuantityMode = "increment" } = {}
) => {
  const responseItems =
    (Array.isArray(response?.items) && response.items) ||
    (Array.isArray(response?.cartItems) && response.cartItems) ||
    (Array.isArray(response?.salesItems) && response.salesItems) ||
    [];

  const baseCart = {
    ...(previousCart ?? {}),
    id:
      previousCart?.id ??
      response?.shoppingCartId ??
      response?.cartId ??
      response?.shoppingCart?.id ??
      (response?.items || response?.cartItems || response?.salesItems
        ? response?.id
        : undefined) ??
      previousCart?.id,
    storeId: previousCart?.storeId ?? response?.storeId ?? storeId,
    items: previousCart?.items ?? [],
  };

  if (responseItems.length > 0) {
    return responseItems.reduce((nextCart, rawItem) => {
      const item = buildFallbackCartItem(
        productId,
        storeId,
        product,
        rawItem,
        quantity
      );

      return mergeCartItem(nextCart, item, storeId, {
        quantityMode: responseItemsQuantityMode,
      });
    }, baseCart);
  }

  const item = buildFallbackCartItem(productId, storeId, product, response, quantity);
  return mergeCartItem(baseCart, item, storeId, {
    quantityMode: fallbackQuantityMode,
  });
};


const mergeIncomingCartWithLatest = (latestCart, incomingCart, storeId) => {
  const incomingItems = incomingCart?.items ?? [];
  const baseCart = getAppendableExistingCart(latestCart) ?? {
    id: incomingCart?.id ?? `${storeId}-local`,
    storeId: incomingCart?.storeId ?? storeId,
    items: [],
  };

  const mergedCart = incomingItems.reduce(
    (nextCart, item) =>
      mergeCartItem(nextCart, item, item.storeId ?? storeId, {
        quantityMode: "replace",
      }),
    baseCart
  );

  return {
    ...baseCart,
    ...mergedCart,
    id: baseCart?.id ?? mergedCart?.id ?? incomingCart?.id,
    // On conserve le store principal du panier local pour ne pas écraser le
    // snapshot lorsqu'un produit d'une autre enseigne est ajouté depuis la card.
    storeId: baseCart?.storeId ?? mergedCart?.storeId ?? incomingCart?.storeId ?? storeId,
    items: mergedCart.items ?? [],
  };
};

const toNumberOrUndefined = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
};

const getCustomerIdFromUser = (user) =>
  toNumberOrUndefined(
    user?.customerId ??
      user?.customer?.id ??
      user?.storecardCustomerId ??
      user?.storecardCustomer?.id
  );

const getCustomerIdFromCustomer = (customer) =>
  toNumberOrUndefined(customer?.id ?? customer?.customerId ?? customer?.customer?.id);

const normalizeMobileNumber = (value) => {
  const raw = String(value || "").trim();

  if (!raw) return "";

  if (raw.startsWith("+")) {
    const digits = raw.slice(1).replace(/\D/g, "");
    return digits ? `+${digits}` : "";
  }

  const digits = raw.replace(/\D/g, "");

  if (!digits) return "";
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (digits.startsWith("237")) return `+${digits}`;
  if (digits.length === 9 && digits.startsWith("6")) return `+237${digits}`;

  return `+${digits}`;
};

const getPhoneNumberFromCustomerOrUser = (customer, user) =>
  normalizeMobileNumber(
    customer?.user?.mobileNumber ||
      customer?.mobileNumber ||
      customer?.phoneNumber ||
      customer?.address?.principalPhoneNumber?.phoneNumber ||
      customer?.user?.address?.principalPhoneNumber?.phoneNumber ||
      user?.mobileNumber ||
      user?.phoneNumber ||
      user?.phone ||
      user?.address?.principalPhoneNumber?.phoneNumber ||
      ""
  );

const isNoRegisteredAccountForPhoneError = (error) => {
  const message = getErrorMessage(error);
  const status = Number(error?.status);

  return (
    status === 412 &&
    (message.includes("aucun compte client") ||
      message.includes("aucun compte") ||
      message.includes("no customer account") ||
      message.includes("not found"))
  );
};

const isBackendId = (value) => {
  const numberValue = toNumberOrUndefined(value);
  return numberValue !== undefined && !String(value).startsWith("local-");
};

const getBackendCartId = (sourceCart) => {
  const candidate =
    sourceCart?.id ??
    sourceCart?.shoppingCartId ??
    sourceCart?.cartId ??
    sourceCart?.shoppingCart?.id;

  return isBackendId(candidate) ? Number(candidate) : undefined;
};

const getBackendCartItemId = (item) => {
  const candidate =
    item?.id ??
    item?.shoppingCartItemId ??
    item?.cartItemId ??
    item?.itemId ??
    item?.salesItemId ??
    item?.saleItemId ??
    item?.shoppingCartItem?.id;

  return isBackendId(candidate) ? Number(candidate) : undefined;
};

const getDeclaredCartStoreId = (sourceCart) =>
  toNumberOrUndefined(
    sourceCart?.storeId ??
      sourceCart?.store?.id ??
      sourceCart?.pointOfSaleId ??
      sourceCart?._raw?.storeId ??
      sourceCart?._raw?.store?.id
  );

const getCartItems = (sourceCart) =>
  Array.isArray(sourceCart?.items)
    ? sourceCart.items
    : Array.isArray(sourceCart?.cartItems)
      ? sourceCart.cartItems
      : Array.isArray(sourceCart?.salesItems)
        ? sourceCart.salesItems
        : [];

const getCartItemStoreId = (item) =>
  toNumberOrUndefined(
    item?.storeId ??
      item?.store?.id ??
      item?.store?.storeId ??
      item?.product?.storeId ??
      item?.product?.store?.id ??
      item?.catalogProduct?.storeId ??
      item?.catalogProduct?.store?.id ??
      item?._raw?.storeId ??
      item?._raw?.store?.id ??
      item?.product?._raw?.storeId ??
      item?.product?._raw?.store?.id ??
      item?.product?._raw?.productPromoSummaryDto?.storeId ??
      item?.product?._raw?.productPromoHeaderSummaryDto?.storeId ??
      item?.product?._raw?.clientCatalogProductSummaryDto?.storeId ??
      item?.product?._raw?.catalogProductSummaryDto?.storeId ??
      item?.product?._raw?.productHeaderSummaryDto?.storeId
  );

const getDistinctCartItemStoreIds = (items = []) => {
  const ids = items.map(getCartItemStoreId).filter(Boolean);

  return [...new Set(ids.map(String))].map(Number);
};

const getCartStoreIdFromItems = (items = []) => {
  const storeIds = getDistinctCartItemStoreIds(items);

  if (storeIds.length === 1) return storeIds[0];
  if (storeIds.length > 1) return null;

  return undefined;
};

const getCartStoreId = (sourceCart) => {
  const itemStoreId = getCartStoreIdFromItems(getCartItems(sourceCart));

  // Si les articles indiquent tous la même enseigne, ils sont la source de vérité.
  // Cela corrige le cas où un vieux snapshot garde storeId=80 alors que les items
  // appartiennent réellement à storeId=6.
  if (itemStoreId) return itemStoreId;

  // Si plusieurs enseignes sont présentes dans le même panier, on bloque plus loin
  // avec un message clair au lieu d'envoyer un payload incohérent au backend.
  if (itemStoreId === null) return null;

  return getDeclaredCartStoreId(sourceCart);
};

const shouldReuseCartIdForStore = (sourceCart, storeId) => {
  const declaredStoreId = getDeclaredCartStoreId(sourceCart);

  if (!declaredStoreId || !storeId) return true;

  return String(declaredStoreId) === String(storeId);
};

const buildSubmitCartPayload = (sourceCart, customerId, customerAccountId) => {
  const sourceItems = getCartItems(sourceCart);
  const storeId = getCartStoreId(sourceCart);
  const cartId = shouldReuseCartIdForStore(sourceCart, storeId)
    ? getBackendCartId(sourceCart)
    : undefined;

  const cartItems = sourceItems
    .map((item) => {
      const itemId = getBackendCartItemId(item);
      const productId = toNumberOrUndefined(
        item.productId ??
          item.product?.productId ??
          item.product?.id ??
          item.catalogProduct?.productId ??
          item.catalogProduct?.id
      );
      const itemStoreId = getCartItemStoreId(item) ?? storeId;
      const quantity = Number(item.quantity ?? item.qty ?? 1);
      const salesPrice = Number(
        item.salesPrice ??
          item.finalSalesPrice ??
          item.currentListPrice ??
          item.price ??
          item.unitPrice ??
          item.amount ??
          item.product?.price ??
          item.catalogProduct?.price ??
          0
      );

      if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
        return null;
      }

      if (storeId && itemStoreId && String(itemStoreId) !== String(storeId)) {
        console.warn("[CartContext] Item ignoré car son storeId diffère du panier.", {
          productId,
          cartStoreId: storeId,
          itemStoreId,
        });
        return null;
      }

      return {
        ...(itemId ? { id: itemId } : {}),
        productId,
        customerId,
        storeId: storeId ?? itemStoreId,
        quantity,
        salesPrice: Number.isFinite(salesPrice) ? salesPrice : 0,
        note: item.note ?? "",
      };
    })
    .filter(Boolean);

  return {
    ...(cartId ? { id: cartId } : {}),
    customerId,
    ...(customerAccountId ? { customerAccountId } : {}),
    storeId,
    note: sourceCart?.note ?? "",
    cartItems,
  };
};

const isValidSubmitCartPayload = (payload) =>
  Boolean(
    payload?.customerId &&
      payload?.storeId &&
      Array.isArray(payload?.cartItems) &&
      payload.cartItems.length > 0
  );

const isInactiveSubmittedCart = (candidateCart) => {
  const state = String(
    candidateCart?.shoppingCartState ||
      candidateCart?.cartState ||
      candidateCart?.orderStatus ||
      candidateCart?.status ||
      ""
  ).toUpperCase();

  return [
    "SUBMITTED",
    "VALIDATED",
    "COMPLETED",
    "CLOSED",
    "CANCELLED",
    "CANCELED",
    "DELETED",
  ].some((word) => state.includes(word));
};

const hasBackendCartId = (sourceCart) => Boolean(getBackendCartId(sourceCart));

const hasBackendCartItemIds = (sourceCart) =>
  getCartItems(sourceCart).some((item) => Boolean(getBackendCartItemId(item)));

const mergeBackendCartWithSource = (backendCart, sourceCart) => {
  if (!backendCart) return sourceCart;

  const backendItems = getCartItems(backendCart);
  const sourceItems = getCartItems(sourceCart);

  return {
    ...sourceCart,
    ...backendCart,
    storeId: backendCart.storeId ?? sourceCart?.storeId,
    items: backendItems.length ? backendItems : sourceItems,
  };
};

const findBackendCartForSubmit = async (
  storeId,
  customerId,
  customerAccountId
) => {
  const found = await cartApi.findCartByStoreAndCustomer(storeId, customerId);

  if (found && !isInactiveSubmittedCart(found)) {
    return found;
  }

  const searched = await cartApi
    .searchCartsByCustomerAndStore({
      customerId,
      customerAccountId,
      storeId,
    })
    .catch((err) => {
      console.warn("[CartContext] searchCartsByCustomerAndStore failed:", err);
      return [];
    });

  return (
    searched.find(
      (candidate) =>
        String(candidate?.storeId ?? "") === String(storeId) &&
        !isInactiveSubmittedCart(candidate)
    ) ||
    searched.find((candidate) => !isInactiveSubmittedCart(candidate)) ||
    null
  );
};

const createBackendCartFromFallback = async (
  submitPayload,
  sourceCart,
  customerAccountId
) => {
  const created = await cartApi.createCart({
    customerId: submitPayload.customerId,
    ...(customerAccountId ? { customerAccountId } : {}),
    storeId: submitPayload.storeId,
    note: submitPayload.note ?? "",
    cartItems: submitPayload.cartItems,
  });

  return mergeBackendCartWithSource(created, {
    ...sourceCart,
    id: created?.id ?? sourceCart?.id,
    storeId: submitPayload.storeId,
  });
};

const ensureBackendCartForSubmit = async (
  sourceCart,
  customerId,
  customerAccountId
) => {
  const basePayload = buildSubmitCartPayload(
    sourceCart,
    customerId,
    customerAccountId
  );

  if (!isValidSubmitCartPayload(basePayload)) {
    return basePayload;
  }

  let backendCart = null;

  try {
    backendCart = await findBackendCartForSubmit(
      basePayload.storeId,
      customerId,
      customerAccountId
    );
  } catch (err) {
    console.warn("[CartContext] findBackendCartForSubmit failed:", err);
  }

  if (!hasBackendCartId(backendCart)) {
    try {
      backendCart = await createBackendCartFromFallback(
        basePayload,
        sourceCart,
        customerAccountId
      );
    } catch (err) {
      /**
       * If create fails because the cart already exists, try to recover the
       * real cart once more through search/find. If it still cannot be found,
       * keep the base payload so the backend returns a clear validation error.
       */
      console.warn("[CartContext] createBackendCartFromFallback failed:", err);

      backendCart = await findBackendCartForSubmit(
        basePayload.storeId,
        customerId,
        customerAccountId
      ).catch(() => null);
    }
  }

  if (hasBackendCartId(backendCart) && !hasBackendCartItemIds(backendCart)) {
    const refreshedBackendCart = await findBackendCartForSubmit(
      basePayload.storeId,
      customerId,
      customerAccountId
    ).catch((err) => {
      console.warn("[CartContext] refresh backend cart with item ids failed:", err);
      return null;
    });

    if (hasBackendCartId(refreshedBackendCart)) {
      backendCart = mergeBackendCartWithSource(refreshedBackendCart, backendCart);
    }
  }

  console.log(
    "[BACKEND CART BEFORE SUBMIT SYNC]",
    JSON.stringify(backendCart, null, 2)
  );

  const syncedCart = mergeBackendCartWithSource(backendCart, sourceCart);
  const syncedPayload = buildSubmitCartPayload(
    syncedCart,
    customerId,
    customerAccountId
  );

  /**
   * If the backend returned only EntitySummaryDto from /create, the cart id is
   * still important for /submit. Preserve it even if mapCartFromApi returned
   * an object without cartItems.
   */
  if (isBackendId(backendCart?.id) && !syncedPayload.id) {
    syncedPayload.id = Number(backendCart.id);
  }

  console.log(
    "[SUBMIT SHOPPING CART DTO]",
    JSON.stringify(syncedPayload, null, 2)
  );

  return syncedPayload;
};

const submitShoppingCartPayload = async (shoppingCartDto) =>
  cartApi.submitCart(shoppingCartDto);

const getFirstCustomerAccountId = (accounts = []) => {
  const account = Array.isArray(accounts) ? accounts[0] : accounts;

  return toNumberOrUndefined(
    account?.id ??
      account?.customerAccountId ??
      account?.accountId ??
      account?.customerAccount?.id ??
      account?.storecardCustomerAccountId ??
      account?.storecardCustomerAccount?.id ??
      account?.card?.customerAccountId ??
      account?.card?.customerAccount?.id
  );
};

export function useCartProviderValue() {
  const { user, isAuthenticated } = useAuth();

  const [cart, setCart] = useState(() => cartSnapshotStorage.get());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cartItems = cart?.items ?? [];

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.quantity ?? 0), 0),
    [cartItems]
  );

  const cartTotal = useMemo(
    () =>
      cartItems.reduce((sum, item) => {
        const quantity = getSafeQuantity(item.quantity ?? item.qty, 0);
        return sum + (item.price ?? item.salesPrice ?? 0) * quantity;
      }, 0),
    [cartItems]
  );

  const requireAuth = useCallback(() => {
    if (!isAuthenticated) {
      const message = "Connectez-vous pour continuer.";
      setError(message);
      throw new ApiError(401, message);
    }
  }, [isAuthenticated]);


  const resolveCurrentCustomer = useCallback(async () => {
    const cachedCustomer = currentCustomerStorage.get();
    const cachedCustomerId = getCustomerIdFromCustomer(cachedCustomer);

    try {
      const currentCustomer = await customerApi.getCurrentCustomer();
      const currentCustomerId = getCustomerIdFromCustomer(currentCustomer);

      if (currentCustomerId) {
        currentCustomerStorage.set(currentCustomer);
        return { customer: currentCustomer, customerId: currentCustomerId };
      }
    } catch (err) {
      console.warn("[CartContext] getCurrentCustomer failed, using cached/auth fallback:", err);
    }

    const authCustomerId = getCustomerIdFromUser(user);
    const fallbackCustomerId = cachedCustomerId ?? authCustomerId ?? toNumberOrUndefined(user?.id);

    return {
      customer: cachedCustomer ?? null,
      customerId: fallbackCustomerId,
    };
  }, [user]);

  const saveCart = useCallback((nextCart) => {
    setCart(nextCart);

    if (nextCart) {
      cartSnapshotStorage.set(nextCart);
      if (nextCart.storeId) activeCartStoreStorage.set(nextCart.storeId);
    }

    return nextCart;
  }, []);

  const saveCartByMergingWithLatest = useCallback((incomingCart, storeId) => {
    let savedCart = incomingCart;

    setCart((latestCart) => {
      savedCart = mergeIncomingCartWithLatest(latestCart, incomingCart, storeId);

      if (savedCart) {
        cartSnapshotStorage.set(savedCart);
        if (savedCart.storeId) activeCartStoreStorage.set(savedCart.storeId);
      }

      return savedCart;
    });

    return savedCart;
  }, []);

  const enrichItems = useCallback(async (rawCart) => {
    if (!rawCart) return rawCart;

    const items = rawCart.items ?? [];

    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const quantity = getSafeQuantity(item.quantity ?? item.qty, 1);
        const existingProduct = item.product ?? item.catalogProduct ?? null;

        if (existingProduct) {
          const image = item.image ?? getProductImage(existingProduct);
          const name = item.name ?? getProductName(existingProduct);

          return {
            ...item,
            quantity,
            qty: quantity,
            name,
            image,
            price: item.price ?? item.salesPrice ?? getProductPrice(existingProduct),
            salesPrice: item.salesPrice ?? item.price ?? getProductPrice(existingProduct),
            product: {
              ...existingProduct,
              name,
              image,
              price: item.price ?? item.salesPrice ?? getProductPrice(existingProduct),
            },
          };
        }

        try {
          const product = await productApi.getProductDetails(item.productId);
          const image = item.image ?? getProductImage(product);
          const name = item.name ?? getProductName(product);

          return {
            ...item,
            quantity,
            qty: quantity,
            name,
            image,
            product,
            price: item.price ?? item.salesPrice ?? getProductPrice(product),
            salesPrice: item.salesPrice ?? item.price ?? getProductPrice(product),
          };
        } catch (err) {
          console.error(
            `[CartContext] Failed to enrich product ${item.productId}:`,
            err
          );

          return {
            ...item,
            quantity,
            qty: quantity,
            name: item.name ?? getCartItemName(item),
            image: item.image ?? getCartItemImage(item),
          };
        }
      })
    );

    return { ...rawCart, items: enrichedItems };
  }, []);

  const refreshCart = useCallback(
    async (storeId) => {
      if (!isAuthenticated || !storeId) return null;

      setLoading(true);
      setError(null);

      try {
        const { customerId } = await resolveCurrentCustomer();

        if (!customerId) {
          const fallbackCart = getBestExistingCart(cart, storeId);
          if (fallbackCart) saveCart(fallbackCart);
          return fallbackCart;
        }

        const found = await cartApi.findCartByStoreAndCustomer(
          storeId,
          customerId
        );

        // cartApi.findCartByStoreAndCustomer() retourne déjà null quand le
        // backend répond 404 "pas de panier actif". Il ne faut surtout pas
        // faire setCart(null), sinon CartPage devient vide alors qu'un produit
        // peut déjà exister côté panier.
        if (!found) {
          const fallbackCart = getBestExistingCart(cart, storeId);
          if (fallbackCart) saveCart(fallbackCart);
          setError(null);
          return fallbackCart;
        }

        const enriched = await enrichItems(found);
        saveCart(enriched);

        return enriched;
      } catch (err) {
        if (isNoActiveCartError(err)) {
          const fallbackCart = getBestExistingCart(cart, storeId);
          if (fallbackCart) saveCart(fallbackCart);
          setError(null);
          return fallbackCart;
        }

        const message =
          err instanceof ApiError
            ? err.message
            : "Impossible de contacter le serveur.";

        console.error("[CartContext] refreshCart failed:", err);
        setError(message);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, resolveCurrentCustomer, enrichItems, cart, saveCart]
  );

  const refreshActiveCart = useCallback(
    async ({ force = false } = {}) => {
      const activeStoreId = activeCartStoreStorage.get();
      const cachedCart = getBestExistingCart(cart, activeStoreId);

      // Dans ton backend, find-by-store-and-customer peut répondre 404 alors
      // que add-product dit que le produit est déjà dans le panier. On affiche
      // donc d'abord le snapshot local, et on ne force le GET que si demandé.
      if (cachedCart && !force) {
        saveCart(cachedCart);
        return cachedCart;
      }

      if (!activeStoreId) {
        if (cachedCart) saveCart(cachedCart);
        return cachedCart;
      }

      return refreshCart(activeStoreId);
    },
    [cart, refreshCart, saveCart]
  );

  const addToCart = useCallback(
    async (productId, storeId, product = null, quantity = 1) => {
      requireAuth();

      const requestedQuantity = getSafeQuantity(quantity, 1);

      if (!productId || !storeId) {
        const message = "Produit ou boutique invalide.";
        setError(message);

        return {
          ok: false,
          alreadyExists: false,
          noActiveCart: false,
          message,
        };
      }

      setLoading(true);
      setError(null);

      try {
        const response = await cartApi.addProductToCart(storeId, productId);

        activeCartStoreStorage.set(storeId);

        const previousCart = getAppendableExistingCart(cart);
        const cartFromAdd = normalizeCartAfterAdd(
          response,
          productId,
          storeId,
          product,
          previousCart,
          requestedQuantity,
          {
            responseItemsQuantityMode: "replace",
            fallbackQuantityMode: "increment",
          }
        );

        const enrichedFromAdd = await enrichItems(cartFromAdd);
        const savedCart = saveCartByMergingWithLatest(enrichedFromAdd, storeId);

        return {
          ok: true,
          alreadyExists: false,
          noActiveCart: false,
          cart: savedCart,
          message:
            requestedQuantity > 1
              ? `${requestedQuantity} exemplaires ajoutés au panier.`
              : "Produit ajouté au panier.",
        };
      } catch (err) {
        if (isAlreadyInCartError(err)) {
          activeCartStoreStorage.set(storeId);
          setError(null);

          const previousCart = getAppendableExistingCart(cart);
          const nextCart = normalizeCartAfterAdd(
            null,
            productId,
            storeId,
            product,
            previousCart,
            requestedQuantity,
            {
              fallbackQuantityMode: "increment",
            }
          );

          const enriched = await enrichItems(nextCart);
          const savedCart = saveCartByMergingWithLatest(enriched, storeId);

          return {
            ok: true,
            alreadyExists: true,
            noActiveCart: false,
            cart: savedCart,
            message:
              requestedQuantity > 1
                ? `Quantité augmentée de ${requestedQuantity}.`
                : "Quantité augmentée.",
          };
        }

        if (isNoActiveCartError(err)) {
          const message =
            err?.message || "Ce point de vente n'a pas de panier actif.";

          setError(null);

          return {
            ok: false,
            alreadyExists: false,
            noActiveCart: true,
            message,
          };
        }

        const message =
          err instanceof ApiError
            ? err.message
            : "Impossible d'ajouter le produit au panier.";

        console.error("[CartContext] addToCart failed:", err);
        setError(message);

        return {
          ok: false,
          alreadyExists: false,
          noActiveCart: false,
          message,
        };
      } finally {
        setLoading(false);
      }
    },
    [requireAuth, enrichItems, saveCartByMergingWithLatest, cart]
  );

  function isLocalCartItemId(value) {
  return String(value || "").startsWith("local-");
    }

const removeFromCart = useCallback(
  async (itemId) => {
    requireAuth();

    const safeItemId = String(itemId || "");

    setLoading(true);
    setError(null);

    try {
      // ✅ Si l'article vient du panier local, on ne contacte pas l'API
      if (isLocalCartItemId(safeItemId)) {
        setCart((prev) => {
          const nextCart = prev
            ? {
                ...prev,
                items: prev.items.filter(
                  (item) => String(item.id) !== safeItemId
                ),
              }
            : prev;

          if (nextCart?.items?.length) {
            cartSnapshotStorage.set(nextCart);
          } else {
            cartSnapshotStorage.remove();
            activeCartStoreStorage.remove();
          }

          return nextCart;
        });

        return {
          success: true,
          localOnly: true,
        };
      }

      // ✅ Si c'est un vrai id backend, on appelle l'API
      await cartApi.deleteCartItem(safeItemId);

      setCart((prev) => {
        const nextCart = prev
          ? {
              ...prev,
              items: prev.items.filter(
                (item) => String(item.id) !== safeItemId
              ),
            }
          : prev;

        if (nextCart?.items?.length) {
          cartSnapshotStorage.set(nextCart);
        } else {
          cartSnapshotStorage.remove();
          activeCartStoreStorage.remove();
        }

        return nextCart;
      });

      return {
        success: true,
      };
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Impossible de supprimer cet article.";

      console.error("[CartContext] removeFromCart failed:", err);
      setError(message);

      throw err;
    } finally {
      setLoading(false);
    }
  },
  [requireAuth]
);

  const updateQuantity = useCallback(
    async (itemId, quantity) => {
      requireAuth();

      if (quantity < 1) return removeFromCart(itemId);

      setLoading(true);
      setError(null);

      const applyQuantityLocally = () => {
        const nextCart = cart
          ? {
              ...cart,
              items: (cart.items ?? []).map((item) =>
                String(item.id) === String(itemId)
                  ? { ...item, quantity }
                  : item
              ),
            }
          : cart;

        if (nextCart) saveCart(nextCart);
        return nextCart;
      };

      try {
        const existingItem = cartItems.find(
          (item) => String(item.id) === String(itemId)
        );

        if (!existingItem) {
          throw new Error("Article introuvable dans le panier.");
        }

        /**
         * Si l'article vient du panier fallback local, son id ressemble à
         * "local-6-4912". Le backend ne peut pas modifier cet item avec
         * /shopping-cart/items/edit, donc on met seulement la quantité à jour
         * localement.
         */
        if (!isBackendId(existingItem.id)) {
          applyQuantityLocally();

          return {
            ok: true,
            localOnly: true,
            message: "Quantité mise à jour localement.",
          };
        }

        const { customerId } = await resolveCurrentCustomer();

        await cartApi.editCartItem({
          id: Number(existingItem.id),
          productId: existingItem.productId,
          customerId,
          storeId: existingItem.storeId,
          quantity,
          salesPrice: existingItem.price,
          note: existingItem.note ?? "",
        });

        applyQuantityLocally();

        return {
          ok: true,
          localOnly: false,
          message: "Quantité mise à jour.",
        };
      } catch (err) {
        /**
         * Certains items existants côté UI ne sont pas acceptés par l'endpoint
         * edit. Pour éviter de bloquer l'utilisateur, on garde la quantité
         * cohérente côté interface et on laisse submitCart envoyer le panier
         * complet au format ShoppingCartDto.
         */
        const nextCart = applyQuantityLocally();

        const message =
          err instanceof ApiError
            ? err.message
            : "Quantité mise à jour localement.";

        console.warn("[CartContext] updateQuantity fallback:", err);
        setError(null);

        return {
          ok: true,
          localOnly: true,
          cart: nextCart,
          message,
        };
      } finally {
        setLoading(false);
      }
    },
    [requireAuth, cartItems, resolveCurrentCustomer, removeFromCart, cart, saveCart]
  );

  const emptyCart = useCallback(
    async (shoppingCartId) => {
      requireAuth();

      const id = shoppingCartId ?? cart?.id;
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const updated = await cartApi.emptyCart(id);
        saveCart(updated);

        if (!updated?.items?.length) {
          cartSnapshotStorage.remove();
          activeCartStoreStorage.remove();
        }
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "Impossible de vider le panier.";

        console.error("[CartContext] emptyCart failed:", err);
        setError(message);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [requireAuth, cart, saveCart]
  );

  const requestCustomerAccountLinkCode = useCallback(
    async ({ phoneNumber } = {}) => {
      requireAuth();

      const sourceCart = getBestExistingCart(cart, cart?.storeId);
      const storeId = getCartStoreId(sourceCart);

      let resolvedPhoneNumber = normalizeMobileNumber(phoneNumber);

      setLoading(true);
      setError(null);

      try {
        const { customer, customerId } = await resolveCurrentCustomer();
        const normalizedPhoneNumber =
          resolvedPhoneNumber || getPhoneNumberFromCustomerOrUser(customer, user);
        resolvedPhoneNumber = normalizedPhoneNumber;

        if (!normalizedPhoneNumber) {
          const message =
            "Aucun numéro de téléphone n'a été trouvé sur votre profil. Entrez un numéro pour continuer.";
          setError(message);
          return { ok: false, message, customerId, storeId };
        }

        console.log("[VERIFY PHONE NUMBER]", normalizedPhoneNumber);

        const response = await customerAccountApi.verifyPhoneNumber(
          normalizedPhoneNumber
        );

        return {
          ok: true,
          response,
          phoneNumber: normalizedPhoneNumber,
          customerId,
          storeId,
          message: "Code envoyé. Vérifiez votre téléphone.",
        };
      } catch (err) {
        const normalizedPhoneNumber = resolvedPhoneNumber || normalizeMobileNumber(phoneNumber);

        if (isNoRegisteredAccountForPhoneError(err)) {
          const message =
            "L’option création de compte n’est pas disponible pour ce store.";

          console.warn("[CartContext] Aucun compte lié à ce numéro, endpoint de création requis:", err);
          setError(null);

          return {
            ok: false,
            needsCustomerAccountCreation: true,
            requiresBackendEndpoint: true,
            phoneNumber: normalizedPhoneNumber,
            storeId,
            message,
            backendError: err?.data ?? err?.raw ?? null,
          };
        }

        const message =
          err instanceof ApiError
            ? err.message
            : "Impossible d'envoyer le code de vérification.";

        console.error("[CartContext] requestCustomerAccountLinkCode failed:", err);
        setError(message);

        return {
          ok: false,
          message,
          phoneNumber: normalizedPhoneNumber,
          backendError: err?.data ?? err?.raw ?? null,
        };
      } finally {
        setLoading(false);
      }
    },
    [requireAuth, cart, resolveCurrentCustomer, user]
  );

  const linkCustomerAccountByPhoneCode = useCallback(
    async ({ phoneNumber, code } = {}) => {
      requireAuth();

      const sourceCart = getBestExistingCart(cart, cart?.storeId);
      const storeId = getCartStoreId(sourceCart);
      const normalizedPhoneNumber = String(phoneNumber || "").trim();
      const safeCode = String(code || "").trim();

      if (!storeId) {
        const message = "Boutique introuvable pour ce panier.";
        setError(message);
        return { ok: false, message };
      }

      if (!normalizedPhoneNumber) {
        const message = "Entrez votre numéro de téléphone.";
        setError(message);
        return { ok: false, message };
      }

      if (!safeCode) {
        const message = "Entrez le code reçu par SMS.";
        setError(message);
        return { ok: false, message };
      }

      setLoading(true);
      setError(null);

      try {
        const { customerId } = await resolveCurrentCustomer();

        if (!customerId) {
          const message = "Impossible d'identifier le client connecté.";
          setError(message);
          return { ok: false, message };
        }

        console.log("[LINK CUSTOMER ACCOUNT BY PHONE]", {
          phoneNumber: normalizedPhoneNumber,
          storeId,
          customerId,
        });

        await customerAccountApi.linkCardsByPhoneNumber({
          phoneNumber: normalizedPhoneNumber,
          code: safeCode,
        });

        const accounts = await customerAccountApi.getCustomerAccountsByStore(
          customerId,
          storeId
        );

        console.log(
          "[CUSTOMER ACCOUNTS AFTER LINK]",
          JSON.stringify(accounts, null, 2)
        );

        const customerAccountId = getFirstCustomerAccountId(accounts);

        if (!customerAccountId) {
          const message =
            "Le compte n'a pas encore été lié à cette enseigne. Vérifiez le code ou contactez le support.";
          setError(message);

          return {
            ok: false,
            needsCustomerAccountCreation: true,
            customerAccounts: accounts,
            customerId,
            storeId,
            message,
          };
        }

        return {
          ok: true,
          customerAccountId,
          customerAccounts: accounts,
          customerId,
          storeId,
          message: "Compte client lié avec succès.",
        };
      } catch (err) {
        if (isNoRegisteredAccountForPhoneError(err)) {
          const message =
            "L’option création de compte n’est pas disponible pour ce store.";

          console.warn("[CartContext] Aucun compte à lier avec ce numéro, endpoint de création requis:", err);
          setError(null);

          return {
            ok: false,
            needsCustomerAccountCreation: true,
            requiresBackendEndpoint: true,
            phoneNumber: normalizedPhoneNumber,
            customerId: undefined,
            storeId,
            message,
            backendError: err?.data ?? err?.raw ?? null,
          };
        }

        const message =
          err instanceof ApiError
            ? err.message
            : "Impossible de lier ou créer le compte client.";

        console.error("[CartContext] linkCustomerAccountByPhoneCode failed:", err);
        setError(message);

        return {
          ok: false,
          message,
          phoneNumber: normalizedPhoneNumber,
          backendError: err?.data ?? err?.raw ?? null,
        };
      } finally {
        setLoading(false);
      }
    },
    [requireAuth, cart, resolveCurrentCustomer]
  );

  const createCustomerAccountForCurrentStore = useCallback(
    async () => {
      requireAuth();

      const sourceCart = getBestExistingCart(cart, cart?.storeId);
      const storeId = getCartStoreId(sourceCart);

      if (!storeId) {
        const message = "Boutique introuvable pour ce panier.";
        setError(message);
        return { ok: false, message };
      }

      setLoading(true);
      setError(null);

      try {
        const { customer, customerId } = await resolveCurrentCustomer();
        const phoneNumber = getPhoneNumberFromCustomerOrUser(customer, user);

        if (!customerId) {
          const message = "Impossible d'identifier le client connecté.";
          setError(message);
          return { ok: false, message };
        }

        const result = await customerAccountApi.ensureCustomerAccountForStore({
          customerId,
          storeId,
          customer,
          phoneNumber,
        });

        if (!result?.customerAccountId) {
          const message = "Impossible de créer le compte client dans cette enseigne.";
          setError(message);
          return { ok: false, needsCustomerAccountCreation: true, customerId, storeId, message };
        }

        setError(null);

        return {
          ok: true,
          customerAccountId: result.customerAccountId,
          customerAccounts: result.customerAccounts ?? [],
          customerId,
          storeId,
          created: Boolean(result.created),
          message: result.created
            ? "Compte client créé avec succès."
            : "Compte client trouvé pour cette enseigne.",
        };
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "Impossible de créer le compte client dans cette enseigne.";

        console.error("[CartContext] createCustomerAccountForCurrentStore failed:", err);
        setError(message);

        return {
          ok: false,
          needsCustomerAccountCreation: true,
          storeId,
          message,
          backendError: err?.data ?? err?.raw ?? null,
        };
      } finally {
        setLoading(false);
      }
    },
    [requireAuth, cart, resolveCurrentCustomer, user]
  );

  const submitCart = useCallback(
    async (options = {}) => {
      requireAuth();

      const { successRedirect } = typeof options === "object" && !Array.isArray(options)
        ? options
        : {};

      const sourceCart = getBestExistingCart(cart, cart?.storeId);

      if (!sourceCart) {
        const message = "Aucun panier actif.";
        setError(message);
        return { ok: false, message };
      }

      const storeId = getCartStoreId(sourceCart);

      if (!storeId) {
        const message = "Boutique introuvable pour ce panier.";
        setError(message);
        return { ok: false, message };
      }

      setLoading(true);
      setError(null);

      try {
        const { customer, customerId } = await resolveCurrentCustomer();
        const customerPhoneNumber = getPhoneNumberFromCustomerOrUser(customer, user);

        if (!customerId) {
          const message = "Impossible d'identifier le client connecté.";
          setError(message);
          return { ok: false, message };
        }

        const selectedCustomerAccountId = toNumberOrUndefined(
          options?.customerAccountId ??
            options?.selectedCustomerAccountId ??
            options?.customerAccount?.id ??
            options?.customerAccount?.customerAccountId
        );

        let customerAccountId = selectedCustomerAccountId;
        let accounts = [];
        let createdCustomerAccount = false;

        if (!customerAccountId) {
          accounts = await customerAccountApi
            .getCustomerAccountsByStore(customerId, storeId)
            .catch((err) => {
              console.warn("[CartContext] getCustomerAccountsByStore failed:", err);
              return [];
            });

          console.log(
            "[CUSTOMER ACCOUNTS BY STORE]",
            JSON.stringify(accounts, null, 2)
          );

          if (Array.isArray(accounts) && accounts.length > 1) {
            const message = "Sélectionnez le compte client à utiliser pour cette enseigne.";
            setError(null);

            return {
              ok: false,
              needsCustomerAccountSelection: true,
              customerAccounts: accounts,
              customerId,
              storeId,
              message,
            };
          }

          customerAccountId = getFirstCustomerAccountId(accounts);

          if (!customerAccountId) {
            /**
             * Aucun compte enseigne n'existe pour ce client.
             * On ne bloque plus la validation : les routes /api/customers/account/create*
             * ne sont pas exposées dans l'environnement marketplace/client et peuvent
             * répondre 404. Le champ customerAccountId est optionnel dans ShoppingCartDto,
             * donc on soumet le panier sans ce champ.
             */
            console.warn(
              "[CartContext] Aucun compte enseigne trouvé : validation du panier sans customerAccountId.",
              { customerId, storeId }
            );
          }
        }

        const submitPayload = await ensureBackendCartForSubmit(
          sourceCart,
          customerId,
          customerAccountId
        );

        console.log(
          "[SOURCE CART BEFORE SUBMIT]",
          JSON.stringify(sourceCart, null, 2)
        );

        console.log(
          "[SUBMIT SHOPPING CART DTO FINAL]",
          JSON.stringify(submitPayload, null, 2)
        );

        if (!submitPayload?.id) {
          const message =
            "Impossible de valider le panier : aucun id de panier backend n'a été trouvé.";

          console.error("[CartContext] Missing backend shoppingCart id:", submitPayload);
          setError(message);

          return {
            ok: false,
            message,
          };
        }

        if (!isValidSubmitCartPayload(submitPayload)) {
          const message = "Panier invalide : aucun article valide à commander.";
          setError(message);

          return {
            ok: false,
            message,
          };
        }

        if (!submitPayload.cartItems.some((item) => item.id)) {
          console.warn(
            "[CartContext] Submit payload cartItems do not contain backend item ids.",
            submitPayload.cartItems
          );
        }

        const result = await submitShoppingCartPayload(submitPayload);

        setCart(null);
        activeCartStoreStorage.remove();
        cartSnapshotStorage.remove();

        return {
          ok: true,
          result,
          redirectTo: successRedirect ?? "/account",
          message:
            result?.message ||
            result?.content?.message ||
            (createdCustomerAccount
              ? "Compte enseigne créé et commande validée avec succès."
              : "Commande validée avec succès."),
        };
      } catch (err) {
        const message = getBackendSubmitMessage(err);

        console.error("[CartContext] submitCart failed:", err);
        setError(message);

        return {
          ok: false,
          message,
          backendError: err?.data ?? err?.raw ?? null,
        };
      } finally {
        setLoading(false);
      }
    },
    [requireAuth, cart, resolveCurrentCustomer, user]
  );

  const value = useMemo(
    () => ({
      cart,
      cartItems,
      cartCount,
      cartTotal,
      loading,
      error,
      addToCart,
      removeFromCart,
      updateQuantity,
      emptyCart,
      submitCart,
      requestCustomerAccountLinkCode,
      linkCustomerAccountByPhoneCode,
      createCustomerAccountForCurrentStore,
      refreshCart,
      refreshActiveCart,
      setError,
    }),
    [
      cart,
      cartItems,
      cartCount,
      cartTotal,
      loading,
      error,
      addToCart,
      removeFromCart,
      updateQuantity,
      emptyCart,
      submitCart,
      requestCustomerAccountLinkCode,
      linkCustomerAccountByPhoneCode,
      createCustomerAccountForCurrentStore,
      refreshCart,
      refreshActiveCart,
      setError,
    ]
  );

  return value;
}
