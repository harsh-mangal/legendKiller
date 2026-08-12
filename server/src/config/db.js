import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.set("strictQuery", true);
  const connection = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 10000),
    maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 20),
    minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE || 1),
  });
  console.log(`MongoDB connected: ${connection.connection.host}`);
  return connection;
};
export default connectDB;
