import { Link } from "react-router-dom";
import { FiX, FiLock } from "react-icons/fi";

// Modal affichée lorsqu'une action nécessite une authentification
export default function AuthModal({ onClose, message }) {
  return (
    // Overlay sombre couvrant tout l'écran
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      {/* Conteneur principal de la modal */}
      <div
        className="bg-white rounded-2xl p-8 max-w-sm w-full relative"
        style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full transition-colors hover:bg-stone-100"
        >
          <FiX size={16} style={{ color: "var(--color-equator-muted)" }} />
        </button>

        {/* Icône cadenas indiquant qu'une connexion est requise */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "#e8f5ee" }}
        >
          <FiLock size={20} style={{ color: "var(--color-equator-green)" }} />
        </div>

        {/* Titre de la modal */}
        <h3
          className="text-lg font-semibold text-center mb-2"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-equator-text)" }}
        >
          Connexion requise
        </h3>
        <p
          className="text-sm text-center mb-6 leading-relaxed"
          style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}
        >
          {message ||
            "Vous devez créer un compte ou vous connecter pour utiliser cette fonctionnalité."}
        </p>

        {/* Actions proposées à l'utilisateur */}
        <div className="flex flex-col gap-2">
           {/* Bouton vers la page de connexion */}
          <Link
            to="/login"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white text-center transition-opacity hover:opacity-90"
            style={{ background: "var(--color-equator-green)", fontFamily: "var(--font-body)" }}
          >
            Se connecter
          </Link>
            {/* Bouton vers la page d'inscription */}
          <Link
            to="/register"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-center transition-colors hover:bg-stone-50"
            style={{
              border: "1px solid var(--color-equator-beige)",
              color: "var(--color-equator-text)",
              fontFamily: "var(--font-body)",
            }}
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}