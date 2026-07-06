import CartItemCard from "./CartItemCard";

// Liste des articles présents dans le panier.
export default function CartItemsList({ cart, onUpdateQty, onRemove }) {
  return (
    <div data-testid="cart-items-list" className="flex-1 space-y-3">
      {cart.map((item) => (
        <CartItemCard
          key={item.id ?? `${item.storeId}-${item.productId}`}
          item={item}
          onUpdateQty={onUpdateQty}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
