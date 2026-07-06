import { FiChevronDown } from "react-icons/fi";
import { SORT_OPTIONS } from "../categoryConfig";

export default function CategorySortDropdown({
  sort,
  sortOpen,
  onToggle,
  onChange,
}) {
  const selectedLabel = SORT_OPTIONS.find((option) => option.value === sort)?.label;

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-white"
        style={{
          border: "1px solid var(--color-equator-beige)",
          fontFamily: "var(--font-body)",
          color: "var(--color-equator-text)",
        }}
      >
        Trier par:
        <span className="font-medium">{selectedLabel}</span>

        <FiChevronDown size={12} className={sortOpen ? "rotate-180" : ""} />
      </button>

      {sortOpen && (
        <div
          className="absolute right-0 top-full mt-1 rounded-lg z-20 overflow-hidden min-w-[150px]"
          style={{
            background: "white",
            boxShadow: "0 8px 30px rgba(0,0,0,0.10)",
            border: "1px solid var(--color-equator-beige)",
          }}
        >
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className="w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-stone-50"
              style={{
                fontFamily: "var(--font-body)",
                color:
                  sort === option.value
                    ? "var(--color-equator-green)"
                    : "var(--color-equator-text)",
                fontWeight: sort === option.value ? "600" : "400",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
