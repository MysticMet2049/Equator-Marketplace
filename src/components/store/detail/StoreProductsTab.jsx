import { useEffect, useMemo, useRef, useState } from "react";
import { FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ProductCard from "../../product/ProductCard";

const INITIAL_CATALOG_ITEMS = 18;
const CAROUSEL_VISIBLE_ITEMS = 6;
const CAROUSEL_TRANSITION_MS = 220;

export default function StoreProductsTab({
  promoProducts = [],
  featuredProducts = [],
  catalogProducts = [],
  products = [],
  store,
  loading,
  error,
}) {
  const [expandedSections, setExpandedSections] = useState({});

  const fallbackProducts = useMemo(() => {
    if (promoProducts.length || featuredProducts.length || catalogProducts.length) {
      return [];
    }

    return products;
  }, [promoProducts.length, featuredProducts.length, catalogProducts.length, products]);

  const hasProducts =
    promoProducts.length > 0 ||
    featuredProducts.length > 0 ||
    catalogProducts.length > 0 ||
    fallbackProducts.length > 0;

  const toggleSection = (sectionKey) => {
    setExpandedSections((previous) => ({
      ...previous,
      [sectionKey]: !previous[sectionKey],
    }));
  };

  if (loading) return <TabMessage message="Chargement des produits..." />;
  if (error) return <TabMessage message="Impossible de charger les produits de cette boutique." />;
  if (!hasProducts) return <TabMessage message="Aucun produit disponible dans cette boutique." />;

  return (
    <div data-testid="store-products-tab" className="pb-12 space-y-14">
      {promoProducts.length > 0 && (
        <ProductCarouselSection
          sectionKey="promo"
          title="Produits promotionnels"
          description="Offres et réductions disponibles dans cette boutique."
          products={promoProducts}
          store={store}
          expanded={Boolean(expandedSections.promo)}
          onToggle={() => toggleSection("promo")}
        />
      )}

      {featuredProducts.length > 0 && (
        <ProductCarouselSection
          sectionKey="featured"
          title="Produits phares"
          description="Produits mis en avant par la boutique."
          products={featuredProducts}
          store={store}
          expanded={Boolean(expandedSections.featured)}
          onToggle={() => toggleSection("featured")}
        />
      )}

      {(catalogProducts.length > 0 || fallbackProducts.length > 0) && (
        <ProductCatalogSection
          title="Catalogue"
          description="Tous les produits disponibles dans cette boutique."
          products={catalogProducts.length > 0 ? catalogProducts : fallbackProducts}
          store={store}
          expanded={Boolean(expandedSections.catalog)}
          onToggle={() => toggleSection("catalog")}
        />
      )}
    </div>
  );
}

function ProductCarouselSection({
  sectionKey,
  title,
  description,
  products,
  store,
  expanded,
  onToggle,
}) {
  const [startIndex, setStartIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState("next");
  const [transitionPhase, setTransitionPhase] = useState("idle");
  const transitionTimeoutRef = useRef(null);

  const hasMoreThanOne = products.length > 1;
  const visibleCount = Math.min(CAROUSEL_VISIBLE_ITEMS, products.length);
  const isAnimating = transitionPhase !== "idle";

  useEffect(() => {
    if (startIndex >= products.length) {
      setStartIndex(0);
    }
  }, [startIndex, products.length]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const visibleProducts = useMemo(
    () => getCarouselWindow(products, startIndex, visibleCount),
    [products, startIndex, visibleCount]
  );

  const moveCarousel = (direction) => {
    if (!hasMoreThanOne || isAnimating) return;

    setSlideDirection(direction);
    setTransitionPhase("leaving");

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    transitionTimeoutRef.current = setTimeout(() => {
      setStartIndex((index) => {
        if (direction === "next") {
          return (index + 1) % products.length;
        }

        return (index - 1 + products.length) % products.length;
      });

      setTransitionPhase("entering");

      transitionTimeoutRef.current = setTimeout(() => {
        setTransitionPhase("idle");
      }, 20);
    }, CAROUSEL_TRANSITION_MS);
  };

  const next = () => {
    moveCarousel("next");
  };

  const previous = () => {
    moveCarousel("previous");
  };

  return (
    <section data-testid={`store-product-section-${sectionKey}`} aria-labelledby={`${sectionKey}-title`}>
      <SectionHeader
        id={`${sectionKey}-title`}
        title={title}
        description={description}
        count={products.length}
        buttonLabel={expanded ? "Réduire" : "Voir tout"}
        showButton={products.length > 0}
        onClick={onToggle}
      />

      {expanded ? (
        <CompactGrid products={products} store={store} />
      ) : (
        <div data-testid={`store-product-carousel-${sectionKey}`} className="relative py-3 px-2">
          <div className="overflow-hidden">
            <div
              className="flex flex-nowrap gap-4 items-stretch transition-all ease-out will-change-transform"
              style={{
                opacity: transitionPhase === "idle" ? 1 : 0.35,
                transform: getCarouselTransform(transitionPhase, slideDirection),
                transitionDuration: `${CAROUSEL_TRANSITION_MS}ms`,
              }}
            >
              {visibleProducts.map((product) => (
                <div
                  key={`${sectionKey}-${startIndex}-${getProductKey(product)}`}
                  className="
                    shrink-0
                    basis-[calc((100%-1rem)/2)]
                    sm:basis-[calc((100%-2rem)/3)]
                    lg:basis-[calc((100%-4rem)/5)]
                    2xl:basis-[calc((100%-5rem)/6)]
                  "
                >
                  <ProductCard product={withStore(product, store)} compact />
                </div>
              ))}
            </div>
          </div>

          {hasMoreThanOne && (
            <>
              <button
                data-testid={`store-product-carousel-prev-${sectionKey}`}
                type="button"
                onClick={previous}
                disabled={isAnimating}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:-translate-x-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "rgba(255,255,255,0.96)",
                  color: "var(--color-equator-green)",
                  border: "1px solid var(--color-equator-beige)",
                  boxShadow: "0 10px 30px rgba(25, 40, 31, 0.12)",
                }}
                aria-label="Produit précédent"
              >
                <FiChevronLeft size={18} />
              </button>

              <button
                data-testid={`store-product-carousel-next-${sectionKey}`}
                type="button"
                onClick={next}
                disabled={isAnimating}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:translate-x-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "rgba(255,255,255,0.96)",
                  color: "var(--color-equator-green)",
                  border: "1px solid var(--color-equator-beige)",
                  boxShadow: "0 10px 30px rgba(25, 40, 31, 0.12)",
                }}
                aria-label="Produit suivant"
              >
                <FiChevronRight size={18} />
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}

function ProductCatalogSection({ title, description, products, store, expanded, onToggle }) {
  const visibleProducts = expanded ? products : products.slice(0, INITIAL_CATALOG_ITEMS);
  const hasMore = products.length > INITIAL_CATALOG_ITEMS;

  return (
    <section data-testid="store-product-section-catalog" aria-labelledby="catalog-title">
      <SectionHeader
        id="catalog-title"
        title={title}
        description={description}
        count={products.length}
        buttonLabel={expanded ? "Réduire" : "Voir tous"}
        showButton={hasMore}
        onClick={onToggle}
      />

      <CompactGrid products={visibleProducts} store={store} />
    </section>
  );
}

function CompactGrid({ products, store }) {
  return (
    <div data-testid="store-products-grid" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6 gap-4">
      {products.map((product) => (
        <ProductCard key={getProductKey(product)} product={withStore(product, store)} compact />
      ))}
    </div>
  );
}

function SectionHeader({ id, title, description, count, showButton, buttonLabel, onClick }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <div>
        <h2
          id={id}
          className="text-xl md:text-2xl font-light leading-tight"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-equator-text)",
          }}
        >
          {title}
          <span
            className="ml-2 text-xs px-2 py-0.5 rounded-full align-middle"
            style={{
              background: "var(--color-equator-beige)",
              color: "var(--color-equator-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            {count}
          </span>
        </h2>

        <p
          className="text-sm mt-1"
          style={{
            color: "var(--color-equator-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          {description}
        </p>
      </div>

      {showButton && (
        <button
          data-testid={`store-product-section-toggle-${id}`}
          type="button"
          onClick={onClick}
          className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: "var(--color-equator-green)", fontFamily: "var(--font-body)" }}
        >
          {buttonLabel} <FiArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

function getCarouselWindow(products, startIndex, count) {
  if (!products.length || count <= 0) return [];

  return Array.from({ length: count }, (_, position) => {
    const productIndex = (startIndex + position) % products.length;
    return products[productIndex];
  });
}

function getCarouselTransform(transitionPhase, slideDirection) {
  if (transitionPhase === "idle") {
    return "translateX(0)";
  }

  if (transitionPhase === "leaving") {
    return slideDirection === "next" ? "translateX(-24px)" : "translateX(24px)";
  }

  return slideDirection === "next" ? "translateX(24px)" : "translateX(-24px)";
}

function withStore(product, store) {
  return {
    ...product,
    storeId: product.storeId ?? store?.id,
    storeName: product.storeName ?? store?.name,
  };
}

function getProductKey(product) {
  return String(product?.sectionType || "product").concat(
    "-",
    product?.id || product?.productId || product?.promoId || product?.summaryId
  );
}

function TabMessage({ message }) {
  return (
    <div className="pb-12">
      <div className="text-center py-20">
        <p
          className="text-lg font-light"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-equator-muted)",
          }}
        >
          {message}
        </p>
      </div>
    </div>
  );
}