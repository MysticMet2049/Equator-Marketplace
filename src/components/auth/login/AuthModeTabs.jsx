export default function AuthModeTabs({ mode, onChangeMode }) {
  return (
    <div className="grid grid-cols-2 gap-2 p-1 rounded-xl mb-6" style={{ background: "var(--color-equator-beige)" }}>
      {[{ key: "login", label: "Connexion" }, { key: "register", label: "Inscription" }].map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChangeMode(item.key)}
          className="py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: mode === item.key ? "white" : "transparent",
            color: mode === item.key ? "var(--color-equator-text)" : "var(--color-equator-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
