import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import ApiImage from "../../common/ApiImage";
import {
  getStoreAssetId,
  getStoreDescription,
  getStoreFallbackImage,
  getStoreId,
} from "../homePageUtils";

// Carte visuelle d'un store partenaire sur la page d'accueil.
export default function PartnerStoreCard({ store }) {
  const storeId = getStoreId(store);
  const storeAssetId = getStoreAssetId(store);
  const fallbackImage = getStoreFallbackImage(store);
  const navigationStore = { ...store, id: storeId };

  return (
    <div
      data-testid="partner-store-card"
      data-store-id={storeId || "unknown"}
      className="store-card relative overflow-hidden rounded-xl"
      style={{ height: "260px", background: "var(--color-equator-beige)" }}
    >
      {storeAssetId && storeId ? (
        <ApiImage
          assetId={storeAssetId}
          refType="STORE"
          refEntityId={storeId}
          type="STORE_BANNER_IMAGE"
          typeCandidates={["STORE_BANNER_IMAGE", "STORE_LOGO", "OTHER"]}
          alt={store.name || "Store partenaire"}
          fileSizeType="MEDIUM"
          fileSizeTypeCandidates={["SMALL", "DETAIL", "THUMBNAIL"]}
          lazy
          loading="lazy"
          className="w-full h-full object-cover"
        />
      ) : fallbackImage ? (
        <img
          src={fallbackImage}
          alt={store.name || "Store partenaire"}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-sm" style={{ color: "var(--color-equator-muted)" }}>
            Image indisponible
          </span>
        </div>
      )}

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.12) 60%, transparent 100%)",
        }}
      />

      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="text-lg font-light mb-1.5" style={{ fontFamily: "var(--font-display)" }}>
          {store.name || "Store partenaire"}
        </h3>
        <p
          className="text-xs leading-relaxed mb-4 max-w-xs"
          style={{
            color: "rgba(255,255,255,0.82)",
            fontFamily: "var(--font-body)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {getStoreDescription(store)}
        </p>
        <StoreCardLink storeId={storeId} navigationStore={navigationStore} />
      </div>
    </div>
  );
}

function StoreCardLink({ storeId, navigationStore }) {
  if (!storeId) {
    return (
      <Link data-testid="partner-store-card-link" to="/stores" className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full transition-all hover:bg-white/20" style={linkStyle}>
        Voir les stores <FiArrowRight size={12} />
      </Link>
    );
  }

  return (
    <Link
      data-testid="partner-store-card-link"
      to={`/stores/${storeId}`}
      state={{ store: navigationStore }}
      className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full transition-all hover:bg-white/20"
      style={linkStyle}
    >
      Visiter le store <FiArrowRight size={12} />
    </Link>
  );
}

const linkStyle = {
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.35)",
  color: "white",
  fontFamily: "var(--font-body)",
};
