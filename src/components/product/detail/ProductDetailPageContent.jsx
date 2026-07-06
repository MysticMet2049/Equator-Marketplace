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
    cartLoading,
    wishlisted,
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
        message="Une erreur est survenue lors du chargement des produits."
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
    <main data-testid="product-detail-page" className="min-h-screen pt-14" style={{ background: "var(--color-equator-cream)" }}>
      <div data-testid="product-detail-main" className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
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
            wishlisted={wishlisted}
            cartLoading={cartLoading}
            onAdd={handleAdd}
            onToggleWishlist={toggleWishlist}
            favoriteError={favoriteError}
          />
        </div>
      </div>

      <ProductTabs product={product} similar={similar} activeTab={activeTab} setActiveTab={setActiveTab} />
</main>
  );
}
