export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export function isStrongEnoughPassword(password, minLength = 8) {
  return String(password || "").length >= minLength;
}

export function isCameroonPhoneNumber(value) {
  const phone = String(value || "").replace(/\s+/g, "");
  return /^(\+237)?6\d{8}$/.test(phone);
}
