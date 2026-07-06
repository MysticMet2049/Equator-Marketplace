import { STORE_TABS } from "../../../data/ui";

export default function StoreTabsNav({ activeTab, setActiveTab, productsLoading, productsCount }) {
  return (
    <div data-testid="store-tabs" className="flex border-b my-6" style={{ borderColor: "var(--color-equator-beige)" }}>
      {STORE_TABS.map((tab, index) => (
        <button
          key={tab}
          data-testid={`store-tab-${index}`}
          onClick={() => setActiveTab(index)}
          className="px-5 py-3 text-sm font-medium transition-all"
          style={{
            color: activeTab === index ? "var(--color-equator-text)" : "var(--color-equator-muted)",
            borderBottom: activeTab === index ? "2px solid var(--color-equator-green)" : "2px solid transparent",
            marginBottom: "-1px",
            fontFamily: "var(--font-body)",
          }}
        >
          {tab}
          {index === 0 && (
            <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--color-equator-beige)", color: "var(--color-equator-muted)" }}>
              {productsLoading ? "..." : productsCount || ""}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
