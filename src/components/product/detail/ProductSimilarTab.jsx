import { Link } from "react-router-dom";
import ProductImage from "./ProductImage";
import { formatPrice, getProductId, getProductImages } from "./productDetailUtils";

function getSimilarKey(item, index) {
  const similarId = getProductId(item);

  return (
    similarId ||
    item?.productId ||
    item?.promoId ||
    item?.summaryId ||
    item?._raw?.id ||
    item?._raw?.productPromoSummaryDto?.id ||
    item?.name ||
    `similar-${index}`
  );
}

/** Displays similar products inside the product tabs area. */
export default function ProductSimilarTab({ products = [] }) {
  if (!products.length) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((item, index) => {
        const similarId = getProductId(item);
        const similarImages = getProductImages(item);

        return (
          <Link
            key={getSimilarKey(item, index)}
            to={`/product/${similarId}`}
            state={{ product: { ...item, id: similarId, productId: similarId } }}
            className="group block"
          >
            <div
              className="rounded-xl overflow-hidden mb-3 bg-white"
              style={{ aspectRatio: "1/1", border: "1px solid var(--color-equator-beige)" }}
            >
              <ProductImage
                image={similarImages[0]}
                product={item}
                className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <p
              className="text-sm font-medium line-clamp-2"
              style={{ color: "var(--color-equator-text)", fontFamily: "var(--font-body)" }}
            >
              {item.name}
            </p>

            <p
              className="text-sm font-semibold mt-1"
              style={{ color: "var(--color-equator-green)", fontFamily: "var(--font-body)" }}
            >
              {formatPrice(item.price, item.currency)}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
