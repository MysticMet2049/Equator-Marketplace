export default function FooterNewsletter() {
  return (
    <div data-testid="footer-newsletter">
      <p className="text-sm font-bold mb-6 tracking-widest" style={{ fontFamily: "var(--font-body)" }}>
        NEWSLETTER
      </p>

      <p
        className="text-sm leading-7 mb-7 max-w-sm"
        style={{ color: "rgba(255,255,255,0.78)", fontFamily: "var(--font-body)" }}
      >
        Recevez nos dernières sorties et offres exclusives.
      </p>

      <div
        className="rounded-2xl px-6 py-5"
        style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.16)" }}
      >
        <p className="text-sm font-bold mb-2" style={{ fontFamily: "var(--font-body)" }}>
          Support Equator
        </p>

        <p className="text-sm font-extrabold" style={{ color: "#d9f99d", fontFamily: "var(--font-body)" }}>
          DISPONIBLE POUR VOUS ACCOMPAGNER
        </p>
      </div>
    </div>
  );
}
