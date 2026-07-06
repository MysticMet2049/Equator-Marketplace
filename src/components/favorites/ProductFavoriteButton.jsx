import { FiHeart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useFavorites } from "../../hooks/useFavorites";

function getProductId(productOrId) {
  if (typeof productOrId === "string" || typeof productOrId === "number") return productOrId;
  return productOrId?.productId || productOrId?.id || productOrId?.promoId || productOrId?.summaryId || null;
}

export default function ProductFavoriteButton({
  product,
  productId,
  className = "",
  style,
  iconSize = 13,
  preventDefault = false,
  stopPropagation = true,
  onError,
  disabled = false,
  ariaLabel,
}) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isProductFavorite, isProductFavoritePending, toggleFavorite } = useFavorites();

  const target = product || productId;
  const resolvedProductId = getProductId(target);
  const favorite = isProductFavorite(target);
  const pending = isProductFavoritePending(target);

  const handleToggle = async (event) => {
    if (stopPropagation) event.stopPropagation();
    if (preventDefault) event.preventDefault();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!resolvedProductId || pending || disabled) return;

    try {
      await toggleFavorite(target);
    } catch (error) {
      onError?.(error);
    }
  };

  return (
    <button
      data-testid="product-favorite-button"
      type="button"
      onClick={handleToggle}
      disabled={disabled || pending || !resolvedProductId}
      className={className}
      style={{ ...style, opacity: pending ? 0.65 : style?.opacity }}
      aria-label={ariaLabel || (favorite ? "Retirer des favoris" : "Ajouter aux favoris")}
      title={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <FiHeart
        size={iconSize}
        style={{
          color: favorite ? "#dc2626" : "var(--color-equator-muted)",
          fill: favorite ? "#dc2626" : "none",
        }}
      />
    </button>
  );
}
