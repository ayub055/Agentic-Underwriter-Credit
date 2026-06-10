const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrExact = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const emDash = "—";

export function formatINR(value) {
  if (value === null || value === undefined) return emDash;
  return inr.format(value);
}

export function formatEMI(value) {
  if (value === null || value === undefined) return emDash;
  return `${inrExact.format(Math.round(value))}/mo`;
}

export function formatPct(value) {
  if (value === null || value === undefined) return emDash;
  return `${value.toFixed(2)}%`;
}

export function formatTenure(months) {
  if (months === null || months === undefined) return emDash;
  return `${months} mo`;
}
