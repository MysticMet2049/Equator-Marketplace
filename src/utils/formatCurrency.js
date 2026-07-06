export function formatCurrency(value, currency = "FCFA", locale = "fr-FR") {
  const amount = Number(value || 0);

  if (currency === "FCFA" || currency === "XAF") {
    return `${new Intl.NumberFormat(locale).format(amount)} FCFA`;
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default formatCurrency;
