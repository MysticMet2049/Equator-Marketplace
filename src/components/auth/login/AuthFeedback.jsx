import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";

export default function AuthFeedback({ error, success }) {
  if (!error && !success) return null;

  if (error) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl mb-5" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
        <FiAlertCircle size={15} style={{ color: "#dc2626", flexShrink: 0 }} />
        <p className="text-xs" style={{ color: "#dc2626", fontFamily: "var(--font-body)" }}>
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-3 rounded-xl mb-5" style={{ background: "#e8f5ee", border: "1px solid #a7f3d0" }}>
      <FiCheckCircle size={15} style={{ color: "var(--color-equator-green)", flexShrink: 0 }} />
      <p className="text-xs" style={{ color: "var(--color-equator-green)", fontFamily: "var(--font-body)" }}>
        {success}
      </p>
    </div>
  );
}
