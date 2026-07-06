import { Link } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import StarRating from "../../common/StarRating";
import { getProductPrice, getProductRating } from "../categoryUtils";
import CategoryProductImage from "./CategoryProductImage";
import ProductFavoriteButton from "../../favorites/ProductFavoriteButton";

export default function CategoryProductCard({ product, onAdd, added }) {
  const price = getProductPrice(product);
  const rating = getProductRating(product);
  const productId = product.productId || product.id;

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ border: "1px solid var(--color-equator-beige)" }}
    >
      <Link
        to={`/product/${productId}`}
        className="relative block overflow-hidden"
        style={{
          aspectRatio: "1/1",
          background: "#f0ebe3",
        }}
      >
        <CategoryProductImage product={product} />

        <ProductFavoriteButton
          product={product}
          preventDefault
          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all"
          style={{
            background: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
          }}
        />

        {product.badge && (
          <span
            className="absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full text-white"
            style={{
              background:
                product.badge === "Nouveau" ||
                product.badge === "NOUVEAU" ||
                product.badge === "Nouveauté"
                  ? "var(--color-equator-green)"
                  : "var(--color-equator-green-dark)",
              fontFamily: "var(--font-body)",
              fontSize: "10px",
            }}
          >
            {product.badge}
          </span>
        )}
      </Link>

      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <div className="flex items-center justify-between">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background: "#e8f5ee",
              color: "var(--color-equator-green)",
              fontFamily: "var(--font-body)",
            }}
          >
            {product.derivedCategoryName || "Produit"}
          </span>

          <div className="flex items-center gap-1">
            <StarRating rating={rating} size={11} />

            <span
              className="text-xs font-medium"
              style={{ color: "var(--color-equator-muted)" }}
            >
              {rating}
            </span>
          </div>
        </div>

        <Link to={`/product/${product.id}`}>
          <p
            className="text-sm font-medium leading-snug"
            style={{
              color: "var(--color-equator-text)",
              fontFamily: "var(--font-body)",
            }}
          >
            {product.name || "Produit"}
          </p>
        </Link>

        <p
          className="text-sm font-semibold"
          style={{
            color: "var(--color-equator-text)",
            fontFamily: "var(--font-body)",
          }}
        >
          {price.toLocaleString("fr-FR")} FCFA
        </p>

        <button
          onClick={onAdd}
          className="w-full mt-2 py-2 rounded-lg text-xs font-medium text-white flex items-center justify-center gap-1.5 transition-all"
          style={{
            background: added ? "#16a34a" : "var(--color-equator-green)",
            fontFamily: "var(--font-body)",
          }}
        >
          <FiShoppingCart size={12} />
          {added ? "Ajouté !" : "Ajouter au panier"}
        </button>
      </div>
    </div>
  );
}
