import { Link } from "react-router-dom";
import AuthFormField from "./AuthFormField";

export default function LoginForm({
  form,
  setForm,
  errors,
  showPassword,
  onTogglePassword,
  onSubmit,
  loading,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <AuthFormField
        label="NOM D'UTILISATEUR"
        name="username"
        value={form.username}
        onChange={(event) => setForm((previous) => ({ ...previous, username: event.target.value }))}
        placeholder="votre_username"
        error={errors.username}
        autoComplete="username"
      />

      <AuthFormField
        label="MOT DE PASSE"
        name="password"
        value={form.password}
        onChange={(event) => setForm((previous) => ({ ...previous, password: event.target.value }))}
        placeholder="••••••••"
        error={errors.password}
        withPasswordToggle
        showPassword={showPassword}
        onTogglePassword={onTogglePassword}
        autoComplete="current-password"
      />

      <div className="flex justify-end">
        <Link to="/forgot-password" className="text-xs" style={{ color: "var(--color-equator-green)", fontFamily: "var(--font-body)" }}>
          Mot de passe oublié ?
        </Link>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all"
        style={{
          background: loading ? "#6b9e84" : "var(--color-equator-green)",
          fontFamily: "var(--font-body)",
        }}
      >
        {loading ? "Connexion..." : "Se connecter →"}
      </button>
    </form>
  );
}
