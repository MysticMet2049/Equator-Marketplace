import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import ProductCard from "../../product/ProductCard";
import HomeSectionHeader from "./HomeSectionHeader";
import HomeSectionStatus from "./HomeSectionStatus";

// Skeleton léger pour donner une impression de chargement progressif.
function ProductSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl overflow-hidden animate-pulse bg-white"
          style={{ border: "1px solid var(--color-equator-beige)" }}
        >
          <div className="h-36" style={{ background: "#eee8df" }} />
          <div className="p-3 space-y-2">
            <div className="h-3 rounded" style={{ background: "#eee8df" }} />
            <div className="h-3 w-2/3 rounded" style={{ background: "#eee8df" }} />
            <div className="h-4 w-1/2 rounded" style={{ background: "#eee8df" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Section produits réutilisable sur la page d'accueil.
export default function FeaturedProductsSection({
  title = "Produits",
  description = "Découvrez les produits disponibles sur Equator.",
  products,
  loading,
  error,
  isEmpty,
  alternate = false,
  testId = "home-products-section",
}) {
  return (
    <section data-testid={testId} className="py-12" style={{ background: alternate ? "#f0ebe3" : "transparent" }}>
      <div className="max-w-7xl mx-auto px-6">
        <HomeSectionHeader title={title} description={description} linkTo="/marketplace" />

        {loading ? (
          <div data-testid={`${testId}-loading`}><ProductSkeletonGrid /></div>
        ) : error ? (
          <HomeSectionStatus testId={`${testId}-error`}>Impossible de charger les produits.</HomeSectionStatus>
        ) : isEmpty ? (
          <HomeSectionStatus testId={`${testId}-empty`}>Aucun produit disponible pour cette section.</HomeSectionStatus>
        ) : (
          <div data-testid={`${testId}-grid`} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {products.map((product) => (
              <ProductCard key={`${product.sectionType || "home"}-${product.id || product.productId || product.promoId}`} product={product} compact />
            ))}
          </div>
        )}

        <div className="mt-6 flex md:hidden justify-center">
          <Link
            to="/marketplace"
            className="flex items-center gap-1 text-sm font-medium"
            style={{ color: "var(--color-equator-green)" }}
          >
            Tout voir <FiArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
