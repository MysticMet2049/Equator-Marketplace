import { FiStar } from "react-icons/fi";
import { PiStarFill, PiStarHalfFill } from "react-icons/pi";

export default function StarRating({ rating, size = 14, showValue = false, count = null }) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (rating >= i + 1) return "full";
    if (rating >= i + 0.5) return "half";
    return "empty";
  });

  return (
    <span className="inline-flex items-center gap-1">
      <span className="flex items-center gap-0.5">
        {stars.map((type, i) => (
          <span key={i} style={{ color: "#f59e0b" }}>
            {type === "full" ? (
              <PiStarFill size={size} />
            ) : type === "half" ? (
              <PiStarHalfFill size={size} />
            ) : (
              <FiStar size={size} style={{ color: "#d1d5db" }} />
            )}
          </span>
        ))}
      </span>
      {showValue && (
        <span className="text-xs font-medium" style={{ color: "var(--color-equator-text)" }}>
          {rating}
        </span>
      )}
      {count !== null && (
        <span className="text-xs" style={{ color: "var(--color-equator-muted)" }}>
          ({count})
        </span>
      )}
    </span>
  );
}
