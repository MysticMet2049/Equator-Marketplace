export default function LoginHeroPanel() {
  return (
    <div
      className="hidden lg:block w-2/5 relative overflow-hidden"
      style={{ minHeight: "calc(100vh - 3.5rem)" }}
    >
      <img
        src="https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=800&q=80"
        alt="Intérieur élégant"
        className="w-full h-full object-cover"
      />

      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.35)" }} />

      <div className="absolute bottom-12 left-10 right-10 text-white">
        <h2 className="text-3xl font-light mb-3" style={{ fontFamily: "var(--font-display)" }}>
          L'élégance du commerce conscient.
        </h2>

        <p className="text-sm opacity-80" style={{ fontFamily: "var(--font-body)" }}>
          Rejoignez une communauté dédiée à l'artisanat d'exception et au design durable.
        </p>
      </div>
    </div>
  );
}
