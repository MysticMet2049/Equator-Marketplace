export default function CategoryStatusMessage({ message, size = "md" }) {
  const padding = size === "lg" ? "py-24" : "py-20";
  const textSize = size === "lg" ? "text-xl" : "text-lg";

  return (
    <div className={`text-center ${padding}`}>
      <p
        className={`${textSize} font-light`}
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-equator-muted)",
        }}
      >
        {message}
      </p>
    </div>
  );
}
