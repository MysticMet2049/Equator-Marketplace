import StarRating from "../../common/StarRating";

const REVIEW_STARS = [5, 4, 3];

/** Displays the global rating and distribution bars for one product. */
export default function ProductRatingSummary({ product, totalReviews }) {
  const breakdown = product.ratingBreakdown || {};

  return (
    <div
      className="bg-white rounded-2xl p-6"
      style={{ border: "1px solid var(--color-equator-beige)" }}
    >
      <p
        className="text-xs font-semibold tracking-[0.24em] mb-5"
        style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}
      >
        NOTE MOYENNE
      </p>

      <p
        className="text-5xl font-bold mb-1"
        style={{ color: "var(--color-equator-text)", fontFamily: "var(--font-body)" }}
      >
        {product.rating}
      </p>

      <StarRating rating={product.rating} size={18} />

      <p
        className="text-xs mt-2 mb-6"
        style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}
      >
        Basé sur {product.reviewCount} avis vérifiés
      </p>

      <div className="space-y-2">
        {REVIEW_STARS.map((star) => {
          const count = breakdown[star] || 0;
          const pct = totalReviews ? Math.round((count / totalReviews) * 100) : 0;

          return (
            <div key={star} className="flex items-center gap-3">
              <span
                className="text-xs w-4"
                style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}
              >
                {star}
              </span>

              <div
                className="flex-1 h-2 rounded-full overflow-hidden"
                style={{ background: "var(--color-equator-beige)" }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: "var(--color-equator-green)" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
