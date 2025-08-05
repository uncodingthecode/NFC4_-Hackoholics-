export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Handle multer errors
  if (err instanceof Error) {
    if (err.message === "Only image files are allowed!") {
      return res.status(400).json({ 
        success: false,
        error: "Only image files are allowed!" 
      });
    }
    if (err.message === "File too large") {
      return res.status(400).json({ 
        success: false,
        error: "File too large! Maximum size is 5MB" 
      });
    }
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
};
