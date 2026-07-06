import { FiShoppingBag } from "react-icons/fi";
import { formatDate, formatMoney, getPurchaseDate, getPurchaseId, getPurchaseStatus, getPurchaseStore, getPurchaseTotal, STATUS_STYLES } from "../accountUtils";
import EmptyState from "../shared/EmptyState";
import SectionError from "../shared/SectionError";

export default function OrdersSection({ purchases, error }) {
  return (
    <section data-testid="account-orders-section">
      <SectionError message={error} />
      {purchases.length === 0 ? (
        <EmptyState icon={FiShoppingBag} text="Aucun achat enregistré." actionLabel="Commencer mes achats" actionTo="/marketplace" />
      ) : (
        <div data-testid="account-orders-list" className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-equator-beige)" }}>
          {purchases.map((order, index) => <OrderRow key={order.id || order.reference || index} order={order} isLast={index === purchases.length - 1} />)}
        </div>
      )}
    </section>
  );
}

function OrderRow({ order, isLast }) {
  const status = getPurchaseStatus(order);
  const style = STATUS_STYLES[status] || STATUS_STYLES["En cours"];

  return (
    <div data-testid="account-order-row" className="grid md:grid-cols-5 gap-3 px-5 py-4 items-center text-sm" style={{ borderBottom: isLast ? "none" : "1px solid var(--color-equator-beige)", fontFamily: "var(--font-body)" }}>
      <span className="font-semibold" style={{ color: "var(--color-equator-text)" }}>{getPurchaseId(order)}</span>
      <span style={{ color: "var(--color-equator-muted)" }}>{formatDate(getPurchaseDate(order))}</span>
      <span style={{ color: "var(--color-equator-muted)" }}>{getPurchaseStore(order)}</span>
      <span><span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: style.bg, color: style.color }}>{status}</span></span>
      <span className="md:text-right font-semibold" style={{ color: "var(--color-equator-text)" }}>{formatMoney(getPurchaseTotal(order))}</span>
    </div>
  );
}
