import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

// En-tête réutilisable pour les sections de la page d'accueil.
export default function HomeSectionHeader({ title, description, linkTo, centered = false }) {
  return (
    <div className={centered ? "text-center mb-8" : "flex items-end justify-between mb-7"}>
      <div className={centered ? "mx-auto" : undefined}>
        <h2
          className="text-2xl font-light"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-equator-text)",
          }}
        >
          {title}
        </h2>
        <p
          className={centered ? "text-sm mt-1 max-w-sm mx-auto" : "text-sm mt-1"}
          style={{
            color: "var(--color-equator-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          {description}
        </p>
      </div>

      {linkTo && !centered && (
        <Link
          to={linkTo}
          className="hidden md:flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: "var(--color-equator-green)", fontFamily: "var(--font-body)" }}
        >
          Tout voir <FiArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
