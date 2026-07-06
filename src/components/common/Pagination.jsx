import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

// Composant de pagination réutilisable.
// current représente la page actuelle, total le nombre total de pages,
// et onChange permet de changer de page.

// Si une seule page existe, la pagination n'est pas affichée.
export default function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;

  
  // Tableau contenant les premières pages à afficher.
  const pages = [];
  // Limite l'affichage direct aux trois premières pages.
  for (let i = 1; i <= Math.min(total, 3); i++) pages.push(i);

  const btn = (label, page, isActive = false, disabled = false) => (
    <button
      key={label}
      onClick={() => !disabled && onChange(page)}
      disabled={disabled}
      className="w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all"
      style={{
        background: isActive ? "var(--color-equator-green)" : "transparent",
        color: isActive ? "white" : disabled ? "#ccc" : "var(--color-equator-text)",
        fontFamily: "var(--font-body)",
        fontWeight: isActive ? "600" : "400",
        border: isActive ? "none" : "1px solid transparent",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      <button
        onClick={() => current > 1 && onChange(current - 1)}
        disabled={current === 1}
        className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-stone-100 disabled:opacity-30"
        style={{ color: "var(--color-equator-text)" }}
      >
        <FiChevronLeft size={16} />
      </button>

      {pages.map((p) => btn(p, p, p === current))}
      {total > 3 && (
        <>
          <span className="text-sm px-1" style={{ color: "var(--color-equator-muted)" }}>…</span>
          {btn(total, total, total === current)}
        </>
      )}

      <button
        onClick={() => current < total && onChange(current + 1)}
        disabled={current === total}
        className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-stone-100 disabled:opacity-30"
        style={{ color: "var(--color-equator-text)" }}
      >
        <FiChevronRight size={16} />
      </button>
    </div>
  );
}
