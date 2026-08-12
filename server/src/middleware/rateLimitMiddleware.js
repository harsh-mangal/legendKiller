import RateLimitBucket from "../models/RateLimitBucket.js";

const memoryBuckets = new Map();

const memoryRateLimit = ({ bucketKey, now, windowMs, max }) => {
  const bucket = memoryBuckets.get(bucketKey);
  if (!bucket || bucket.expiresAt <= now) {
    memoryBuckets.set(bucketKey, { count: 1, expiresAt: now + windowMs });
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs };
  }
  bucket.count += 1;
  return { allowed: bucket.count <= max, remaining: Math.max(0, max - bucket.count), resetAt: bucket.expiresAt };
};

const writeHeaders = (res, { max, count, resetAt }) => {
  res.set("X-RateLimit-Limit", String(max));
  res.set("X-RateLimit-Remaining", String(Math.max(0, max - count)));
  res.set("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));
};

export const rateLimit = ({ windowMs = 60_000, max = 30, key = (req) => req.ip } = {}) => async (req, res, next) => {
  const now = Date.now();
  const identity = String(key(req) || "unknown").slice(0, 300);
  const bucketKey = `${req.baseUrl}${req.path}:${identity}`;
  try {
    const nowDate = new Date(now);
    const nextExpiry = new Date(now + windowMs);
    const bucket = await RateLimitBucket.findOneAndUpdate(
      { key: bucketKey },
      [
        {
          $set: {
            key: bucketKey,
            count: {
              $cond: [
                { $or: [{ $eq: [{ $type: "$expiresAt" }, "missing"] }, { $lte: ["$expiresAt", nowDate] }] },
                1,
                { $add: [{ $ifNull: ["$count", 0] }, 1] },
              ],
            },
            expiresAt: {
              $cond: [
                { $or: [{ $eq: [{ $type: "$expiresAt" }, "missing"] }, { $lte: ["$expiresAt", nowDate] }] },
                nextExpiry,
                "$expiresAt",
              ],
            },
            updatedAt: nowDate,
            createdAt: { $ifNull: ["$createdAt", nowDate] },
          },
        },
      ],
      { upsert: true, new: true }
    );
    const resetAt = bucket.expiresAt.getTime();
    writeHeaders(res, { max, count: bucket.count, resetAt });
    if (bucket.count > max) {
      res.set("Retry-After", String(Math.max(1, Math.ceil((resetAt - now) / 1000))));
      return res.status(429).json({ success: false, message: "Too many requests. Please try again shortly." });
    }
    return next();
  } catch (error) {
    const fallback = memoryRateLimit({ bucketKey, now, windowMs, max });
    writeHeaders(res, { max, count: max - fallback.remaining, resetAt: fallback.resetAt });
    if (!fallback.allowed) {
      res.set("Retry-After", String(Math.max(1, Math.ceil((fallback.resetAt - now) / 1000))));
      return res.status(429).json({ success: false, message: "Too many requests. Please try again shortly." });
    }
    return next();
  }
};
