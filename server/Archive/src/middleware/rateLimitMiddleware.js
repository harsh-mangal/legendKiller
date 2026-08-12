const windows = new Map();

export const rateLimit = ({ windowMs = 60_000, max = 30, key = (req) => req.ip } = {}) => (req, res, next) => {
  const now = Date.now();
  const bucketKey = `${req.path}:${key(req) || "unknown"}`;
  const bucket = windows.get(bucketKey);

  if (!bucket || bucket.resetAt <= now) {
    windows.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return next();
  }

  bucket.count += 1;
  if (bucket.count > max) {
    res.set("Retry-After", String(Math.ceil((bucket.resetAt - now) / 1000)));
    return res.status(429).json({ success: false, message: "Too many requests. Please try again shortly." });
  }
  next();
};
