export function formatDate(value, locale = "fr-FR", options = {}) {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...options,
  }).format(date);
}

export default formatDate;
