export default function AuthSwitchLink({ mode, onChangeMode }) {
  const isLogin = mode === "login";

  return (
    <div className="mt-8 text-center">
      <p className="text-sm mb-3" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>
        {isLogin ? "Vous n'avez pas de compte ?" : "Vous avez déjà un compte ?"}
      </p>

      <button
        type="button"
        onClick={() => onChangeMode(isLogin ? "register" : "login")}
        className="w-full block py-2.5 rounded-xl text-sm font-semibold text-center transition-colors hover:bg-stone-50"
        style={{
          border: "1.5px solid var(--color-equator-text)",
          color: "var(--color-equator-text)",
          fontFamily: "var(--font-body)",
        }}
      >
        {isLogin ? "Créer un compte" : "Se connecter"}
      </button>
    </div>
  );
}
