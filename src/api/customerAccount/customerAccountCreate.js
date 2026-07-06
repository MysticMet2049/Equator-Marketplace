import http from "../httpClient";
import { cleanObject, extractCustomerAccountId } from "./customerAccountUtils";
import {
  getAddressFromCustomer,
  getCustomerPhoneNumber,
  getPersonalInfoFromCustomer,
} from "./customerAccountPayload";

// Route Swagger adaptée au cas marketplace : création minimale d'un compte enseigne.
const CREATE_LIGHT_ACCOUNT_PATH = "/api/customers/account/create-light";

// Routes historiques conservées en fallback selon l'environnement backend.
const CREATE_FULL_ACCOUNT_PATHS = [
  "/api/customers/account/create",
  "/api/customers/account/projected/create",
];

const buildLightCustomerAccountPayload = ({ storeId, customer, phoneNumber } = {}) =>
  cleanObject({
    storeId: Number(storeId),
    customerAccountType: "PERSON",
    phoneNumber: getCustomerPhoneNumber({ ...customer, phoneNumber }),
    personalInfo: getPersonalInfoFromCustomer(customer),
  });

const buildFullCustomerAccountPayload = ({ storeId, customer, phoneNumber } = {}) =>
  cleanObject({
    storeId: Number(storeId),
    customerAccountType: "PERSON",
    phoneNumber: getCustomerPhoneNumber({ ...customer, phoneNumber }),
    personalInfo: getPersonalInfoFromCustomer(customer),
    address: getAddressFromCustomer(customer),
  });

async function createCustomerAccountOnPath(path, payload) {
  console.log(`[CREATE CUSTOMER ACCOUNT PAYLOAD] ${path}`, JSON.stringify(payload, null, 2));

  const response = await http.post(path, payload);

  console.log(`[CREATE CUSTOMER ACCOUNT RESPONSE] ${path}`, JSON.stringify(response, null, 2));

  const customerAccountId = extractCustomerAccountId(response);

  if (!customerAccountId) {
    console.warn(
      `[customerAccountApi] ${path} a répondu sans customerAccountId exploitable.`,
      response
    );
  }

  return customerAccountId;
}

// Crée automatiquement un compte client dans un store avant validation du panier.
export async function createCustomerAccountForStore({ storeId, customer, phoneNumber } = {}) {
  if (!storeId) return null;

  const lightPayload = buildLightCustomerAccountPayload({ storeId, customer, phoneNumber });
  let lastError = null;

  try {
    const customerAccountId = await createCustomerAccountOnPath(
      CREATE_LIGHT_ACCOUNT_PATH,
      lightPayload
    );

    if (customerAccountId) return customerAccountId;
  } catch (err) {
    lastError = err;
    console.warn(`[customerAccountApi] ${CREATE_LIGHT_ACCOUNT_PATH} failed:`, err);
  }

  const fullPayload = buildFullCustomerAccountPayload({ storeId, customer, phoneNumber });

  for (const path of CREATE_FULL_ACCOUNT_PATHS) {
    try {
      const customerAccountId = await createCustomerAccountOnPath(path, fullPayload);
      if (customerAccountId) return customerAccountId;
    } catch (err) {
      lastError = err;
      console.warn(`[customerAccountApi] ${path} failed:`, err);
    }
  }

  throw lastError || new Error("Impossible de créer le compte client dans cette enseigne.");
}
