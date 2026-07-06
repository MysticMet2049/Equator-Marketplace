import { Link } from "react-router-dom";

export default function EmptyState({ icon: Icon, text, actionLabel, actionTo }) {
  return (
    <div className="bg-white rounded-2xl p-12 text-center" style={{ border: "1px solid var(--color-equator-beige)" }}>
      <Icon size={32} className="mx-auto mb-3" style={{ color: "var(--color-equator-beige)" }} />
      <p className="text-sm" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>
        {text}
      </p>
      {actionTo && (
        <Link to={actionTo} className="text-xs font-medium mt-2 inline-block" style={{ color: "var(--color-equator-green)" }}>
          {actionLabel} →
        </Link>
      )}
    </div>
  );
}
