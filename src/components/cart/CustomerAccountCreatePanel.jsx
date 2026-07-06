// Contenu de la modal quand aucun compte client n'existe pour l'enseigne.
export default function CustomerAccountCreatePanel({
  loading,
  linkPhoneNumber,
  linkVerificationCode,
  linkStep,
  linkMessage,
  linkError,
  modalMessage,
  onClose,
  onPhoneChange,
  onCodeChange,
  onRequestCode,
  onLinkAndSubmit,
  onCreateAndSubmit,
}) {
  return (
    <>
      <h2 className="text-lg font-bold mb-2" style={{ color: "var(--color-equator-text)" }}>
        Aucun compte client trouvé pour cette enseigne
      </h2>

      <p className="text-sm mb-4" style={{ color: "var(--color-equator-muted)" }}>
        Pour valider votre panier, vous devez d'abord lier ou créer un compte client dans cette enseigne.
      </p>

      <StepBanner linkStep={linkStep} />

      <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-equator-text)" }}>
        Numéro de téléphone
      </label>
      <input
        type="tel"
        value={linkPhoneNumber}
        onChange={(event) => onPhoneChange(event.target.value)}
        placeholder="Ex : +237654558098"
        className="w-full rounded-xl px-4 py-3 text-sm outline-none mb-3"
        style={{
          border: "1px solid var(--color-equator-beige)",
          color: "var(--color-equator-text)",
        }}
      />

      {linkStep === "code" && (
        <>
          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-equator-text)" }}>
            Code reçu par SMS
          </label>
          <input
            type="text"
            value={linkVerificationCode}
            onChange={(event) => onCodeChange(event.target.value)}
            placeholder="Entrez le code"
            className="w-full rounded-xl px-4 py-3 text-sm outline-none mb-3"
            style={{
              border: "1px solid var(--color-equator-beige)",
              color: "var(--color-equator-text)",
            }}
          />
        </>
      )}

      {(linkMessage || modalMessage) && !linkError && (
        <p className="text-sm mb-3" style={{ color: "var(--color-equator-green)" }}>
          {linkMessage || modalMessage}
        </p>
      )}

      {linkError && <p className="text-sm mb-3" style={{ color: "#dc2626" }}>{linkError}</p>}

      {linkStep === "create" && (
        <div
          className="rounded-xl p-3 mb-3 text-xs"
          style={{ background: "#fff7ed", border: "1px solid #fed7aa", color: "#9a3412" }}
        >
          L’option création de compte n’est pas disponible pour ce store.
        </div>
      )}

      <div className="flex gap-3 mt-5">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 rounded-xl text-sm font-semibold"
          style={{ border: "1px solid var(--color-equator-beige)", color: "var(--color-equator-text)" }}
        >
          Annuler
        </button>

        <CreateActionButton
          loading={loading}
          linkStep={linkStep}
          linkPhoneNumber={linkPhoneNumber}
          linkVerificationCode={linkVerificationCode}
          onRequestCode={onRequestCode}
          onLinkAndSubmit={onLinkAndSubmit}
          onCreateAndSubmit={onCreateAndSubmit}
        />
      </div>
    </>
  );
}

function StepBanner({ linkStep }) {
  return (
    <div className="rounded-xl p-3 mb-4" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
      <p className="text-xs mb-1" style={{ color: "var(--color-equator-muted)" }}>
        Étape actuelle
      </p>
      <p className="text-sm font-semibold" style={{ color: "var(--color-equator-text)" }}>
        {linkStep === "phone"
          ? "1. Vérifier votre numéro de téléphone"
          : linkStep === "code"
            ? "2. Entrer le code reçu"
            : "2. Création du compte client indisponible"}
      </p>
    </div>
  );
}

function CreateActionButton({
  loading,
  linkStep,
  linkPhoneNumber,
  linkVerificationCode,
  onRequestCode,
  onLinkAndSubmit,
  onCreateAndSubmit,
}) {
  const commonClass = "flex-1 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60";
  const style = { background: "var(--color-equator-green)" };

  if (linkStep === "phone") {
    return (
      <button type="button" onClick={onRequestCode} disabled={loading || !linkPhoneNumber.trim()} className={commonClass} style={style}>
        Vérifier le numéro
      </button>
    );
  }

  if (linkStep === "code") {
    return (
      <button
        type="button"
        onClick={onLinkAndSubmit}
        disabled={loading || !linkPhoneNumber.trim() || !linkVerificationCode.trim()}
        className={commonClass}
        style={style}
      >
        Lier et valider
      </button>
    );
  }

  return (
    <button type="button" onClick={onCreateAndSubmit} disabled={loading} className={commonClass} style={style}>
      Créer mon compte client
    </button>
  );
}
