import AuthFormField from "./AuthFormField";

export default function RegisterForm({
  form,
  setForm,
  errors,
  showPassword,
  onTogglePassword,
  onSubmit,
  loading,
  onFieldChange,
}) {
  const updateField = (name, value) => {
    if (onFieldChange) {
      onFieldChange(name, value);
      return;
    }

    setForm((previous) => ({ ...previous, [name]: value }));
  };
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <AuthFormField
        label="NOM D'UTILISATEUR"
        name="username"
        value={form.username}
        onChange={(event) => updateField("username", event.target.value)}
        placeholder="votre_username"
        error={errors.registerUsername}
        autoComplete="username"
      />

      <AuthFormField
        label="ADRESSE EMAIL"
        name="email"
        value={form.email}
        onChange={(event) => updateField("email", event.target.value)}
        type="email"
        placeholder="jean.dupont@exemple.com"
        error={errors.email}
        autoComplete="email"
      />

      <AuthFormField
        label="NUMÉRO DE TÉLÉPHONE"
        name="mobileNumber"
        value={form.mobileNumber}
        onChange={(event) => updateField("mobileNumber", event.target.value)}
        type="tel"
        placeholder="Ex : 699000000"
        error={errors.mobileNumber}
        autoComplete="tel"
      />

      <AuthFormField
        label="MOT DE PASSE"
        name="password"
        value={form.password}
        onChange={(event) => updateField("password", event.target.value)}
        placeholder="••••••••"
        error={errors.registerPassword}
        withPasswordToggle
        showPassword={showPassword}
        onTogglePassword={onTogglePassword}
        autoComplete="new-password"
      />

      <AuthFormField
        label="CONFIRMER LE MOT DE PASSE"
        name="confirmPassword"
        value={form.confirmPassword}
        onChange={(event) => updateField("confirmPassword", event.target.value)}
        placeholder="••••••••"
        error={errors.confirmPassword}
        withPasswordToggle
        showPassword={showPassword}
        onTogglePassword={onTogglePassword}
        autoComplete="new-password"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all"
        style={{
          background: loading ? "#6b9e84" : "var(--color-equator-green)",
          fontFamily: "var(--font-body)",
        }}
      >
        {loading ? "Création..." : "Créer mon compte →"}
      </button>
    </form>
  );
}
