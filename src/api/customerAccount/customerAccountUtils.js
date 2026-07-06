// Utilitaires de normalisation pour les comptes client.
export const unwrapResponse = (response) => {
  if (response?.data !== undefined) return response.data;
  if (response?.body !== undefined) return response.body;
  return response;
};

const isAccountLike = (value) =>
  Boolean(
    value &&
      typeof value === "object" &&
      (value.id ||
        value.customerAccountId ||
        value.accountId ||
        value.card?.customerAccountId)
  );

// Convertit tous les formats de réponse possibles en tableau de comptes.
export const normalizeAccountList = (response) => {
  const data = unwrapResponse(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.summaryDtos)) return data.summaryDtos;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.content?.items)) return data.content.items;
  if (Array.isArray(data?.content?.summaryDtos)) return data.content.summaryDtos;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.data?.summaryDtos)) return data.data.summaryDtos;
  if (isAccountLike(data)) return [data];
  if (isAccountLike(data?.content)) return [data.content];
  if (isAccountLike(data?.data)) return [data.data];

  return [];
};

const getAccountStoreId = (account) =>
  account?.storeId ??
  account?.store?.id ??
  account?.organisationId ??
  account?.organizationId ??
  account?.organisation?.id ??
  account?.organization?.id ??
  account?.card?.storeId ??
  account?.card?.organisationId ??
  account?.card?.organizationId;

// Garde uniquement les comptes du store demandé quand l'information est disponible.
export const filterAccountsByStore = (accounts, storeId) => {
  if (!Array.isArray(accounts) || accounts.length === 0) return [];
  if (!storeId) return accounts;

  const filtered = accounts.filter(
    (account) => String(getAccountStoreId(account) ?? "") === String(storeId)
  );

  return filtered.length ? filtered : accounts;
};

export const cleanObject = (value) => {
  if (!value || typeof value !== "object") return value;

  return Object.entries(value).reduce((acc, [key, item]) => {
    if (item === undefined || item === null || item === "") return acc;
    acc[key] = item;
    return acc;
  }, {});
};

export const toNumberOrUndefined = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
};

// Normalise les numéros camerounais et internationaux au format +XXX.
export const normalizeMobileNumber = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  if (raw.startsWith("+")) {
    return "+" + raw.slice(1).replace(/\D/g, "");
  }

  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (digits.startsWith("237")) return `+${digits}`;
  if (digits.length === 9 && digits.startsWith("6")) return `+237${digits}`;

  return `+${digits}`;
};

export const normalizeBirthDate = (value) => {
  if (!value) return undefined;
  const raw = String(value).trim();
  if (!raw) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return `${raw}T00:00:00.000Z`;
  return raw;
};

export const extractCustomerAccountId = (response) => {
  const data = unwrapResponse(response);

  return toNumberOrUndefined(
    data?.id ??
      data?.customerAccountId ??
      data?.accountId ??
      data?.content?.id ??
      data?.content?.customerAccountId ??
      data?.data?.id ??
      data?.data?.customerAccountId
  );
};
