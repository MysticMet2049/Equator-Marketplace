/**
 * cartMapper.js
 * Transforms shopping cart backend DTOs into clean frontend objects.
 */

const firstDefined = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const toNumberOrUndefined = (value) => {
  const defined = firstDefined(value);
  if (defined === undefined) return undefined;
  const numberValue = Number(defined);
  return Number.isFinite(numberValue) ? numberValue : undefined;
};

const getCartItemsArray = (apiCart) => {
  const possibleItems = firstDefined(
    apiCart?.cartItems,
    apiCart?.salesItems,
    apiCart?.shoppingCartItems,
    apiCart?.items,
    apiCart?.lines,
    apiCart?.content?.cartItems,
    apiCart?.content?.salesItems,
    apiCart?.data?.cartItems,
    apiCart?.data?.salesItems
  );

  return Array.isArray(possibleItems) ? possibleItems : [];
};

// ─── Cart ─────────────────────────────────────────────────────────────────────
/**
 * Map ShoppingCartDto / ShoppingCartSummaryDto → clean cart object.
 *
 * Supported backend item arrays:
 *   cartItems, salesItems, shoppingCartItems, items
 */
export function mapCartFromApi(apiCart) {
  if (!apiCart) return null;

  const cart = apiCart?.content && !apiCart.id ? apiCart.content : apiCart;
  const rawItems = getCartItemsArray(cart);
  const mappedItems = rawItems.map(mapCartItemFromApi).filter(Boolean);

  const storeId = firstDefined(
    cart.storeId,
    cart.store?.id,
    cart.pointOfSaleId,
    cart.pointOfSale?.id,
    mappedItems[0]?.storeId
  );

  return {
    id: firstDefined(cart.id, cart.shoppingCartId, cart.cartId),
    customerId: firstDefined(
      cart.customerId,
      cart.customer?.id,
      cart.storecardCustomerId,
      cart.storecardCustomer?.id
    ),
    customerAccountId: firstDefined(
      cart.customerAccountId,
      cart.accountId,
      cart.customerAccount?.id,
      cart.storecardCustomerAccountId,
      cart.storecardCustomerAccount?.id
    ),
    storeId,
    note: cart.note ?? "",

    // The UI uses `items`, but we also expose `cartItems` / `salesItems`
    // so submit flows can keep working regardless of backend DTO naming.
    items: mappedItems,
    cartItems: mappedItems,
    salesItems: mappedItems,

    _raw: apiCart,
  };
}

/**
 * Map ShoppingCartItemDto / SalesItemDto → clean cart item.
 *
 * Supported id fields:
 *   id, shoppingCartItemId, cartItemId, itemId, salesItemId, saleItemId
 */
export function mapCartItemFromApi(apiItem) {
  if (!apiItem) return null;

  const product = firstDefined(
    apiItem.product,
    apiItem.catalogProduct,
    apiItem.article,
    apiItem.itemProduct
  );

  const productId = firstDefined(
    apiItem.productId,
    apiItem.catalogProductId,
    apiItem.product?.id,
    apiItem.catalogProduct?.id,
    apiItem.article?.id,
    product?.id
  );

  const storeId = firstDefined(
    apiItem.storeId,
    apiItem.store?.id,
    apiItem.pointOfSaleId,
    apiItem.pointOfSale?.id,
    apiItem.product?.storeId,
    apiItem.catalogProduct?.storeId,
    product?.storeId
  );

  const salesPrice = firstDefined(
    apiItem.salesPrice,
    apiItem.finalSalesPrice,
    apiItem.currentListPrice,
    apiItem.price,
    apiItem.unitPrice,
    apiItem.amount,
    product?.salesPrice,
    product?.price
  );

  const quantity = Number(firstDefined(apiItem.quantity, apiItem.qty, 1));
  const price = Number(firstDefined(salesPrice, 0));
  const name = firstDefined(
    apiItem.name,
    apiItem.productName,
    apiItem.designation,
    product?.name,
    product?.title,
    product?.designation
  );
  const image = firstDefined(
    apiItem.image,
    apiItem.imageUrl,
    apiItem.mainImage,
    apiItem.thumbnail,
    product?.image,
    product?.imageUrl,
    product?.mainImage,
    product?.thumbnail
  );

  return {
    id: firstDefined(
      apiItem.id,
      apiItem.shoppingCartItemId,
      apiItem.cartItemId,
      apiItem.itemId,
      apiItem.salesItemId,
      apiItem.saleItemId
    ),
    shoppingCartId: firstDefined(
      apiItem.shoppingCartId,
      apiItem.cartId,
      apiItem.shoppingCart?.id,
      apiItem.cart?.id
    ),
    productId,
    storeId,
    customerId: firstDefined(
      apiItem.customerId,
      apiItem.customer?.id,
      apiItem.storecardCustomerId,
      apiItem.storecardCustomer?.id
    ),
    quantity,
    qty: quantity,
    price,
    salesPrice: price,
    name,
    image,
    store: firstDefined(
      apiItem.storeName,
      apiItem.store?.name,
      apiItem.pointOfSale?.name,
      product?.storeName,
      product?.store?.name
    ),
    note: apiItem.note ?? "",
    product: product
      ? {
          ...product,
          name: firstDefined(product.name, name),
          image: firstDefined(product.image, image),
          price: firstDefined(product.price, price),
        }
      : null,
    _raw: apiItem,
  };
}

export default mapCartFromApi;
