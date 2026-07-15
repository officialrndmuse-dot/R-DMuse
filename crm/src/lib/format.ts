// Format a number as Indian Rupees, e.g. 1299 -> "₹1,299"
export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
