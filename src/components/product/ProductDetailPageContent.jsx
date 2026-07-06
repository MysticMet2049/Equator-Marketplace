import ProductEmptyState from "./detail/ProductEmptyState";
import ProductGallery from "./detail/ProductGallery";
import ProductInfoPanel from "./detail/ProductInfoPanel";
import ProductLoadingState from "./detail/ProductLoadingState";
import ProductTabs from "./detail/ProductTabs";
import useProductDetailPage from "./detail/useProductDetailPage";

export default function ProductDetailPage() {
  const {
    product,
    loading,
    error,
    images,
    similar,
    activeImg,
    setActiveImg,
    qty,
    setQty,
    activeTab,
    setActiveTab,
    added,
    cartMessage,
    cartLoading,
    wishlisted,
    favoritePending,
    favoriteError,
    handleAdd,
    toggleWishlist,
    goToMarketplace,
  } = useProductDetailPage();

  if (!product && loading) return <ProductLoadingState />;

  if (!product && error) {
    return (
      <ProductEmptyState
        title="Impossible de charger le produit"
        message="Une erreur est survenue lors du chargement du produit."
        onAction={goToMarketplace}
      />
    );
  }

  if (!product) {
    return (
      <ProductEmptyState
        title="Produit introuvable"
        message="Le produit demandé n’existe pas ou n’est plus disponible."
        onAction={goToMarketplace}
      />
    );
  }

  return (
    <main
      data-testid="product-detail-page"
      className="min-h-screen pt-14"
      style={{
        background:
          "linear-gradient(180deg, #fbf8f1 0%, var(--color-equator-cream) 42%, #f8f3ea 100%)",
      }}
    >
      <div data-testid="product-detail-main" className="max-w-6xl mx-auto px-4 md:px-6 pt-8 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,620px)_minmax(360px,420px)] justify-center gap-6 lg:gap-8 items-start">
          <ProductGallery
            product={product}
            images={images}
            activeImg={activeImg}
            setActiveImg={setActiveImg}
          />

          <ProductInfoPanel
            product={product}
            qty={qty}
            setQty={setQty}
            added={added}
            cartMessage={cartMessage}
            wishlisted={wishlisted}
            favoritePending={favoritePending}
            cartLoading={cartLoading}
            onAdd={handleAdd}
            onToggleWishlist={toggleWishlist}
            favoriteError={favoriteError}
          />
        </div>
      </div>

      <ProductTabs
        product={product}
        similar={similar}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
</main>
  );
}
