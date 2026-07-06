import { useState } from "react";
import { Link } from "react-router-dom";
import StarRating from "../../common/StarRating";

export default function StoreReviewsTab({
  store,
  reviews = [],
  isAuthenticated,
  ratingBreakdown,
  totalReviews,
  submitting = false,
  submitMessage = "",
  submitError = "",
  onSubmitReview,
}) {
  return (
    <div className="pb-12">
      {!isAuthenticated && <LoginReviewPrompt />}

      {isAuthenticated && (
        <ReviewForm
          submitting={submitting}
          submitMessage={submitMessage}
          submitError={submitError}
          onSubmitReview={onSubmitReview}
        />
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <RatingSummary
          store={store}
          ratingBreakdown={ratingBreakdown}
          totalReviews={totalReviews}
        />
        <ReviewList reviews={reviews} store={store} />
      </div>
    </div>
  );
}

function LoginReviewPrompt() {
  return (
    <div
      className="bg-white rounded-2xl p-5 mb-6 flex items-center justify-between gap-4"
      style={{ border: "1px solid var(--color-equator-beige)" }}
    >
      <p
        className="text-sm"
        style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}
      >
        Connectez-vous pour laisser un avis sur cette boutique.
      </p>

      <Link
        to="/login"
        className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white shrink-0"
        style={{ background: "var(--color-equator-green)", fontFamily: "var(--font-body)" }}
      >
        Se connecter
      </Link>
    </div>
  );
}

function ReviewForm({ submitting, submitMessage, submitError, onSubmitReview }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = await onSubmitReview?.({ rating, comment });

    if (result?.ok) {
      setRating(5);
      setComment("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl p-5 mb-6 space-y-4"
      style={{ border: "1px solid var(--color-equator-beige)" }}
    >
      <div>
        <p
          className="text-sm font-semibold mb-2"
          style={{ color: "var(--color-equator-text)", fontFamily: "var(--font-body)" }}
        >
          Laisser un avis
        </p>
        <p
          className="text-xs"
          style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}
        >
          Donnez une note et un commentaire sur votre expérience avec cette boutique.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label
          className="text-sm"
          style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}
        >
          Note
        </label>
        <select
          value={rating}
          onChange={(event) => setRating(Number(event.target.value))}
          className="px-3 py-2 rounded-lg text-sm bg-white"
          style={{ border: "1px solid var(--color-equator-beige)" }}
        >
          {[5, 4, 3, 2, 1].map((star) => (
            <option key={star} value={star}>
              {star}/5
            </option>
          ))}
        </select>
      </div>

      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        rows={3}
        placeholder="Votre commentaire..."
        className="w-full px-3 py-2 rounded-xl text-sm bg-white resize-none"
        style={{ border: "1px solid var(--color-equator-beige)", fontFamily: "var(--font-body)" }}
      />

      {submitMessage && (
        <p className="text-xs" style={{ color: "var(--color-equator-green)" }}>
          {submitMessage}
        </p>
      )}

      {submitError && (
        <p className="text-xs" style={{ color: "#dc2626" }}>
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !comment.trim()}
        className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
        style={{ background: "var(--color-equator-green)", fontFamily: "var(--font-body)" }}
      >
        {submitting ? "Envoi..." : "Envoyer mon avis"}
      </button>
    </form>
  );
}

function RatingSummary({ store, ratingBreakdown, totalReviews }) {
  const displayedReviewCount = Number(totalReviews || store.reviewCount || 0);
  const safeBreakdown = buildSafeBreakdown(ratingBreakdown, store, displayedReviewCount);

  return (
    <div
      className="bg-white rounded-2xl p-6"
      style={{ border: "1px solid var(--color-equator-beige)" }}
    >
      <p
        className="text-5xl font-bold mb-1"
        style={{ color: "var(--color-equator-text)", fontFamily: "var(--font-body)" }}
      >
        {store.rating || 0}
      </p>

      <StarRating rating={store.rating || 0} size={18} />

      <p className="text-xs mt-2 mb-5" style={{ color: "var(--color-equator-muted)" }}>
        Basé sur {displayedReviewCount} avis vérifiés
      </p>

      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = safeBreakdown?.[star] || 0;
          const percentage = displayedReviewCount
            ? Math.round((count / displayedReviewCount) * 100)
            : 0;

          return (
            <div key={star} className="flex items-center gap-3">
              <span className="text-xs w-3" style={{ color: "var(--color-equator-muted)" }}>
                {star}
              </span>
              <div
                className="flex-1 h-2 rounded-full overflow-hidden"
                style={{ background: "var(--color-equator-beige)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${percentage}%`, background: "var(--color-equator-green)" }}
                />
              </div>
              <span className="text-xs w-6 text-right" style={{ color: "var(--color-equator-muted)" }}>
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewList({ reviews, store }) {
  if (!reviews || reviews.length === 0) {
    const hasRatingWithoutDetailedReviews = Number(store?.reviewCount || 0) > 0;

    return (
      <div
        className="bg-white rounded-2xl p-5"
        style={{ border: "1px solid var(--color-equator-beige)" }}
      >
        <p
          className="text-sm"
          style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}
        >
          {hasRatingWithoutDetailedReviews
            ? "Les notes existent, mais les commentaires détaillés ne sont pas encore fournis par l’API."
            : "Aucun avis disponible pour cette boutique."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-white rounded-2xl p-5"
          style={{ border: "1px solid var(--color-equator-beige)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: "var(--color-equator-green)" }}
              >
                {review.avatar || review.name?.charAt(0) || "C"}
              </div>

              <div>
                <p
                  className="text-xs font-semibold"
                  style={{ fontFamily: "var(--font-body)", color: "var(--color-equator-text)" }}
                >
                  {review.name || "Client"}
                </p>
                <p className="text-xs" style={{ color: "var(--color-equator-muted)" }}>
                  {review.date || ""}
                </p>
              </div>
            </div>

            <StarRating rating={review.rating || 0} size={11} />
          </div>

          <p
            className="text-sm leading-relaxed italic"
            style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}
          >
            “{review.text || ""}”
          </p>
        </div>
      ))}
    </div>
  );
}

function buildSafeBreakdown(ratingBreakdown, store, displayedReviewCount) {
  const base = {
    5: Number(ratingBreakdown?.[5] || 0),
    4: Number(ratingBreakdown?.[4] || 0),
    3: Number(ratingBreakdown?.[3] || 0),
    2: Number(ratingBreakdown?.[2] || 0),
    1: Number(ratingBreakdown?.[1] || 0),
  };

  const total = Object.values(base).reduce((sum, count) => sum + count, 0);

  if (total > 0 || !displayedReviewCount || !store?.rating) {
    return base;
  }

  const roundedRating = Math.max(1, Math.min(5, Math.round(Number(store.rating))));

  return {
    ...base,
    [roundedRating]: displayedReviewCount,
  };
}
