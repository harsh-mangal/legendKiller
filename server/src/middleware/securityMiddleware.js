import crypto from "crypto";

export const requestContext = (req, res, next) => {
  const suppliedId = String(req.headers["x-request-id"] || "").trim();
  req.id = /^[A-Za-z0-9._:-]{1,100}$/.test(suppliedId) ? suppliedId : crypto.randomUUID();
  res.setHeader("X-Request-ID", req.id);
  const startedAt = Date.now();
  res.on("finish", () => {
    if (process.env.NODE_ENV !== "test") {
      console.log(JSON.stringify({ level: "info", requestId: req.id, method: req.method, path: req.originalUrl, status: res.statusCode, durationMs: Date.now() - startedAt }));
    }
  });
  next();
};

export const securityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  if (process.env.NODE_ENV === "production") res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
};
