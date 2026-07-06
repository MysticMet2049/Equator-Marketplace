import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ProductImage from "./ProductImage";

export default function ProductGallery({ product, images = [], activeImg, setActiveImg }) {
  const activeImage = images[Math.min(activeImg, images.length - 1)] || images[0];

  return (
    <div data-testid="product-gallery" className="w-full min-w-0">
      <div className="flex flex-col-reverse md:flex-row gap-3">
        {images.length > 1 && (
          <div className="flex md:flex-col gap-2 md:w-14 overflow-x-auto md:overflow-visible pb-1 md:pb-0 shrink-0">
            {images.map((image, index) => (
              <button
                key={`${image.kind}-${image.assetId || image.src || index}`}
                data-testid="product-gallery-thumbnail"
                data-thumbnail-index={index}
                type="button"
                onClick={() => setActiveImg(index)}
                className="w-14 shrink-0 rounded-xl overflow-hidden transition-all bg-white"
                style={{
                  aspectRatio: "1/1",
                  border: `2px solid ${
                    index === activeImg
                      ? "var(--color-equator-green)"
                      : "var(--color-equator-beige)"
                  }`,
                  boxShadow:
                    index === activeImg
                      ? "0 8px 18px rgba(32, 112, 74, 0.14)"
                      : "0 4px 12px rgba(24, 38, 30, 0.04)",
                }}
              >
                <ProductImage
                  image={image}
                  product={product}
                  className="w-full h-full object-contain p-1"
                />
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 relative min-w-0">
          <div
            data-testid="product-gallery-main-image"
            className="rounded-[1.5rem] overflow-hidden relative bg-white h-[300px] sm:h-[360px] md:h-[410px] lg:h-[450px] xl:h-[470px]"
            style={{
              border: "1px solid var(--color-equator-beige)",
              boxShadow: "0 14px 34px rgba(24, 38, 30, 0.07)",
            }}
          >
            <ProductImage
              image={activeImage}
              product={product}
              className="w-full h-full object-contain p-3 sm:p-4 lg:p-5"
            />

            {images.length > 1 && (
              <>
                <button
                  data-testid="product-gallery-prev"
                  type="button"
                  onClick={() => setActiveImg((index) => (index - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white flex items-center justify-center transition-all hover:scale-105"
                  style={{
                    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                    border: "1px solid var(--color-equator-beige)",
                  }}
                  aria-label="Image précédente"
                >
                  <FiChevronLeft size={16} />
                </button>

                <button
                  data-testid="product-gallery-next"
                  type="button"
                  onClick={() => setActiveImg((index) => (index + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white flex items-center justify-center transition-all hover:scale-105"
                  style={{
                    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                    border: "1px solid var(--color-equator-beige)",
                  }}
                  aria-label="Image suivante"
                >
                  <FiChevronRight size={16} />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-3">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveImg(index)}
                  className="rounded-full transition-all"
                  style={{
                    width: index === activeImg ? "22px" : "7px",
                    height: "7px",
                    background:
                      index === activeImg
                        ? "var(--color-equator-green)"
                        : "rgba(92, 87, 78, 0.25)",
                  }}
                  aria-label={`Afficher l'image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
