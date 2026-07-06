import ProductRatingForm from "./ProductRatingForm";
import ProductRatingSummary from "./ProductRatingSummary";
import ProductReviewList from "./ProductReviewList";

/** Groups product rating form, rating summary and real customer reviews. */
export default function ProductReviewsTab({ product, totalReviews }) {
  const reviews = Array.isArray(product.reviews) ? product.reviews.filter(Boolean) : [];

  return (
    <div data-testid="product-reviews-tab" className="space-y-6">
      <ProductRatingForm product={product} />

      <div className="grid lg:grid-cols-[360px_minmax(0,1fr)] gap-6">
        <ProductRatingSummary product={product} totalReviews={totalReviews} />
        <ProductReviewList reviews={reviews} />
      </div>
    </div>
  );
}
