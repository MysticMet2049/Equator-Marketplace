import { Link } from "react-router-dom";

export default function FooterLinks({ title, links }) {
  return (
    <nav data-testid={`footer-links-${title.toLowerCase()}`} aria-label={title}>
      <p
        className="text-xs font-bold mb-5 tracking-[0.22em] uppercase"
        style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.92)" }}
      >
        {title}
      </p>

      <ul className="grid grid-cols-2 gap-x-8 gap-y-4 sm:flex sm:flex-wrap sm:gap-x-8 sm:gap-y-3">
        {links.map(([label, to]) => (
          <li key={label}>
            <Link
              to={to}
              className="text-sm transition-opacity hover:opacity-80"
              style={{ color: "rgba(255,255,255,0.82)", fontFamily: "var(--font-body)" }}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
