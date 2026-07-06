import { useEffect, useState } from "react";
import productApi from "../api/productApi";
import HeroCarousel from "../components/home/HeroCarousel";
import FeaturedProductsSection from "../components/home/sections/FeaturedProductsSection";
import PartnerStoresSection from "../components/home/sections/PartnerStoresSection";
import { buildStoreHeroSlides } from "../components/home/homePageUtils";
import { useHeadlineStores } from "../hooks/useStores";

const INITIAL_PRODUCT_SECTIONS = {
  promoProducts: [],
  featuredProducts: [],
  catalogProducts: [],
};

// Page d'accueil : stores en bannière, puis sections produits bien séparées.
export default function HomePage() {
  const [productSections, setProductSections] = useState(INITIAL_PRODUCT_SECTIONS);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  const {
    stores: partnerStores,
    loading: storesLoading,
    error: storesError,
    isEmpty: storesEmpty,
  } = useHeadlineStores({ pageSize: 5 });

  useEffect(() => {
    let cancelled = false;

    async function loadProductSections() {
      setProductsLoading(true);
      setProductsError(null);

      try {
        const sections = await productApi.getHomeProductSections({ limit: 12 });

        if (!cancelled) {
          setProductSections(sections);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("[HomePage] Impossible de charger les sections produits:", err);
          setProductsError(err);
        }
      } finally {
        if (!cancelled) {
          setProductsLoading(false);
        }
      }
    }

    loadProductSections();

    return () => {
      cancelled = true;
    };
  }, []);

  const heroSlides = buildStoreHeroSlides(partnerStores);

  return (
    <main data-testid="home-page">
      <HeroCarousel slides={heroSlides} />

      <FeaturedProductsSection
        testId="home-promo-products-section"
        title="Produits promotionnels"
        description="Profitez des offres et réductions disponibles sur Equator."
        products={productSections.promoProducts}
        loading={productsLoading}
        error={productsError}
        isEmpty={!productsLoading && productSections.promoProducts.length === 0}
      />

      <FeaturedProductsSection
        testId="home-featured-products-section"
        title="Produits phares"
        description="Découvrez les produits mis en avant par les boutiques."
        products={productSections.featuredProducts}
        loading={productsLoading}
        error={productsError}
        isEmpty={!productsLoading && productSections.featuredProducts.length === 0}
        alternate
      />

      <FeaturedProductsSection
        testId="home-catalog-products-section"
        title="Produits du catalogue"
        description="Une sélection de produits classiques disponibles dans les stores."
        products={productSections.catalogProducts}
        loading={productsLoading}
        error={productsError}
        isEmpty={!productsLoading && productSections.catalogProducts.length === 0}
      />

      <PartnerStoresSection
        testId="home-partner-stores-section"
        stores={partnerStores}
        loading={storesLoading}
        error={storesError}
        isEmpty={storesEmpty}
      />
    </main>
  );
}
