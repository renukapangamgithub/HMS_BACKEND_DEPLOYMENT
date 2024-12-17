export const generateToken = (user, message, statuscode, res) => {
    const token = user.generateJsonWebToken();
  
    // Determine the appropriate cookie name based on the user's role
    let cookieName;
    if (user.role === "Admin") {
      cookieName = "adminToken";
    } else if (user.role === "Doctor") {
      cookieName = "doctorToken"; // Add doctorToken for doctors
    } else {
      cookieName = "patientToken";
    }
  
    // Set the token in a cookie
    res
      .status(statuscode)
      .cookie(cookieName, token, {
        expires: new Date(
          Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000 // Cookie expiration based on environment variable
        ),
        httpOnly: true, // Make it accessible only to the server
        secure: true,
        sameSite: "None"
      })
      .json({
        success: true,
        message,
        user,
        token,
      });
  };
  