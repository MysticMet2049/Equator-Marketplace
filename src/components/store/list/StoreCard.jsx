import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { PiStorefront } from "react-icons/pi";
import ApiImage from "../../common/ApiImage";
import StarRating from "../../common/StarRating";
import { getStoreAssetId, getStoreId, getStoreImage } from "./storeListUtils";

// Carte compacte d'une boutique dans la page Stores.
export default function StoreCard({ store }) {
  const fallbackImage = getStoreImage(store);
  const imageAssetId = getStoreAssetId(store);
  const storeId = getStoreId(store);
  const rating = Number(store.computedRating || 0);
  const reviewCount = Number(store.computedReviewCount || 0);
  const productCount = store.computedProductCount;
  const productCountLoading = Boolean(store.productCountLoading);

  return (
    <article
      data-testid="store-card"
      data-store-id={storeId || "unknown"}
      className="bg-white rounded-2xl overflow-hidden flex flex-col"
      style={{ border: "1px solid var(--color-equator-beige)" }}
    >
      <StoreCardImage
        store={store}
        storeId={storeId}
        imageAssetId={imageAssetId}
        fallbackImage={fallbackImage}
      />

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="min-h-[86px]">
          <h2
            className="text-lg font-medium leading-tight line-clamp-1"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-equator-text)",
            }}
          >
            {store.name || "Boutique"}
          </h2>

          <p
            className="text-sm leading-relaxed mt-2 line-clamp-2"
            style={{
              color: "var(--color-equator-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            {store.description || "Boutique partenaire sur Equator Marketplace."}
          </p>
        </div>

        <StoreRating rating={rating} reviewCount={reviewCount} />

        <div className="flex items-center justify-between gap-3 mt-auto">
          <span
            data-testid="store-card-product-count"
            className="text-xs"
            style={{
              color: "var(--color-equator-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            {productCountLoading
              ? "Produits..."
              : productCount === null || productCount === undefined
                ? "Produits"
                : `${Number(productCount)} produit${Number(productCount) > 1 ? "s" : ""}`}
          </span>

          <Link
            data-testid="store-card-visit-link"
            to={`/stores/${storeId}`}
            state={{ store }}
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
            style={{
              background: "var(--color-equator-green)",
              fontFamily: "var(--font-body)",
            }}
          >
            Visiter <FiArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function StoreCardImage({ store, storeId, imageAssetId, fallbackImage }) {
  return (
    <div
      data-testid="store-card-image"
      className="relative overflow-hidden h-40"
      style={{ background: "var(--color-equator-beige)" }}
    >
      {imageAssetId && storeId ? (
        <ApiImage
          assetId={imageAssetId}
          refType="STORE"
          refEntityId={storeId}
          type="STORE_BANNER_IMAGE"
          typeCandidates={["STORE_BANNER_IMAGE", "STORE_LOGO", "OTHER"]}
          alt={store.name || "Boutique"}
          fileSizeType="MEDIUM"
          fileSizeTypeCandidates={["SMALL", "DETAIL", "THUMBNAIL"]}
          lazy
          loading="lazy"
          className="w-full h-full object-cover"
        />
      ) : fallbackImage ? (
        <img
          src={fallbackImage}
          alt={store.name || "Boutique"}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <PiStorefront size={38} style={{ color: "var(--color-equator-green)" }} />
        </div>
      )}
    </div>
  );
}

function StoreRating({ rating, reviewCount }) {
  return (
    <div className="flex items-center gap-1.5">
      <StarRating rating={rating} size={13} />
      <span
        className="text-sm font-medium"
        style={{
          color: "var(--color-equator-text)",
          fontFamily: "var(--font-body)",
        }}
      >
        {rating.toFixed(1).replace(".0", "")}
      </span>
      <span
        className="text-xs"
        style={{
          color: "var(--color-equator-muted)",
          fontFamily: "var(--font-body)",
        }}
      >
        ({reviewCount} avis)
      </span>
    </div>
  );
}
