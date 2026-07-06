import { useMemo, useState } from "react";
import { FiCreditCard, FiShoppingBag } from "react-icons/fi";
import {
  STATUS_STYLES,
  formatDate,
  formatMoney,
  getCardBalance,
  getCardDebt,
  getCardName,
  getCardPoints,
  getPurchaseDate,
  getPurchaseId,
  getPurchaseStatus,
  getPurchaseStore,
  getPurchaseTotal,
} from "../accountUtils";
import EmptyState from "../shared/EmptyState";
import SectionError from "../shared/SectionError";

export default function StoreAccountsSection({ linkedCards = [], purchases = [], debtItems = [], error, purchasesError }) {
  const [selectedCardKey, setSelectedCardKey] = useState(null);

  const selectedCard = useMemo(() => {
    if (!selectedCardKey) return null;
    return linkedCards.find((card, index) => getCardKey(card, index) === selectedCardKey) || null;
  }, [linkedCards, selectedCardKey]);

  const selectedPurchases = useMemo(() => {
    if (!selectedCard) return [];

    const matches = purchases.filter((purchase) => purchaseMatchesCard(purchase, selectedCard));

    // Lorsque l'utilisateur n'a qu'un seul compte enseigne, certains endpoints ne renvoient pas
    // toujours l'identifiant de l'enseigne dans les achats. Dans ce cas, on affiche l'historique
    // disponible au lieu de laisser la section vide.
    if (matches.length === 0 && linkedCards.length === 1) {
      return purchases;
    }

    return matches;
  }, [linkedCards.length, purchases, selectedCard]);

  return (
    <section data-testid="account-store-accounts-section" className="space-y-6">
      <SectionError message={error} />

      {linkedCards.length === 0 ? (
        <EmptyState icon={FiCreditCard} text="Aucun compte enseigne lié à votre profil." />
      ) : (
        <div data-testid="account-store-accounts-grid" className="grid md:grid-cols-2 gap-4">
          {linkedCards.map((card, index) => {
            const cardKey = getCardKey(card, index);
            return (
              <StoreAccountCard
                key={cardKey}
                card={card}
                selected={selectedCardKey === cardKey}
                onClick={() => setSelectedCardKey(cardKey)}
              />
            );
          })}
        </div>
      )}

      {selectedCard && (
        <PurchaseHistoryPanel
          card={selectedCard}
          purchases={selectedPurchases}
          error={purchasesError}
        />
      )}

      {!selectedCard && linkedCards.length > 0 && (
        <div
          className="rounded-2xl p-5 text-center"
          style={{
            background: "var(--color-equator-cream)",
            border: "1px dashed var(--color-equator-beige)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>
            Cliquez sur un compte enseigne pour afficher son historique d'achat.
          </p>
        </div>
      )}

      {debtItems.length > 0 && (
        <div>
          <h3 className="text-lg font-light mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--color-equator-text)" }}>
            Achats avec dette
          </h3>
          <div className="space-y-2">
            {debtItems.map((item, index) => (
              <div key={item.id || index} className="bg-white rounded-xl p-4 flex items-center justify-between" style={{ border: "1px solid var(--color-equator-beige)" }}>
                <span className="text-sm" style={{ fontFamily: "var(--font-body)" }}>{getCardName(item)}</span>
                <strong className="text-sm" style={{ color: "#dc2626", fontFamily: "var(--font-body)" }}>{formatMoney(getCardDebt(item))}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function StoreAccountCard({ card, selected, onClick }) {
  return (
    <button
      data-testid="account-store-account-card"
      type="button"
      onClick={onClick}
      className="bg-white rounded-2xl p-5 text-left transition-all duration-200 hover:-translate-y-0.5"
      style={{
        border: selected ? "1px solid var(--color-equator-green)" : "1px solid var(--color-equator-beige)",
        boxShadow: selected ? "0 14px 32px rgba(25, 107, 76, 0.12)" : "none",
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--color-equator-text)", fontFamily: "var(--font-body)" }}>{getCardName(card)}</p>
          <p className="text-xs" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>Compte enseigne lié</p>
        </div>
        <FiCreditCard size={22} style={{ color: "var(--color-equator-green)" }} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Metric label="Solde" value={formatMoney(getCardBalance(card))} />
        <Metric label="Points" value={getCardPoints(card).toLocaleString("fr-FR")} />
      </div>
    </button>
  );
}

function PurchaseHistoryPanel({ card, purchases, error }) {
  return (
    <div data-testid="account-store-purchase-history">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <h3 className="text-lg font-light" style={{ fontFamily: "var(--font-display)", color: "var(--color-equator-text)" }}>
            Historique d'achat
          </h3>
          <p className="text-xs" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>
            {getCardName(card)}
          </p>
        </div>
      </div>

      <SectionError message={error} />

      {purchases.length === 0 ? (
        <EmptyState icon={FiShoppingBag} text="Aucun achat enregistré pour ce compte enseigne." />
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-equator-beige)" }}>
          {purchases.map((order, index) => (
            <OrderRow key={order.id || order.reference || index} order={order} isLast={index === purchases.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderRow({ order, isLast }) {
  const status = getPurchaseStatus(order);
  const style = STATUS_STYLES[status] || STATUS_STYLES["En cours"];

  return (
    <div
      data-testid="account-purchase-row"
      className="grid md:grid-cols-5 gap-3 px-5 py-4 items-center text-sm"
      style={{
        borderBottom: isLast ? "none" : "1px solid var(--color-equator-beige)",
        fontFamily: "var(--font-body)",
      }}
    >
      <span className="font-semibold" style={{ color: "var(--color-equator-text)" }}>{getPurchaseId(order)}</span>
      <span style={{ color: "var(--color-equator-muted)" }}>{formatDate(getPurchaseDate(order))}</span>
      <span style={{ color: "var(--color-equator-muted)" }}>{getPurchaseStore(order)}</span>
      <span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: style.bg, color: style.color }}>{status}</span>
      </span>
      <span className="md:text-right font-semibold" style={{ color: "var(--color-equator-text)" }}>{formatMoney(getPurchaseTotal(order))}</span>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl p-3" style={{ background: "var(--color-equator-cream)" }}>
      <p className="text-xs" style={{ color: "var(--color-equator-muted)" }}>{label}</p>
      <p className="text-sm font-semibold" style={{ color: "var(--color-equator-text)" }}>{value}</p>
    </div>
  );
}

function getCardKey(card, index) {
  return String(card?.id || card?.cardId || card?.customerAccountId || card?.accountId || card?.clientAccountId || index);
}

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function unique(values) {
  return values.filter((value, index, array) => value && array.indexOf(value) === index);
}

function getCardStoreIds(card) {
  const organisation = card?.organisation || card?.organisationSummaryDto || card?.store || card?.storeSummaryDto || card?.brand || {};

  return unique([
    card?.storeId,
    card?.organisationId,
    card?.organizationId,
    card?.merchantId,
    card?.brandId,
    organisation?.id,
    organisation?.storeId,
    organisation?.organisationId,
    organisation?.organizationId,
  ].map((value) => (value === undefined || value === null ? null : String(value))));
}

function getPurchaseStoreIds(purchase) {
  const store = purchase?.store || purchase?.storeSummaryDto || purchase?.organisation || purchase?.organisationSummaryDto || purchase?.merchant || {};

  return unique([
    purchase?.storeId,
    purchase?.organisationId,
    purchase?.organizationId,
    purchase?.merchantId,
    store?.id,
    store?.storeId,
    store?.organisationId,
    store?.organizationId,
  ].map((value) => (value === undefined || value === null ? null : String(value))));
}

function purchaseMatchesCard(purchase, card) {
  const cardStoreIds = getCardStoreIds(card);
  const purchaseStoreIds = getPurchaseStoreIds(purchase);

  if (cardStoreIds.length > 0 && purchaseStoreIds.length > 0) {
    return cardStoreIds.some((id) => purchaseStoreIds.includes(id));
  }

  const cardName = normalize(getCardName(card));
  const purchaseStoreName = normalize(getPurchaseStore(purchase));

  return Boolean(cardName && purchaseStoreName && cardName === purchaseStoreName);
}
