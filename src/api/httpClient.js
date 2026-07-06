/**
 * httpClient.js
 * Centralized HTTP client for all API calls.
 *
 * In development, BASE_URL is empty so Vite proxy handles /api requests.
 */

const BASE_URL = import.meta.env.DEV
  ? ""
  : import.meta.env.VITE_API_BASE_URL || "https://www.wylov.com:8080";

const API_KEY = (import.meta.env.VITE_API_KEY || "").trim();
const PLATFORM_CONTEXT = (import.meta.env.VITE_PLATFORM_CONTEXT || "WYLOV_CLIENT").trim();

// ─── Token helpers ────────────────────────────────────────────────────────────
const TOKEN_KEY = "equator_token";

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  remove: () => localStorage.removeItem(TOKEN_KEY),
};

// ─── Build common headers ─────────────────────────────────────────────────────
function buildHeaders(extra = {}, options = {}) {
  const headers = {
    Accept: "application/json",
    ...extra,
  };

  if (!headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (API_KEY) {
    headers["x-api-key"] = API_KEY;
  }

  if (PLATFORM_CONTEXT) {
    headers["PlatformContext"] = PLATFORM_CONTEXT;
  }

  const token = tokenStorage.get();

  if (!options.skipAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

// ─── Error class ──────────────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(status, message, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// ─── Response parser ──────────────────────────────────────────────────────────
async function parseResponseBody(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    return await response.text();
  } catch {
    return null;
  }
}

// ─── Response handler ─────────────────────────────────────────────────────────

const isExpectedHandledHttpError = (response, data) => {
  const message = String(
    data?.message ||
      data?.error ||
      data?.title ||
      data?.detail ||
      ""
  ).toLowerCase();

  const httpStatusCode = String(data?.httpStatusCode || "").toUpperCase();
  const url = String(response?.url || "").toLowerCase();

  const isCartRequest = url.includes("/shopping-cart/");

  const isAlreadyInCart =
    response.status === 412 &&
    isCartRequest &&
    (
      httpStatusCode === "PRECONDITION_FAILED" ||
      message.includes("déja présent") ||
      message.includes("déjà présent") ||
      message.includes("deja present") ||
      message.includes("present dans votre panier") ||
      message.includes("already")
    );

  const isNoActiveCart =
    response.status === 404 &&
    isCartRequest &&
    (
      httpStatusCode === "NOT_FOUND" ||
      message.includes("panier actif") ||
      message.includes("point de vente") ||
      message.includes("no active cart")
    );

  return isAlreadyInCart || isNoActiveCart;
};

async function handleResponse(response) {
  const data = await parseResponseBody(response);

  if (!response.ok) {
    const isExpectedHandledError = isExpectedHandledHttpError(response, data);

    if (!isExpectedHandledError) {
      console.error(
        "[HTTP ERROR RESPONSE]",
        JSON.stringify(
          {
            status: response.status,
            url: response.url,
            message: data?.message,
            correlationId: data?.correlationId,
            content: data?.content,
            raw: data,
          },
          null,
          2
        )
      );
    }

    if (typeof window !== "undefined") {
      window.__LAST_API_ERROR__ = data;
    }

    const message =
      typeof data === "string" && data.trim()
        ? data
        : data?.message ||
          data?.error ||
          data?.title ||
          data?.detail ||
          `HTTP ${response.status}`;

    if (response.status === 401) {
      const hasToken = Boolean(tokenStorage.get());

      if (hasToken) {
        tokenStorage.remove();

        throw new ApiError(
          401,
          "Session expirée. Veuillez vous reconnecter.",
          data
        );
      }

      throw new ApiError(
        401,
        "Requête non autorisée. Vérifiez VITE_API_KEY et VITE_PLATFORM_CONTEXT.",
        data
      );
    }

    if (response.status === 403) {
      throw new ApiError(403, "Accès refusé.", data);
    }

    if (response.status === 404) {
      throw new ApiError(404, "Ressource introuvable.", data);
    }

    throw new ApiError(response.status, message, data);
  }

  return data;
}

// ─── Core JSON request function ───────────────────────────────────────────────
function appendQuery(path, query) {
  if (!query || Object.keys(query).length === 0) return path;

  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") {
          searchParams.append(key, String(item));
        }
      });
      return;
    }

    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  if (!queryString) return path;

  return `${path}${path.includes("?") ? "&" : "?"}${queryString}`;
}

