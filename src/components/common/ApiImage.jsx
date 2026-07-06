import { useEffect, useMemo, useRef, useState } from "react";
import { fetchAssetUrl } from "../../api/assetApi";

const FALLBACK =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
      <rect width="100%" height="100%" fill="#f0ebe3"/>
      <text
        x="50%"
        y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
        fill="#8a8178"
        font-family="Arial"
        font-size="22"
      >
        Image indisponible
      </text>
    </svg>
  `);

function isImageUrl(value) {
  if (!value || typeof value !== "string") return false;

  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:") ||
    value.startsWith("/")
  );
}

function normalizeAssetId(value) {
  if (!value) return null;

  if (typeof value === "number") return value;

  if (typeof value === "string") return value.trim() || null;

  if (typeof value === "object") {
    return (
      value.assetId ||
      value.id ||
      value.coverAssetId ||
      value.logoId ||
      value.bannerAssetId ||
      value.imageAssetId ||
      value.mainImageAssetId ||
      value.mainAssetId ||
      null
    );
  }

  return null;
}

function unique(values) {
  return values.filter((value, index, array) => value && array.indexOf(value) === index);
}

function getTypeCandidates(refType, type, typeCandidates = []) {
  const explicitCandidates = Array.isArray(typeCandidates) ? typeCandidates : [];

  // On garde uniquement des valeurs compatibles avec l'enum AssetType du backend.
  if (explicitCandidates.length > 0) {
    return unique([type, ...explicitCandidates]);
  }

  if (refType === "PRODUCT") {
    return unique([type, "PRODUCT_IMAGE", "OTHER"]);
  }

  if (refType === "STORE") {
    return unique([type, "STORE_BANNER_IMAGE", "STORE_LOGO", "OTHER"]);
  }

  if (refType === "CATEGORY") {
    return unique([type, "CATEGORY_IMAGE", "OTHER"]);
  }

  return unique([type, "OTHER"]);
}

function getFileSizeCandidates(fileSizeType, fileSizeTypeCandidates = []) {
  const explicitCandidates = Array.isArray(fileSizeTypeCandidates) ? fileSizeTypeCandidates : [];

  return unique([
    fileSizeType,
    ...explicitCandidates,
    "MEDIUM",
    "DETAIL",
    "LARGE",
    "SMALL",
    "THUMBNAIL",
  ]);
}

export default function ApiImage({
  assetId,
  refType,
  refEntityId,
  refEntityIdCandidates = [],
  type,
  typeCandidates,
  fileSizeType = "MEDIUM",
  fileSizeTypeCandidates,
  fallback = FALLBACK,
  alt = "",
  className = "",
  style,
  lazy = true,
  loading = "lazy",
  decoding = "async",
  rootMargin = "360px",
}) {
  const imageRef = useRef(null);
  const [src, setSrc] = useState(fallback);
  const [shouldLoad, setShouldLoad] = useState(!lazy);

  const safeAssetId = normalizeAssetId(assetId);
  const safeRefEntityId = normalizeAssetId(refEntityId);

  const refEntityIdCandidatesKey = useMemo(() => {
    return JSON.stringify(refEntityIdCandidates || []);
  }, [refEntityIdCandidates]);

  const typeCandidatesKey = useMemo(() => {
    return JSON.stringify(typeCandidates || []);
  }, [typeCandidates]);

  const fileSizeTypeCandidatesKey = useMemo(() => {
    return JSON.stringify(fileSizeTypeCandidates || []);
  }, [fileSizeTypeCandidates]);

  useEffect(() => {
    if (!lazy) {
      setShouldLoad(true);
      return undefined;
    }

    const node = imageRef.current;

    if (!node || typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [lazy, rootMargin]);

  useEffect(() => {
    if (!shouldLoad) return undefined;

    let alive = true;

    async function loadImage() {
      if (isImageUrl(safeAssetId)) {
        if (alive) setSrc(safeAssetId);
        return;
      }

      const parsedRefEntityIdCandidates = JSON.parse(refEntityIdCandidatesKey || "[]");
      const parsedTypeCandidates = JSON.parse(typeCandidatesKey || "[]");
      const parsedFileSizeCandidates = JSON.parse(fileSizeTypeCandidatesKey || "[]");
      const candidates = getTypeCandidates(refType, type, parsedTypeCandidates);
      const sizeCandidates = getFileSizeCandidates(fileSizeType, parsedFileSizeCandidates);
      const refEntityIds = unique([
        safeRefEntityId,
        ...parsedRefEntityIdCandidates.map(normalizeAssetId),
      ]);

      if (!safeAssetId || !refType || refEntityIds.length === 0 || candidates.length === 0) {
        if (alive) setSrc(fallback);
        return;
      }

      for (const currentRefEntityId of refEntityIds) {
        for (const currentType of candidates) {
          for (const currentFileSizeType of sizeCandidates) {
            try {
              const url = await fetchAssetUrl(safeAssetId, {
                refType,
                refEntityId: currentRefEntityId,
                type: currentType,
                fileSizeType: currentFileSizeType,
              });

              if (!alive) return;

              if (url) {
                setSrc(url);
                return;
              }
            } catch (error) {
              if (import.meta.env.DEV && error?.status !== 404 && error?.status !== 400) {
                console.warn("[ApiImage] Échec image :", {
                  assetId: safeAssetId,
                  refType,
                  refEntityId: currentRefEntityId,
                  type: currentType,
                  fileSizeType: currentFileSizeType,
                  status: error?.status,
                  message: error?.message,
                  alt,
                });
              }
            }
          }
        }
      }

      if (alive) setSrc(fallback);
    }

    loadImage();

    return () => {
      alive = false;
    };
  }, [
    shouldLoad,
    safeAssetId,
    safeRefEntityId,
    refEntityIdCandidatesKey,
    refType,
    type,
    typeCandidatesKey,
    fileSizeType,
    fileSizeTypeCandidatesKey,
    fallback,
    alt,
  ]);

  return (
    <img
      ref={imageRef}
      src={src}
      alt={alt}
      loading={loading}
      decoding={decoding}
      className={className}
      style={style}
      onError={(event) => {
        event.currentTarget.src = fallback;
      }}
    />
  );
}
