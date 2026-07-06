import { Link } from "react-router-dom";
import { formatPrice, getProductId, getProductImages } from "./productDetailUtils";
import ProductImage from "./ProductImage";

export default function SimilarProducts({ products = [] }) {
  if (!products.length) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 mb-12">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-semibold tracking-widest mb-1" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>
            INSPIRATION
          </p>

          <p className="text-xl font-light" style={{ color: "var(--color-equator-text)", fontFamily: "var(--font-display)" }}>
            Produits similaires
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((item, index) => {
          const similarId = getProductId(item);
          const similarImages = getProductImages(item);

          return (
            <Link
              key={similarId || item?.name || `similar-product-${index}`}
              to={`/product/${similarId}`}
              state={{ product: { ...item, id: similarId, productId: similarId } }}
              className="group block rounded-[1.5rem] bg-white p-3 transition-all hover:-translate-y-1"
              style={{ border: "1px solid var(--color-equator-beige)", boxShadow: "0 12px 28px rgba(24, 38, 30, 0.06)" }}
            >
              <div className="rounded-[1.1rem] overflow-hidden mb-3 bg-[#fbf8f1]" style={{ aspectRatio: "1/1" }}>
                <ProductImage
                  image={similarImages[0]}
                  product={item}
                  className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <p className="text-sm font-medium line-clamp-2" style={{ color: "var(--color-equator-text)", fontFamily: "var(--font-body)" }}>
                {item.name}
              </p>

              <p className="text-sm font-semibold mt-1" style={{ color: "var(--color-equator-green)", fontFamily: "var(--font-body)" }}>
                {formatPrice(item.price, item.currency)}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
