export const BRAND = {
  name: "Artisan Brew Co.",
  tagline: "Every Cup, A Little Happiness.",
  subtitle:
    "Freshly brewed coffee, handcrafted with love, served with a little bunny magic.",
  email: "hello@artisanbrew.co",
  phone: "+62 812-3456-7890",
  address: "Jl. Kopi Sensor No. 12, Jakarta Selatan",
} as const;

export const MICROCOPY = {
  home: "Welcome to Artisan Brew Co.!",
  menu: "Find Your Happy Cup.",
  cart: "Your Coffee Buddies Are Waiting!",
  checkout: "Almost There, Coffee Lover!",
  paymentSuccess: "Yay! Your Coffee Is Brewing!",
  tracking: "Your Bunny Barista Is On It!",
  emptyCart: "Oops! Your Basket Is Feeling Lonely.",
  loading: "Brewing Something Magical...",
} as const;

export const BANKS = [
  { code: "bca", name: "BCA", color: "#0060AF", vaPrefix: "8808" },
  { code: "bni", name: "BNI", color: "#F26A21", vaPrefix: "8808" },
  { code: "bri", name: "BRI", color: "#00529C", vaPrefix: "8808" },
  { code: "mandiri", name: "Mandiri", color: "#F2A900", vaPrefix: "8808" },
  { code: "permata", name: "Permata", color: "#00A5B5", vaPrefix: "8808" },
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Pending Payment",
  PAID: "Paid",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_STEPS = [
  "PENDING_PAYMENT",
  "PAID",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "COMPLETED",
] as const;

export const TAX_RATE = 0.1;
export const LOYALTY_POINTS_PER_IDR = 1 / 1000;

export function tierForPoints(points: number) {
  if (points >= 2000) return "Brew Master";
  if (points >= 1000) return "Coffee Lover";
  if (points >= 500) return "Regular";
  return "Bean";
}
