import { Link } from "react-router-dom";
import { FiUser } from "react-icons/fi";

export default function AccountGuestState() {
  return (
    <div className="min-h-screen pt-14 flex flex-col items-center justify-center gap-6 px-6" style={{ background: "var(--color-equator-cream)" }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "var(--color-equator-beige)" }}>
        <FiUser size={28} style={{ color: "var(--color-equator-muted)" }} />
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-light mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--color-equator-text)" }}>
          Espace personnel
        </h2>
        <p className="text-sm" style={{ color: "var(--color-equator-muted)" }}>
          Connectez-vous pour accéder à votre compte.
        </p>
      </div>

      <div className="flex gap-3">
        <Link to="/login" className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--color-equator-green)" }}>
          Se connecter
        </Link>
        <Link to="/login?mode=register" className="px-6 py-2.5 rounded-xl text-sm font-medium" style={{ border: "1.5px solid var(--color-equator-beige)", color: "var(--color-equator-text)" }}>
          Créer un compte
        </Link>
      </div>
    </div>
  );
}
