import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

export default function CategoryBreadcrumb({ category }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-4">
      <nav
        className="flex items-center gap-1.5 text-xs"
        style={{
          color: "var(--color-equator-muted)",
          fontFamily: "var(--font-body)",
        }}
      >
        <Link to="/" className="hover:underline">
          Accueil
        </Link>

        <FiChevronRight size={12} />

        <Link to="/categories" className="hover:underline">
          Catégories
        </Link>

        <FiChevronRight size={12} />

        <span style={{ color: "var(--color-equator-text)" }}>
          {category.name}
        </span>
      </nav>
    </div>
  );
}
