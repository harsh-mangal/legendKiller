import mongoose from "mongoose";

const isTransactionUnsupported = (error) =>
  error?.code === 20 || /Transaction numbers are only allowed|replica set|mongos/i.test(String(error?.message || ""));

export const withTransaction = async (work) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    }, {
      readConcern: { level: "snapshot" },
      writeConcern: { w: "majority" },
    });
    return result;
  } catch (error) {
    const allowFallback = process.env.NODE_ENV !== "production" && process.env.ALLOW_NON_TRANSACTIONAL_DB === "true";
    if (allowFallback && isTransactionUnsupported(error)) return work(null);
    throw error;
  } finally {
    await session.endSession();
  }
};

export const useSession = (query, session) => (session ? query.session(session) : query);
export const saveWithSession = (document, session) => document.save(session ? { session } : undefined);
