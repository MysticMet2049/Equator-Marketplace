import { FiChevronDown } from "react-icons/fi";
import { SORT_OPTIONS } from "../../../data/ui";

export default function SearchResultsHeader({ query, total, sort, setSort, sortOpen, setSortOpen }) {
  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
      <div>
        <h1 className="text-2xl font-light" style={{ fontFamily: "var(--font-display)", color: "var(--color-equator-text)" }}>
          Résultats
          {query && <span className="text-base ml-2 font-normal" style={{ color: "var(--color-equator-muted)" }}>pour « {query} »</span>}
        </h1>

        <p className="text-sm mt-0.5" style={{ color: "var(--color-equator-muted)" }}>
          ({total} articles)
        </p>
      </div>

      <div className="relative">
        <button
          onClick={() => setSortOpen(!sortOpen)}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-colors hover:bg-stone-100"
          style={{
            color: "var(--color-equator-text)",
            fontFamily: "var(--font-body)",
            border: "1px solid var(--color-equator-beige)",
            background: "white",
          }}
        >
          <span className="text-xs" style={{ color: "var(--color-equator-muted)" }}>Trier par:</span>
          <span className="font-medium">{SORT_OPTIONS.find((option) => option.value === sort)?.label}</span>
          <FiChevronDown size={14} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
        </button>

        {sortOpen && (
          <div
            className="absolute right-0 top-full mt-1 rounded-lg z-20 overflow-hidden min-w-[160px]"
            style={{ background: "white", boxShadow: "0 8px 30px rgba(0,0,0,0.10)", border: "1px solid var(--color-equator-beige)" }}
          >
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSort(option.value);
                  setSortOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-stone-50"
                style={{
                  fontFamily: "var(--font-body)",
                  color: sort === option.value ? "var(--color-equator-green)" : "var(--color-equator-text)",
                  fontWeight: sort === option.value ? "600" : "400",
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
