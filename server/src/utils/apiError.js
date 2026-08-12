export class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const assert = (condition, statusCode, message, details) => {
  if (!condition) throw new ApiError(statusCode, message, details);
};
