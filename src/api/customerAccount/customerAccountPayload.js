import { cleanObject, normalizeBirthDate, normalizeMobileNumber, toNumberOrUndefined } from "./customerAccountUtils";

// Extrait les informations personnelles du client connecté.
export const getPersonalInfoFromCustomer = (customer) => {
  const personalInfo =
    customer?.personalInfo ||
    customer?.user?.personalInfo ||
    customer?.user?.person?.personalInfo ||
    null;

  if (!personalInfo) return null;

  return cleanObject({
    ...personalInfo,
    birthDate: normalizeBirthDate(personalInfo.birthDate),
  });
};

export const getCustomerPhoneNumber = (customer) =>
  normalizeMobileNumber(
    customer?.user?.mobileNumber ||
      customer?.mobileNumber ||
      customer?.phoneNumber ||
      customer?.address?.principalPhoneNumber?.phoneNumber ||
      customer?.user?.address?.principalPhoneNumber?.phoneNumber ||
      ""
  );

const getCityInfoFromAddress = (address = {}) => {
  const city = address?.city || address?.quarter?.city || address?.district?.city || null;
  const cityId = toNumberOrUndefined(
    address?.cityId || city?.id || address?.quarter?.cityId || address?.quarter?.city?.id
  );

  if (!cityId) return null;

  return cleanObject({
    id: cityId,
    name: city?.name || address?.cityName || address?.quarter?.cityName || "Douala",
    provinceName: city?.provinceName || address?.provinceName || address?.quarter?.provinceName || "Littoral",
  });
};

// Reconstruit une adresse compatible avec le DTO backend de création.
export const getAddressFromCustomer = (customer) => {
  const existingAddress = customer?.address || customer?.user?.address || {};
  const phoneNumber = getCustomerPhoneNumber(customer);
  const city = getCityInfoFromAddress(existingAddress);

  const quarter = existingAddress?.quarter
    ? cleanObject({
        id: existingAddress.quarter.id,
        name: existingAddress.quarter.name,
        cityId: city?.id || existingAddress.quarter.cityId,
        cityName: city?.name || existingAddress.quarter.cityName,
        provinceName: city?.provinceName || existingAddress.quarter.provinceName,
        countryName: existingAddress.quarter.countryName || existingAddress.countryName || "Cameroun",
        countryId: existingAddress.quarter.countryId || existingAddress.countryId || 72,
        defaultCountryId: existingAddress.quarter.defaultCountryId || existingAddress.countryId || 72,
        phoneCode: existingAddress.quarter.phoneCode || existingAddress.phoneCode || "+237",
      })
    : undefined;

  return cleanObject({
    street: existingAddress.street || existingAddress.additionalAddressLine || "Douala",
    phoneCode: existingAddress.phoneCode || "+237",
    countryShortName: existingAddress.countryShortName || "CM",
    countryId: existingAddress.countryId || 72,
    countryName: existingAddress.countryName || "Cameroun",
    preferred: true,
    ...(city ? { cityId: city.id, city } : {}),
    ...(quarter ? { quarter } : {}),
    additionalAddressLine: existingAddress.additionalAddressLine || existingAddress.street || "Douala",
    principalPhoneNumber: cleanObject({
      phoneNumber,
      refType: "CUSTOMER",
      isPreferred: true,
    }),
  });
};
