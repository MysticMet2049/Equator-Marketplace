import { FiArrowLeft, FiCheck, FiShare2 } from "react-icons/fi";
import ApiImage from "../../common/ApiImage";

export default function StoreHero({ store, shared, onBack, onShare }) {
  return (
    <div data-testid="store-hero" className="relative w-full overflow-hidden" style={{ height: "220px" }}>
      {store.imageAssetId || store.logoId ? (
        <ApiImage
          assetId={store.imageAssetId || store.logoId}
          refType={store.imageAssetId ? store.imageRefType : store.logoRefType}
          refEntityId={store.imageAssetId ? store.imageRefEntityId : store.logoRefEntityId}
          type={store.imageAssetId ? store.imageType : store.logoType}
          typeCandidates={["STORE_BANNER_IMAGE", "STORE_LOGO", "ORGANISATION_BANNER_IMAGE", "ORGANISATION_LOGO", "OTHER"]}
          alt={store.name || "Boutique"}
          fileSizeType="MEDIUM"
          fileSizeTypeCandidates={["SMALL", "DETAIL", "LARGE", "THUMBNAIL"]}
          lazy={false}
          loading="eager"
          className="w-full h-full object-cover"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, var(--color-equator-beige), var(--color-equator-cream))" }}
        >
          <span style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>Image indisponible</span>
        </div>
      )}

      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)" }} />

      <button
        data-testid="store-hero-back"
        onClick={onBack}
        className="absolute top-4 left-4 flex items-center gap-1.5 text-sm font-medium text-white px-3 py-1.5 rounded-full transition-all"
        style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.3)" }}
      >
        <FiArrowLeft size={14} /> Retour
      </button>

      <button
        data-testid="store-hero-share"
        onClick={onShare}
        className="absolute top-4 right-4 flex items-center gap-1.5 text-sm font-medium text-white px-3 py-1.5 rounded-full transition-all"
        style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.3)" }}
      >
        {shared ? <FiCheck size={14} /> : <FiShare2 size={14} />}
        {shared ? "Copié !" : "Partager"}
      </button>
    </div>
  );
}
