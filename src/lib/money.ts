export type Currency = "EUR" | "LEK";

export function formatPrice(cents: number, currency: Currency = "EUR"): string {
  if (currency === "LEK") {
    const lek = Math.round(cents / 100);
    return `${lek.toLocaleString("de-DE")} L`;
  }

  const euros = cents / 100;
  const whole = Math.floor(euros);
  const fraction = Math.round((euros - whole) * 100);

  if (fraction === 0) {
    return `€ ${whole}`;
  }

  return `€ ${whole},${fraction.toString().padStart(2, "0")}`;
}
