import "./config/env.js";
import mongoose from "mongoose";
import app from "./app.js";
import connectDB from "./config/db.js";
import { env, validateEnvironment } from "./config/env.js";
import { releaseExpiredReservations } from "./controllers/orderController.js";

validateEnvironment();
await connectDB();

const server = app.listen(env.port, () => console.log(`Ameyka Veda API listening on port ${env.port}`));
const reservationTimer = setInterval(() => {
  releaseExpiredReservations().then((count) => {
    if (count) console.log(`Released ${count} expired payment reservation(s)`);
  }).catch((error) => console.error("Reservation cleanup failed:", error.message));
}, Math.max(60_000, Number(process.env.RESERVATION_CLEANUP_INTERVAL_MS || 300_000)));
reservationTimer.unref();

const shutdown = async (signal) => {
  console.log(`${signal} received. Closing server...`);
  clearInterval(reservationTimer);
  server.close(async () => {
    await mongoose.connection.close(false);
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
  shutdown("unhandledRejection");
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  shutdown("uncaughtException");
});
