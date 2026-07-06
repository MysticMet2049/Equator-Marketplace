import ProductReviewsTab from "./ProductReviewsTab";
import ProductSimilarTab from "./ProductSimilarTab";

const PRODUCT_DETAIL_TABS = ["Avis Clients", "Similaire"];

/** Product tabs keep secondary product details compact and easy to scan. */
export default function ProductTabs({ product, similar = [], activeTab, setActiveTab }) {
  const totalReviews = Object.values(product.ratingBreakdown || {}).reduce(
    (a, b) => a + Number(b || 0),
    0
  );

  return (
    <section data-testid="product-tabs" className="max-w-6xl mx-auto px-4 md:px-6 mt-4 mb-10">
      <div
        className="inline-flex rounded-full bg-white p-1 mb-6"
        style={{ border: "1px solid var(--color-equator-beige)" }}
      >
        {PRODUCT_DETAIL_TABS.map((tab, index) => (
          <button
            key={tab}
            data-testid={`product-tab-${index === 0 ? "reviews" : "similar"}`}
            type="button"
            onClick={() => setActiveTab(index)}
            className="px-5 py-2.5 text-sm font-semibold rounded-full transition-all"
            style={{
              color: activeTab === index ? "white" : "var(--color-equator-muted)",
              background: activeTab === index ? "var(--color-equator-green)" : "transparent",
              fontFamily: "var(--font-body)",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 && <ProductReviewsTab product={product} totalReviews={totalReviews} />}
      {activeTab === 1 && <ProductSimilarTab products={similar} />}
    </section>
  );
}
