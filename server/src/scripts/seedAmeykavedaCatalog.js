import "dotenv/config";
import mongoose from "mongoose";
import { seedAmeykavedaCatalog } from "../seeds/ameykavedaCatalogSeed.js";

const mongoUri =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.env.MONGODB_URL;

async function runSeed() {
  if (!mongoUri) {
    throw new Error(
      "MongoDB URI is missing. Add MONGO_URI to your server/.env file."
    );
  }

  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log(`MongoDB connected: ${mongoose.connection.name}`);

    const result = await seedAmeykavedaCatalog();
    console.log("Ameykaveda catalogue seeded successfully:", result);
  } catch (error) {
    console.error("Catalogue seed failed:", error);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("MongoDB disconnected.");
    }
  }
}

await runSeed();
