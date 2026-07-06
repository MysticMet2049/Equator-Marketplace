import CustomerAccountCreatePanel from "./CustomerAccountCreatePanel";
import CustomerAccountSelectPanel from "./CustomerAccountSelectPanel";

// Fenêtre modale dédiée au choix, à la liaison ou à la création d'un compte client.
export default function CustomerAccountModal({
  modal,
  loading,
  selectedCustomerAccountId,
  linkPhoneNumber,
  linkVerificationCode,
  linkStep,
  linkMessage,
  linkError,
  onClose,
  onSelectAccount,
  onPhoneChange,
  onCodeChange,
  onSubmitSelectedAccount,
  onRequestLinkCode,
  onLinkAccountAndSubmit,
  onCreateCustomerAccountAndSubmit,
}) {
  if (!modal.open) return null;

  return (
    <div data-testid="customer-account-modal" className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Fermer la fenêtre"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-md rounded-2xl p-5 shadow-xl"
        style={{ background: "white", fontFamily: "var(--font-body)" }}
      >
        {modal.mode === "create" ? (
          <CustomerAccountCreatePanel
            loading={loading}
            linkPhoneNumber={linkPhoneNumber}
            linkVerificationCode={linkVerificationCode}
            linkStep={linkStep}
            linkMessage={linkMessage}
            linkError={linkError}
            modalMessage={modal.message}
            onClose={onClose}
            onPhoneChange={onPhoneChange}
            onCodeChange={onCodeChange}
            onRequestCode={onRequestLinkCode}
            onLinkAndSubmit={onLinkAccountAndSubmit}
            onCreateAndSubmit={onCreateCustomerAccountAndSubmit}
          />
        ) : (
          <CustomerAccountSelectPanel
            accounts={modal.accounts}
            loading={loading}
            selectedCustomerAccountId={selectedCustomerAccountId}
            onSelect={onSelectAccount}
            onClose={onClose}
            onSubmit={onSubmitSelectedAccount}
          />
        )}
      </div>
    </div>
  );
}