async function request(
  method,
  path,
  {
    body,
    headers: extraHeaders,
    signal,
    skipAuth = false,
    query,
  } = {}
) {
  const url = `${BASE_URL}${appendQuery(path, query)}`;

  const options = {
    method,
    headers: buildHeaders(extraHeaders, { skipAuth }),
    signal,
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  try {
    if (import.meta.env.VITE_HTTP_DEBUG === "true") {
      console.log("[HTTP REQUEST DEBUG]", {
        method,
        path,
        hasApiKey: Boolean(options.headers["x-api-key"]),
        apiKeyLength: options.headers["x-api-key"]?.length || 0,
        platformContext: options.headers["PlatformContext"],
        hasAuthorization: Boolean(options.headers.Authorization),
        authorization: options.headers.Authorization ? "PRESENT" : "ABSENT",
      });
    }
    const response = await fetch(url, options);
    return await handleResponse(response);
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }

    if (err.name === "AbortError") {
      throw new ApiError(0, "Requête annulée.", null);
    }

    if (err.name === "TypeError" || err.name === "NetworkError") {
      throw new ApiError(
        0,
        "Impossible de contacter le serveur. Vérifiez votre connexion.",
        null
      );
    }

    console.error("[httpClient] Unexpected error:", err);

    throw new ApiError(0, "Une erreur inattendue est survenue.", null);
  }
}



function isRenderableAssetUrl(value) {
  if (!value || typeof value !== "string") return false;

  const raw = value.trim();

  return (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:") ||
    raw.startsWith("blob:") ||
    raw.startsWith("/")
  );
}

function normalizeReturnedAssetUrl(value) {
  if (!isRenderableAssetUrl(value)) return null;

  const raw = value.trim();

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:") ||
    raw.startsWith("blob:")
  ) {
    return raw;
  }

  return `${BASE_URL}${raw}`;
}

function getBase64Payload(value) {
  if (!value) return null;

  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return value.find(Boolean) || null;
    }

    return (
      value.content ||
      value.data ||
      value.file ||
      value.bytes ||
      value.base64 ||
      value.byteContent ||
      value.payload ||
      value.value ||
      null
    );
  }

  if (typeof value !== "string") return null;

  let raw = value.trim();

  try {
    const parsed = JSON.parse(raw);
    if (parsed !== raw) {
      return getBase64Payload(parsed);
    }
  } catch {
    // La réponse peut déjà être une chaîne base64 brute.
  }

  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    raw = raw.slice(1, -1).trim();
  }

  return raw || null;
}

function getMimeTypeFromBase64(base64, explicitMimeType) {
  if (explicitMimeType) return explicitMimeType;

  if (base64.startsWith("iVBOR")) return "image/png";
  if (base64.startsWith("/9j/")) return "image/jpeg";
  if (base64.startsWith("R0lGOD")) return "image/gif";
  if (base64.startsWith("UklGR")) return "image/webp";
  if (base64.startsWith("PHN2Zy")) return "image/svg+xml";
  if (base64.startsWith("AAABAA")) return "image/x-icon";

  return "image/jpeg";
}

function sniffImageMime(bytes) {
  if (!bytes || bytes.length < 4) return null;

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return "image/gif";
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) return "image/webp";
  if (bytes[0] === 0x3c && bytes[1] === 0x73 && bytes[2] === 0x76 && bytes[3] === 0x67) return "image/svg+xml";

  return null;
}

function createObjectUrlFromBase64(value) {
  const payload = getBase64Payload(value);
  if (!payload || typeof payload !== "string") return null;

  let base64 = payload.trim();
  let mimeType = null;

  const directUrl = normalizeReturnedAssetUrl(base64);
  if (directUrl) return directUrl;

  const dataUrlMatch = base64.match(/^data:([^;]+);base64,(.+)$/i);
  if (dataUrlMatch) {
    mimeType = dataUrlMatch[1];
    base64 = dataUrlMatch[2];
  }

  const base64PrefixMatch = base64.match(/^base64,(.+)$/i);
  if (base64PrefixMatch) {
    base64 = base64PrefixMatch[1];
  }

  base64 = base64
    .replace(/\\n/g, "")
    .replace(/\\r/g, "")
    .replace(/\s/g, "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  while (base64.length % 4 !== 0) {
    base64 += "=";
  }

  if (!base64 || base64.length < 16 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) {
    return null;
  }

  try {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    const sniffedMimeType = sniffImageMime(bytes);

    return URL.createObjectURL(
      new Blob([bytes], { type: sniffedMimeType || getMimeTypeFromBase64(base64, mimeType) })
    );
  } catch {
    return null;
  }
}

