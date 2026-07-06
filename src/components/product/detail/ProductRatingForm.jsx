import { useState } from "react";
import { FiStar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { hasConfiguredProductRatingEndpoint, rateProduct } from "../../../api/ratingApi";

export default function ProductRatingForm({ product }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const endpointAvailable = hasConfiguredProductRatingEndpoint();
  const visibleRating = hoveredRating || selectedRating;

  const handleSubmit = async () => {
    setError("");
    setMessage("");

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!selectedRating) {
      setError("Choisis une note entre 1 et 5.");
      return;
    }

    if (!endpointAvailable) {
      setMessage("Merci pour votre note.");
      return;
    }

    setSubmitting(true);

    try {
      await rateProduct(product, selectedRating);
      setMessage("Merci pour votre note.");
    } catch (err) {
      setError(err?.message || "Impossible d'envoyer la note pour le moment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      data-testid="product-rating-form"
      className="bg-white rounded-[1.5rem] p-5 w-full"
      style={{
        border: "1px solid var(--color-equator-beige)",
        boxShadow: "0 12px 30px rgba(24, 38, 30, 0.05)",
      }}
    >
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-equator-text)", fontFamily: "var(--font-body)" }}>
            Noter ce produit
          </p>
          <p className="text-xs" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>
            Votre note aide les autres acheteurs à mieux choisir.
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((rating) => {
            const active = rating <= visibleRating;

            return (
              <button
                key={rating}
                data-testid="product-rating-star"
                data-rating-value={rating}
                type="button"
                onClick={() => setSelectedRating(rating)}
                onMouseEnter={() => setHoveredRating(rating)}
                onMouseLeave={() => setHoveredRating(0)}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-stone-100"
                aria-label={`Donner ${rating} étoile${rating > 1 ? "s" : ""}`}
              >
                <FiStar
                  size={19}
                  style={{
                    color: active ? "#f59e0b" : "var(--color-equator-muted)",
                    fill: active ? "#f59e0b" : "none",
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          data-testid="product-rating-submit"
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-white disabled:opacity-60 transition-all hover:-translate-y-0.5"
          style={{ background: "var(--color-equator-green)", fontFamily: "var(--font-body)" }}
        >
          {submitting ? "Envoi..." : "Envoyer la note"}
        </button>

        {message && <p className="text-xs" style={{ color: "#16a34a", fontFamily: "var(--font-body)" }}>{message}</p>}
        {error && <p className="text-xs" style={{ color: "#dc2626", fontFamily: "var(--font-body)" }}>{error}</p>}
      </div>
    </div>
  );
}
