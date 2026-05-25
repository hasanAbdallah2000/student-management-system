import ApiError from "../util/ApiError.js";

export default function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`, "ROUTE_NOT_FOUND"));
}