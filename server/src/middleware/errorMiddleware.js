import { ApiError } from "../utils/apiError.js";

export const notFound = (req, res, next) => next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Server error";
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((value) => value.message).join(", ");
  }
  if (err.code === 11000) {
    statusCode = 409;
    message = `Duplicate value for ${Object.keys(err.keyPattern || err.keyValue || {}).join(", ") || "unique field"}`;
  }
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }
  console.error(JSON.stringify({ level: "error", requestId: req.id, statusCode, message, stack: process.env.NODE_ENV === "production" ? undefined : err.stack }));
  res.status(statusCode).json({ success: false, message, requestId: req.id, ...(err.details ? { details: err.details } : {}) });
};
