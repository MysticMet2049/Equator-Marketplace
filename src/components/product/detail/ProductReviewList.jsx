import StarRating from "../../common/StarRating";

/** Shows real customer reviews or a neutral empty state when no review exists. */
export default function ProductReviewList({ reviews = [] }) {
  if (!reviews.length) {
    return (
      <div
        className="bg-white rounded-2xl p-6 text-sm"
        style={{
          border: "1px solid var(--color-equator-beige)",
          color: "var(--color-equator-muted)",
          fontFamily: "var(--font-body)",
        }}
      >
        Soyez le premier à laisser un avis sur ce produit.
      </div>
    );
  }

  return (
    <div data-testid="product-review-list" className="space-y-4">
      {reviews.map((review, index) => (
        <div
          key={review?.id || review?.reviewId || `${review?.name || "review"}-${index}`}
          className="bg-white rounded-2xl p-5"
          style={{ border: "1px solid var(--color-equator-beige)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: "var(--color-equator-green)", fontFamily: "var(--font-body)" }}
              >
                {review.avatar || review.name?.charAt(0) || "U"}
              </div>

              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--color-equator-text)", fontFamily: "var(--font-body)" }}
                >
                  {review.name || "Utilisateur"}
                </p>

                <p
                  className="text-xs"
                  style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}
                >
                  Acheteur vérifié{review.date ? ` · ${review.date}` : ""}
                </p>
              </div>
            </div>

            <StarRating rating={review.rating || 0} size={12} />
          </div>

          {review.text && (
            <p
              className="text-sm leading-relaxed italic"
              style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}
            >
              “{review.text}”
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