async function createImageObjectUrlFromResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const arrayBuffer = await response.arrayBuffer();

  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    throw new ApiError(0, "Image vide ou invalide.", null);
  }

  const bytes = new Uint8Array(arrayBuffer);
  const sniffedMimeType = sniffImageMime(bytes);

  if (contentType.startsWith("image/") || sniffedMimeType) {
    return URL.createObjectURL(
      new Blob([arrayBuffer], { type: sniffedMimeType || contentType || "image/jpeg" })
    );
  }

  const text = new TextDecoder("utf-8").decode(bytes).trim();
  const directUrl = normalizeReturnedAssetUrl(text);
  if (directUrl) return directUrl;

  const base64Url = createObjectUrlFromBase64(text);
  if (base64Url) return base64Url;

  try {
    const parsed = JSON.parse(text);

    if (typeof parsed === "string") {
      const parsedUrl = normalizeReturnedAssetUrl(parsed);
      if (parsedUrl) return parsedUrl;
    }

    const parsedBase64Url = createObjectUrlFromBase64(parsed);
    if (parsedBase64Url) return parsedBase64Url;
  } catch {
    // La réponse n'est pas JSON : on tente le blob brut plus bas.
  }

  return URL.createObjectURL(
    new Blob([arrayBuffer], { type: contentType || "application/octet-stream" })
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────
const http = {
  get: (path, options = {}) => request("GET", path, options),

  post: (path, body, options = {}) =>
    request("POST", path, { ...options, body }),

  put: (path, body, options = {}) =>
    request("PUT", path, { ...options, body }),

  patch: (path, body, options = {}) =>
    request("PATCH", path, { ...options, body }),

  delete: (path, options = {}) => request("DELETE", path, options),

  /**
   * POST qui récupère une réponse binaire.
   * Utilisé pour les images/assets.
   * Retourne une URL blob utilisable dans <img src="..." />.
   */
  blob: async (path, body, options = {}) => {
    const url = `${BASE_URL}${path}`;

    const headers = buildHeaders(
      {
        Accept: "*/*",
        ...(options.headers || {}),
      },
      {
        skipAuth: options.skipAuth || false,
      }
    );

    const requestOptions = {
      method: "POST",
      headers,
      signal: options.signal,
    };

    if (body !== undefined) {
      requestOptions.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        await handleResponse(response);
      }

      return await createImageObjectUrlFromResponse(response);
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }

      throw new ApiError(0, "Impossible de charger l'image.", null);
    }
  },

  /**
   * Multipart form upload.
   */
  upload: async (path, formData, options = {}) => {
    const url = `${BASE_URL}${path}`;

    const headers = buildHeaders(options.headers || {}, {
      skipAuth: options.skipAuth || false,
    });

    delete headers["Content-Type"];

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
        signal: options.signal,
      });

      return await handleResponse(response);
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }

      throw new ApiError(0, "Impossible de contacter le serveur.", null);
    }
  },
};

export default http;

// ─── Pagination helper ────────────────────────────────────────────────────────
export function buildSearchQuery({
  page = 0,
  pageSize = 12,
  searchString = "",
  sortBy,
  sortDirection = "DESC",
  readAll = false,
  fieldFilters = {},
  definedFilters = [],
  relatedPropertyToSortBy,
} = {}) {
  const safePage = Number.isFinite(Number(page)) ? Number(page) : 0;
  const safePageSize = Number.isFinite(Number(pageSize)) ? Number(pageSize) : 12;

  const query = {
    pageIndex: safePage,
    startIndex: safePage * safePageSize,
    numberOfItemsPerPage: safePageSize,
    readAll: Boolean(readAll),
  };

  if (searchString && searchString.trim()) {
    query.searchString = searchString.trim();
  }

  if (sortBy && String(sortBy).trim()) {
    query.sortBy = String(sortBy).trim();
    query.sortDirection = sortDirection || "DESC";
  }

  if (fieldFilters && Object.keys(fieldFilters).length > 0) {
    const normalizedFilters = {};

    Object.entries(fieldFilters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;

      normalizedFilters[key] = Array.isArray(value)
        ? value.map(String)
        : [String(value)];
    });

    if (Object.keys(normalizedFilters).length > 0) {
      query.fieldFilters = normalizedFilters;
    }
  }

  if (Array.isArray(definedFilters) && definedFilters.length > 0) {
    query.definedFilters = definedFilters;
  }

  if (relatedPropertyToSortBy && String(relatedPropertyToSortBy).trim()) {
    query.relatedPropertyToSortBy = String(relatedPropertyToSortBy).trim();
  }

  return query;
}

export function normalizePaginatedResponse(response) {
  if (!response) {
    return {
      items: [],
      totalItems: 0,
      totalPages: 0,
      page: 0,
    };
  }

  return {
    items: response.summaryDtos || [],
    totalItems: response.totalNumberOfItems || 0,
    totalPages: response.numberOfPages || 0,
    page: response.pageIndex || 0,
  };
}