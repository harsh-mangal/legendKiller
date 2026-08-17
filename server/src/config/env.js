import "dotenv/config";

const required = ["MONGO_URI", "JWT_SECRET"];

export const validateEnvironment = () => {
  const missing = required.filter((key) => !String(process.env[key] || "").trim());
  if (process.env.NODE_ENV === "production" && String(process.env.ONLINE_PAYMENTS_ENABLED || "true") === "true") {
    for (const key of ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET"]) {
      if (!String(process.env[key] || "").trim()) missing.push(key);
    }
  }
  if (missing.length) throw new Error(`Missing required environment variables: ${[...new Set(missing)].join(", ")}`);
  if ((process.env.JWT_SECRET || "").length < 32) throw new Error("JWT_SECRET must be at least 32 characters long");
};

export const env = {
  port: Number(process.env.PORT || 5010),
  frontendUrl: (process.env.FRONTEND_URL || "https://legendbornnutrition.com").replace(/\/$/, ""),
  reservationMinutes: Math.max(10, Number(process.env.PAYMENT_RESERVATION_MINUTES || 30)),
  returnWindowDays: Math.max(0, Number(process.env.RETURN_WINDOW_DAYS || 7)),
};
