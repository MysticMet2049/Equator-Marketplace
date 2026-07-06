function normalizeId(value) {
  return value === undefined || value === null || value === "" ? null : value;
}

function normalizePhoneNumber(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  if (raw.startsWith("+")) {
    const digits = raw.slice(1).replace(/\D/g, "");
    return digits ? `+${digits}` : null;
  }

  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (digits.startsWith("237")) return `+${digits}`;
  if (digits.length === 9 && digits.startsWith("6")) return `+237${digits}`;

  return `+${digits}`;
}

function getPrincipalPhone(address) {
  const phone = address?.principalPhoneNumber || {};

  return normalizePhoneNumber(
    phone.phoneNumber ||
      phone.number ||
      phone.fullNumber ||
      phone.value ||
      phone.msisdn
  );
}

function extractContact(apiStore, header = {}) {
  const address = header.address || apiStore.address || {};
  const phone = normalizePhoneNumber(
    header.phone ||
      header.phoneNumber ||
      header.mobileNumber ||
      apiStore.phone ||
      apiStore.phoneNumber ||
      apiStore.mobileNumber ||
      apiStore.contactPhone ||
      apiStore.contact?.phone ||
      apiStore.contact?.phoneNumber ||
      getPrincipalPhone(address)
  );

  const whatsapp = normalizePhoneNumber(
    header.whatsapp ||
      header.whatsApp ||
      header.whatsappNumber ||
      apiStore.whatsapp ||
      apiStore.whatsApp ||
      apiStore.whatsappNumber ||
      apiStore.contact?.whatsapp ||
      apiStore.contact?.whatsApp ||
      apiStore.contact?.whatsappNumber ||
      phone
  );

  return {
    email: header.email || apiStore.email || apiStore.contact?.email || null,
    phone,
    whatsapp,
  };
}

function formatAddress(address) {
  if (!address) return null;

  if (typeof address === "string") return address;

  if (typeof address === "object") {
    const quarterName =
      address.quarter?.name ||
      address.quarter?.label ||
      null;

    const parts = [
      address.title,
      address.street,
      address.additionalAddressLine,
      address.name,
      quarterName,
      address.city?.name || address.cityName || address.city,
      address.countryName,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : null;
  }

  return null;
}

export function mapStoreFromApi(apiStore) {
  if (!apiStore) return null;

  const header =
    apiStore.storeHeaderInfoSummaryDto ||
    apiStore.storeHeaderInfo ||
    apiStore.store ||
    apiStore;

  const ratingInfo = apiStore.ratingInfo || {};

  const storeId = normalizeId(header.id || apiStore.storeId || apiStore.id);
  const name = header.name || apiStore.name || apiStore.storeName || "Boutique";
  const assetId = normalizeId(header.assetId || apiStore.assetId);
  const logoId = normalizeId(header.logoId || apiStore.logoId);

  const rating = Number(
    ratingInfo.averageRating ??
      apiStore.averageRating ??
      apiStore.rating ??
      0
  );

  const reviewCount = Number(
    ratingInfo.ratingCount ??
      apiStore.ratingCount ??
      apiStore.reviewCount ??
      0
  );

  const rawProductCount = Number(
    header.productCount ??
      header.productsCount ??
      header.totalProducts ??
      header.totalProduct ??
      header.numberOfProducts ??
      header.catalogProductCount ??
      header.productPromoCount ??
      apiStore.productCount ??
      apiStore.productsCount ??
      apiStore.totalProducts ??
      apiStore.totalProduct ??
      apiStore.numberOfProducts ??
      apiStore.catalogProductCount ??
      apiStore.productPromoCount ??
      0
  );
  const productCount = Number.isFinite(rawProductCount) && rawProductCount > 0 ? rawProductCount : null;

  const address = header.address || apiStore.address || null;
  const contact = extractContact(apiStore, header);

  return {
    ...apiStore,

    id: storeId,
    storeId,

    name,
    storeName: name,

    description:
      apiStore.description ||
      header.description ||
      "Boutique partenaire sur Equator Marketplace.",

    tagline:
      apiStore.tagline ||
      apiStore.description ||
      header.description ||
      "Boutique partenaire sur Equator Marketplace.",

    email: contact.email,
    phone: contact.phone,
    whatsapp: contact.whatsapp,
    contact,

    location:
      formatAddress(address) ||
      apiStore.location ||
      "Localisation non renseignée",

    address,

    rating,
    averageRating: rating,
    reviewCount,
    ratingCount: reviewCount,
    productCount,
    totalProduct: productCount,
    totalProducts: productCount,

    isTopStore: Boolean(header.topStore || apiStore.isTopStore),
    isHeadStore: Boolean(header.headStore || apiStore.isHeadStore),

    visibleCatalog: Boolean(header.visibleCatalog),
    enablePriceDisplayOnMarketPlace: Boolean(
      header.enablePriceDisplayOnMarketPlace
    ),

    assetId,
    imageAssetId: assetId,

    coverAssetId: assetId,
    bannerAssetId: assetId,

    logoId,
    logoAssetId: logoId,

    imageRefType: "STORE",
    imageRefEntityId: storeId,
    imageType: "STORE_BANNER_IMAGE",

    logoRefType: "STORE",
    logoRefEntityId: storeId,
    logoType: "STORE_LOGO",

    userPreferenceSummaryDto: apiStore.userPreferenceSummaryDto || null,

    image: null,
    logo: null,
    cover: null,
    coverImage: null,
    banner: null,

    _raw: apiStore,
  };
}

export default mapStoreFromApi;
