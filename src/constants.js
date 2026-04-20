export const CATEGORIES = [
  "Food",
  "Transport",
  "Rent",
  "Entertainment",
  "Health",
  "Shopping",
  "Other",
];

export const TYPES = ["income", "expense"];

export function currentMonthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMoney(n) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n || 0);
}
