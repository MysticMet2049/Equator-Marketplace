import CartAuthBanner from "../components/cart/CartAuthBanner";
import CartEmptyState from "../components/cart/CartEmptyState";
import CartItemsList from "../components/cart/CartItemsList";
import CartLoadingState from "../components/cart/CartLoadingState";
import CartRecommendedSection from "../components/cart/CartRecommendedSection";
import CartStatusMessages from "../components/cart/CartStatusMessages";
import CartSummaryPanel from "../components/cart/CartSummaryPanel";
import CustomerAccountModal from "../components/cart/CustomerAccountModal";
import { useCartPageController } from "../components/cart/useCartPageController";

// Page Panier : elle orchestre les sous-composants sans porter toute la logique visuelle.
export default function CartPage() {
  const page = useCartPageController();

  if (page.isInitialLoading) {
    return <CartLoadingState />;
  }

  if (page.isEmptyCart) {
    return (
      <CartEmptyState
        error={page.error}
        orderError={page.orderError}
        isAuthenticated={page.isAuthenticated}
      />
    );
  }

  return (
    <main
      data-testid="cart-page"
      className="min-h-screen pt-14 flex flex-col"
      style={{ background: "var(--color-equator-cream)" }}
    >
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8">
        <h1
          className="text-2xl font-light mb-8"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-equator-text)",
          }}
        >
          Mon Panier
        </h1>

        <CartStatusMessages
          error={page.error}
          orderError={page.orderError}
          orderMessage={page.orderMessage}
        />

        <CartAuthBanner isAuthenticated={page.isAuthenticated} />

        <div data-testid="cart-content" className="flex flex-col lg:flex-row gap-6">
          <CartItemsList
            cart={page.cart}
            onUpdateQty={page.updateQty}
            onRemove={page.removeFromCart}
          />

          <CartSummaryPanel
            subtotal={page.subtotal}
            discount={page.discount}
            total={page.total}
            promoCode={page.promoCode}
            promoApplied={page.promoApplied}
            promoError={page.promoError}
            loading={page.loading}
            onPromoChange={page.setPromoCode}
            onApplyPromo={page.applyPromo}
            onSubmitCart={page.handleSubmitCart}
          />
        </div>

        <CartRecommendedSection />
      </div>

      <CustomerAccountModal
        modal={page.customerAccountModal}
        loading={page.loading}
        selectedCustomerAccountId={page.selectedCustomerAccountId}
        linkPhoneNumber={page.linkPhoneNumber}
        linkVerificationCode={page.linkVerificationCode}
        linkStep={page.linkStep}
        linkMessage={page.linkMessage}
        linkError={page.linkError}
        onClose={page.closeCustomerAccountModal}
        onSelectAccount={page.setSelectedCustomerAccountId}
        onPhoneChange={page.setLinkPhoneNumber}
        onCodeChange={page.setLinkVerificationCode}
        onSubmitSelectedAccount={page.handleSubmitWithSelectedCustomerAccount}
        onRequestLinkCode={page.handleRequestLinkCode}
        onLinkAccountAndSubmit={page.handleLinkAccountAndSubmit}
        onCreateCustomerAccountAndSubmit={page.handleCreateCustomerAccountAndSubmit}
      />
</main>
  );
}
