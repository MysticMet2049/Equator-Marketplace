// Page Vérification e-mail : gère la saisie du code envoyé à l’utilisateur.
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiMail } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmailPage() {
  const { verifyEmail, authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "votre email";
  const verificationType = location.state?.verificationType || "activation";

  const [digits, setDigits] = useState(Array(6).fill(""));
  const [error, setError] = useState(null);
  const [resent, setResent] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  const handleDigit = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...digits];
    next[idx] = val.slice(-1);
    setDigits(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < 6) { setError("Veuillez entrer les 6 chiffres."); return; }
    setError(null);
    const res = await verifyEmail(email, code, verificationType);
    if (res.success) navigate("/account");
    else setError(res.error);
  };

  const handleResend = () => {
    setResent(true);
    setTimeout(() => setResent(false), 4000);
  };

  return (
    <div className="min-h-screen pt-14 flex flex-col" style={{ background: "var(--color-equator-cream)" }}>
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-2xl p-10 w-full max-w-md" style={{ border: "1px solid var(--color-equator-beige)", boxShadow: "0 8px 40px rgba(0,0,0,0.06)" }}>
          {/* Icon */}
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "#d1fae5" }}>
            <FiMail size={24} style={{ color: "var(--color-equator-green)" }} />
          </div>

          <h1 className="text-3xl font-light text-center mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--color-equator-text)" }}>
            Vérifier votre e-mail
          </h1>
          <p className="text-sm text-center mb-8 leading-relaxed" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>
            Nous avons envoyé un code de vérification. Veuillez le saisir ci-dessous pour continuer.
          </p>

          <form onSubmit={handleSubmit}>
            <p className="text-xs font-semibold tracking-widest mb-3 text-center" style={{ color: "var(--color-equator-text)", fontFamily: "var(--font-body)" }}>
              CODE DE VÉRIFICATION
            </p>

            {/* 6-digit input */}
            <div className="flex gap-2 justify-center mb-2" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleDigit(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-11 h-14 text-center text-xl font-semibold rounded-xl outline-none transition-all"
                  style={{
                    border: `1.5px solid ${error ? "#dc2626" : d ? "var(--color-equator-green)" : "var(--color-equator-beige)"}`,
                    fontFamily: "var(--font-body)",
                    color: "var(--color-equator-text)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--color-equator-green)")}
                  onBlur={(e) => (e.target.style.borderColor = d ? "var(--color-equator-green)" : "var(--color-equator-beige)")}
                />
              ))}
            </div>

            {error && <p className="text-xs text-center mb-4" style={{ color: "#dc2626" }}>{error}</p>}

            {/* Hint for demo */}
            <p className="text-xs text-center mb-6" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>
              Saisissez le code reçu pour finaliser la vérification.
            </p>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2"
              style={{ background: authLoading ? "#6b9e84" : "var(--color-equator-green)", fontFamily: "var(--font-body)" }}
            >
              {authLoading ? "Vérification..." : "Confirmer →"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm mb-1" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>
              Vous n'avez pas reçu de code ?
            </p>
            <button
              onClick={handleResend}
              className="text-sm font-semibold transition-opacity hover:opacity-70"
              style={{ color: "var(--color-equator-text)", fontFamily: "var(--font-body)" }}
            >
              {resent ? "Code renvoyé ✓" : "Renvoyer le code"}
            </button>
          </div>
        </div>
      </div>
</div>
  );
}