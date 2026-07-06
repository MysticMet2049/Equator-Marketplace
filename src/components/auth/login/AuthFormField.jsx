import { FiEye, FiEyeOff } from "react-icons/fi";

export default function AuthFormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  autoComplete,
  withPasswordToggle = false,
  showPassword = false,
  onTogglePassword,
}) {
  const hasError = Boolean(error);
  const inputType = withPasswordToggle ? (showPassword ? "text" : "password") : type;

  const inputBaseStyle = {
    border: `1.5px solid ${hasError ? "#dc2626" : "var(--color-equator-beige)"}`,
    fontFamily: "var(--font-body)",
    background: "white",
  };

  return (
    <div>
      <label
        className="block text-xs font-semibold tracking-widest mb-1.5"
        style={{
          color: "var(--color-equator-text)",
          fontFamily: "var(--font-body)",
        }}
      >
        {label}
      </label>

      <div className="relative">
        <input
          type={inputType}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
          style={inputBaseStyle}
          onFocus={(event) => {
            event.target.style.borderColor = "var(--color-equator-green)";
          }}
          onBlur={(event) => {
            event.target.style.borderColor = hasError
              ? "#dc2626"
              : "var(--color-equator-beige)";
          }}
        />

        {withPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--color-equator-muted)" }}
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        )}
      </div>

      {hasError && (
        <p className="text-xs mt-1" style={{ color: "#dc2626" }}>
          {error}
        </p>
      )}
    </div>
  );
}
