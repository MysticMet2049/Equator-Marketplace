export default function FooterBrand() {
  return (
    <div data-testid="footer-brand" className="max-w-md">
      <p
        className="text-3xl md:text-4xl font-semibold mb-5"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Equator
      </p>

      <p
        className="text-sm md:text-base leading-8"
        style={{ color: "rgba(255,255,255,0.80)", fontFamily: "var(--font-body)" }}
      >
        Une marketplace pensée pour découvrir les meilleurs stores partenaires et acheter plus simplement.
      </p>
    </div>
  );
}
