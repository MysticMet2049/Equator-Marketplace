import { Link } from "react-router-dom";
import { formatPrice, RECOMMENDED_PRODUCTS } from "./cartPageUtils";

// Zone de recommandations, conservée même si la liste est vide pour faciliter l'évolution future.
export default function CartRecommendedSection({ products = RECOMMENDED_PRODUCTS }) {
  if (!products.length) return null;

  return (
    <div className="mt-14">
      <h2
        className="text-xl font-light mb-6"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-equator-text)",
        }}
      >
        Recommandé pour vous
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <Link key={product.id} to={`/product/${product.id}`} className="group block">
            <div
              className="rounded-xl overflow-hidden mb-2"
              style={{ aspectRatio: "1/1", background: "#f0ebe3" }}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <p
              className="text-xs font-semibold leading-snug mb-0.5"
              style={{
                color: "var(--color-equator-text)",
                fontFamily: "var(--font-body)",
              }}
            >
              {product.name}
            </p>
            <p
              className="text-xs mb-0.5"
              style={{
                color: "var(--color-equator-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              {product.store}
            </p>
            <p
              className="text-sm font-bold"
              style={{
                color: "var(--color-equator-text)",
                fontFamily: "var(--font-body)",
              }}
            >
              {formatPrice(product.price)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
