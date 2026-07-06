// Message de statut simple pour les chargements, erreurs et listes vides.
export default function HomeSectionStatus({ children, testId = "home-section-status" }) {
  return (
    <div data-testid={testId} className="py-10 text-center">
      <p
        className="text-sm"
        style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}
      >
        {children}
      </p>
    </div>
  );
}
