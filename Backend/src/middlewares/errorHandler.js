import ApiError from "../util/ApiError.js";

export default function errorHandler(err, req, res, next) {

  console.error("ERROR:", err);

  // 🔹 Custom ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
      details: err.details || null,
    });
  }

  // 🔹 MySQL Foreign Key constraint (course has enrollments)
  if (err.code === "ER_ROW_IS_REFERENCED_2") {
    return res.status(409).json({
      success: false,
      message: "Cannot delete this course because it has enrollments.",
      errorCode: "COURSE_HAS_ENROLLMENTS",
      details: null,
    });
  }

  // 🔹 Default fallback
  return res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again.",
    errorCode: "INTERNAL_SERVER_ERROR",
    details: null,
  });
}