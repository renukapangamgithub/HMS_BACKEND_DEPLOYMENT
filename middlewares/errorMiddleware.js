class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (err, req, res, next) => {
  // Default values for message and statusCode
  err.message = err.message || "Internal Server Error";
  err.statusCode = err.statusCode || 500;

  // Specific error handling
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered.`;
    err = new ErrorHandler(message, 400);
  }

  if (err.name === "JsonWebTokenError") {
    const message = `JSON Web Token is invalid. Please try again.`;
    err = new ErrorHandler(message, 400);

  }

  if (err.name === "TokenExpiredError") {
    message = `JSON Web Token has expired. Please try again.`;
    err = new ErrorHandler(message, 400);

  }

  if (err.name === "CastError") {
    message = `Invalid ${err.path}.`;
    err = new ErrorHandler(message, 400);

  }

  const errorMessage = err.errors 
    ? Object.values(err.errors)
        .map((error) => error.message)
        .join(" ")
    : err.message;

  return res.status(err.statusCode).json({
    success: false,
    message: errorMessage,
  });
};

export default ErrorHandler;
