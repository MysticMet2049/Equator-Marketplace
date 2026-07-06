import { getCustomerAccountId, getCustomerAccountLabel } from "./cartPageUtils";

// Contenu de la modal quand l'utilisateur doit choisir un compte client existant.
export default function CustomerAccountSelectPanel({
  accounts,
  loading,
  selectedCustomerAccountId,
  onSelect,
  onClose,
  onSubmit,
}) {
  return (
    <>
      <h2 className="text-lg font-bold mb-2" style={{ color: "var(--color-equator-text)" }}>
        Choisir un compte client
      </h2>

      <p className="text-sm mb-4" style={{ color: "var(--color-equator-muted)" }}>
        Sélectionnez le compte client associé à cette enseigne pour valider votre panier.
      </p>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {accounts.map((account) => {
          const accountId = getCustomerAccountId(account);
          const label = getCustomerAccountLabel(account);
          const isSelected = String(selectedCustomerAccountId) === String(accountId);

          return (
            <button
              key={accountId ?? label}
              type="button"
              onClick={() => onSelect(String(accountId))}
              className="w-full text-left rounded-xl px-4 py-3 transition-all"
              style={{
                border: isSelected
                  ? "2px solid var(--color-equator-green)"
                  : "1px solid var(--color-equator-beige)",
                background: isSelected ? "rgba(15, 118, 110, 0.06)" : "white",
              }}
            >
              <span className="block text-sm font-semibold" style={{ color: "var(--color-equator-text)" }}>
                {label}
              </span>
              <span className="block text-xs mt-1" style={{ color: "var(--color-equator-muted)" }}>
                ID compte client : {accountId}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 mt-5">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 rounded-xl text-sm font-semibold"
          style={{ border: "1px solid var(--color-equator-beige)", color: "var(--color-equator-text)" }}
        >
          Annuler
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading || !selectedCustomerAccountId}
          className="flex-1 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: "var(--color-equator-green)" }}
        >
          Valider
        </button>
      </div>
    </>
  );
}
