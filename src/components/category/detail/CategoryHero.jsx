export default function CategoryHero({ category }) {
  return (
    <div className="max-w-7xl mx-auto px-6 mb-8">
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          height: "160px",
          background: "var(--color-equator-green-dark)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.35), rgba(0,0,0,0.05))",
          }}
        />

        <div className="absolute inset-0 flex flex-col justify-center px-8 text-white">
          <p className="text-xs font-medium tracking-widest mb-2 opacity-80">
            {category.description}
          </p>

          <h1
            className="text-2xl font-light"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Catégorie {category.name}
          </h1>
        </div>
      </div>
    </div>
  );
}
