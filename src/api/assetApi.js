import http from "./httpClient";

// Cache mémoire simple pour éviter de télécharger plusieurs fois la même image.
// Important : les URLs blob restent valables pendant la session du navigateur.
const assetUrlCache = new Map();

function buildAssetCacheKey(assetId, options = {}) {
  return JSON.stringify({
    assetId,
    refType: options.refType,
    refEntityId: options.refEntityId,
    type: options.type,
    fileSizeType: options.fileSizeType || "MEDIUM",
  });
}

export async function fetchAssetUrl(
  assetId,
  {
    refType,
    refEntityId,
    type,
    fileSizeType = "MEDIUM",
  } = {}
) {
  if (!assetId || !refType || !refEntityId || !type) {
    return null;
  }

  const cacheKey = buildAssetCacheKey(assetId, {
    refType,
    refEntityId,
    type,
    fileSizeType,
  });

  const cached = assetUrlCache.get(cacheKey);
  if (cached) return cached;

  const request = http
    .blob(`/api/client/assets/download/${assetId}`, {
      refType,
      type,
      refEntityId,
      assetId,
      fileSizeType,
    })
    .catch((error) => {
      assetUrlCache.delete(cacheKey);
      throw error;
    });

  assetUrlCache.set(cacheKey, request);
  return request;
}

export async function uploadAsset({
  file,
  refType,
  refEntityId,
  type = "GALLERY",
  alt = "",
  title = "",
  coverImage = false,
}) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("refType", refType);
  formData.append("type", type);
  formData.append("refEntityId", refEntityId);
  formData.append("alt", alt);
  formData.append("title", title);
  formData.append("coverImage", String(coverImage));

  return http.upload("/api/client/assets/upload", formData);
}

export async function changeAsset(
  assetId,
  {
    file,
    refType,
    refEntityId,
    type = "GALLERY",
    alt = "",
    title = "",
    coverImage = false,
  }
) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("refType", refType);
  formData.append("type", type);
  formData.append("refEntityId", refEntityId);
  formData.append("alt", alt);
  formData.append("title", title);
  formData.append("coverImage", String(coverImage));

  return http.upload(`/api/client/assets/change-asset/${assetId}`, formData);
}

export async function setCoverImage({
  refType,
  refEntityId,
  assetId,
  type = "GALLERY",
  fileSizeType = "MEDIUM",
}) {
  return http.put("/api/client/assets/set-cover-image", {
    refType,
    type,
    refEntityId,
    assetId,
    fileSizeType,
  });
}

export async function deleteAsset({
  refType,
  refEntityId,
  assetId,
  type = "GALLERY",
}) {
  return http.post("/api/client/assets/delete", {
    refType,
    type,
    refEntityId,
    assetId,
  });
}

export async function deleteMultipleAssets(assets) {
  return http.post("/api/client/assets/multiple-delete", assets);
}

const assetApi = {
  fetchAssetUrl,
  uploadAsset,
  changeAsset,
  setCoverImage,
  deleteAsset,
  deleteMultipleAssets,
};

export default assetApi;
