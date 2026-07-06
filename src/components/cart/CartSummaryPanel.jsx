import { FiShield } from "react-icons/fi";
import { formatPrice } from "./cartPageUtils";

// Récapitulatif de commande : prix, promo et bouton de validation.
export default function CartSummaryPanel({
  subtotal,
  discount,
  total,
  promoCode,
  promoApplied,
  promoError,
  loading,
  onPromoChange,
  onApplyPromo,
  onSubmitCart,
}) {
  return (
    <aside data-testid="cart-summary" className="lg:w-80 shrink-0 space-y-4">
      <div
        className="bg-white rounded-2xl p-5"
        style={{ border: "1px solid var(--color-equator-beige)" }}
      >
        <h3
          className="text-sm font-semibold mb-4"
          style={{
            color: "var(--color-equator-text)",
            fontFamily: "var(--font-body)",
          }}
        >
          Récapitulatif
        </h3>

        <div className="space-y-2.5 mb-4">
          <SummaryLine label="Sous-total" value={formatPrice(subtotal)} />
          <SummaryLine
            label="Livraison"
            value="GRATUIT"
            valueStyle={{ color: "var(--color-equator-green)", fontWeight: 600 }}
          />

          {promoApplied && (
            <SummaryLine
              label="Promo (-10%)"
              value={`-${formatPrice(discount)}`}
              labelStyle={{ color: "var(--color-equator-green)" }}
              valueStyle={{ color: "var(--color-equator-green)", fontWeight: 500 }}
            />
          )}

          <div
            className="flex justify-between pt-2"
            style={{ borderTop: "1px solid var(--color-equator-beige)" }}
          >
            <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-body)" }}>
              Total
            </span>
            <span className="text-base font-bold" style={{ fontFamily: "var(--font-body)" }}>
              {formatPrice(total)}
            </span>
          </div>
        </div>

        <button
          data-testid="cart-submit-button"
          type="button"
          onClick={onSubmitCart}
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
          style={{
            background: "var(--color-equator-green)",
            fontFamily: "var(--font-body)",
          }}
        >
          Valider le panier →
        </button>

        </div>

      <BuyerProtectionCard />
    </aside>
  );
}

function SummaryLine({ label, value, labelStyle = {}, valueStyle = {} }) {
  return (
    <div className="flex justify-between">
      <span
        className="text-sm"
        style={{
          color: "var(--color-equator-muted)",
          fontFamily: "var(--font-body)",
          ...labelStyle,
        }}
      >
        {label}
      </span>
      <span className="text-sm font-medium" style={{ fontFamily: "var(--font-body)", ...valueStyle }}>
        {value}
      </span>
    </div>
  );
}

function BuyerProtectionCard() {
  return (
    <div></div>
  );
}
