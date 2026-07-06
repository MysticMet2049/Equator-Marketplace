// Page Choix d’inscription : permet de sélectionner le type de compte à créer.
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiShoppingBag, FiChevronRight } from "react-icons/fi";

export default function RegisterChoicePage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen pt-14 flex flex-col"
      style={{ background: "var(--color-equator-cream)" }}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <p
          className="text-xs font-semibold tracking-widest mb-4"
          style={{
            color: "var(--color-equator-green)",
            fontFamily: "var(--font-body)",
          }}
        >
          ÉTAPE 1 SUR 3
        </p>

        <h1
          className="text-4xl font-light mb-3 text-center"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-equator-text)",
          }}
        >
          Processus d'inscription
        </h1>

        <p
          className="text-sm text-center mb-10"
          style={{
            color: "var(--color-equator-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          Choisissez comment vous souhaitez rejoindre l'écosystème Equator.
        </p>

        <div className="w-full max-w-lg space-y-4">
          <button
            onClick={() => navigate("/login?mode=register")}
            className="w-full bg-white rounded-2xl p-6 text-left transition-all hover:shadow-md"
            style={{ border: "1.5px solid var(--color-equator-beige)" }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "#e8f5ee" }}
              >
                <FiUser size={20} style={{ color: "var(--color-equator-green)" }} />
              </div>

              <div className="flex-1">
                <h2
                  className="text-xl font-light mb-2"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--color-equator-text)",
                  }}
                >
                  Créer un compte client
                </h2>

                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{
                    color: "var(--color-equator-muted)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Créez votre compte avec un nom d'utilisateur, une adresse email et un mot de passe.
                </p>

                <span
                  className="text-sm font-medium flex items-center gap-1"
                  style={{
                    color: "var(--color-equator-text)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Commencer l'inscription <FiChevronRight size={14} />
                </span>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/sell")}
            className="w-full bg-white rounded-2xl p-6 text-left transition-all hover:shadow-md"
            style={{ border: "1.5px solid var(--color-equator-beige)" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "var(--color-equator-beige)" }}
              >
                <FiShoppingBag size={20} style={{ color: "var(--color-equator-muted)" }} />
              </div>

              <div className="flex-1">
                <h2
                  className="text-xl font-light"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--color-equator-text)",
                  }}
                >
                  Vendre sur Equator
                </h2>

                <p
                  className="text-sm"
                  style={{
                    color: "var(--color-equator-muted)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Rejoignez notre réseau de vendeurs éco-responsables.
                </p>
              </div>

              <FiChevronRight size={16} style={{ color: "var(--color-equator-muted)" }} />
            </div>
          </button>
        </div>

        <p
          className="mt-8 text-sm"
          style={{
            color: "var(--color-equator-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          Vous avez déjà un compte ?{" "}
          <Link
            to="/login"
            className="font-semibold"
            style={{ color: "var(--color-equator-text)" }}
          >
            Connectez-vous ici
          </Link>
        </p>
      </div>
</div>
  );
}
