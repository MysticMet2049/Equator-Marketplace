import StarRating from "../../common/StarRating";
import { FILTER_CATEGORIES } from "../../../data/ui";

export default function SearchFiltersSidebar({ selectedCategories, priceRange, setPriceRange, minRating, setMinRating, onToggleCategory }) {
  return (
    <aside className="hidden lg:block w-56 shrink-0 space-y-5">
      <FilterBox title="CATÉGORIES">
        <ul className="space-y-3">
          {FILTER_CATEGORIES.map((category) => (
            <li key={category} className="flex items-center gap-2.5 cursor-pointer group" onClick={() => onToggleCategory(category)}>
              <Checkbox checked={selectedCategories.includes(category)} />
              <span className="text-sm" style={{ color: "var(--color-equator-text)", fontFamily: "var(--font-body)" }}>
                {category}
              </span>
            </li>
          ))}
        </ul>
      </FilterBox>

      <FilterBox title="PRIX">
        <div className="space-y-3">
          <input
            type="range"
            min={0}
            max={500}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="w-full accent-green-800"
            style={{ accentColor: "var(--color-equator-green)" }}
          />

          <div className="flex justify-between text-xs" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>
            <span>{priceRange[0]}</span>
            <span>{priceRange[1] === 500 ? "500+" : priceRange[1]}</span>
          </div>
        </div>
      </FilterBox>

      <FilterBox title="ÉVALUATION">
        <button onClick={() => setMinRating(minRating === 4 ? 0 : 4)} className="flex items-center gap-2">
          <StarRating rating={4} size={16} />
          <span className="text-xs" style={{ color: "var(--color-equator-muted)" }}>
            & plus
          </span>
        </button>
      </FilterBox>
    </aside>
  );
}

function FilterBox({ title, children }) {
  return (
    <div className="bg-white rounded-xl p-5" style={{ border: "1px solid var(--color-equator-beige)" }}>
      <p className="text-xs font-bold tracking-widest mb-4" style={{ color: "var(--color-equator-text)", fontFamily: "var(--font-body)" }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function Checkbox({ checked }) {
  return (
    <div
      className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all"
      style={{
        border: `1.5px solid ${checked ? "var(--color-equator-green)" : "#ccc"}`,
        background: checked ? "var(--color-equator-green)" : "white",
      }}
    >
      {checked && (
        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
          <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}
