import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";
import bcrypt from "bcrypt";
import multer from "multer";

// Route to register a new patient
export const patientRegister = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    dob,
    nic,
    role,
  } = req.body;

  // Validate inputs
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !gender ||
    !dob ||
    !nic ||
    !role
  ) {
    return next(new ErrorHandler("Please fill the full form!", 400));
  }

  // Check if user already exists
  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("User already registered!", 400));
  }

  // Create new user
  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    dob,
    nic,
    role,
  });
  res.status(200).json({
    success: true,
    message: "User Registered",
  });
});

// Route for login
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, confirmpassword, role } = req.body;

  // Validate inputs
  if (!email || !password || !confirmpassword || !role) {
    return next(new ErrorHandler("Please provide all details!", 400));
  }

  if (password !== confirmpassword) {
    return next(
      new ErrorHandler("Password and Confirm Password do not match!", 400)
    );
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password!", 400));
  }

  // Validate password
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password!", 400));
  }

  if (role.toLowerCase() !== user.role.toLowerCase()) {
    return next(new ErrorHandler("User with this role not found!", 400));
  }

  generateToken(user, "User login successful!", 200, res);
});

// Route to add a new admin
export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, gender, dob, nic } =
    req.body;

  // Validate inputs
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !gender ||
    !dob ||
    !nic
  ) {
    return next(new ErrorHandler("Please fill the full form!", 400));
  }

  // Check if the email is already registered
  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(
      new ErrorHandler(
        `${isRegistered.role} with this email already exists!`,
        400
      )
    );
  }

  // Create new admin
  const admin = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    dob,
    nic,
    role: "Admin",
  });

  // Generate and set token
  generateToken(admin, "New Admin registered!", 200, res);
});

// Route to get all doctors
export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
  const doctors = await User.find({ role: "Doctor" });
  res.status(200).json({
    success: true,
    doctors,
  });
});

// Route to get user details
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

// Logout route (handles both admin and patient logout)
export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("adminToken", " ", {
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: true,
      sameSite: "None"
    })
    .json({
      success: true,
      message: " Admin Logged out successfully!",
    });
});
export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("patientToken", " ", {
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: true,
      sameSite: "None"
    })
    .json({
      success: true,
      message: " Patient Logged out successfully!",
      
    });
});
export const logoutDoctor = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("doctorToken", " ", {
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: true,
      sameSite: "None"
    })
    .json({
      success: true,
      message: " Doctor Logged out successfully!",
    });
});

// Route to add a new doctor

export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Doctor Avatar Required!", 400));
  }

  const { docAvatar } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(docAvatar.mimetype)) {
    return next(new ErrorHandler("File Format Not Supported!", 400));
  }
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    dob,
    nic,
    doctorDepartment,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !gender ||
    !dob ||
    !nic ||
    !doctorDepartment
  ) {
    return next(new ErrorHandler("Please Provide Full Details!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(
      new ErrorHandler(
        `${isRegistered.role} with this email already exists!`,
        400
      )
    );
  }
  const cloudinaryResponse = await cloudinary.uploader.upload(
    docAvatar.tempFilePath
  );
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse.error || "Unknown Cloudinary Error"
    );
  }
  const doctor = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    dob,
    nic,
    role: "Doctor",
    doctorDepartment,
    docAvatar: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });
  res.status(200).json({
    success: true,
    message: "New Doctor Registered!",
    doctor,
  });
});

// Route for doctor login
export const doctorLogin = catchAsyncErrors(async (req, res, next) => {
  const { email, password, confirmpassword } = req.body;

  // Validate inputs
  if (!email || !password || !confirmpassword) {
    return next(new ErrorHandler("Please provide all details!", 400));
  }

  if (password !== confirmpassword) {
    return next(
      new ErrorHandler("Password and Confirm Password do not match!", 400)
    );
  }

  // Find doctor by email
  const doctor = await User.findOne({ email, role: "Doctor" }).select(
    "+password"
  );
  if (!doctor) {
    return next(new ErrorHandler("Invalid email or password!", 400));
  }

  // Validate password
  const isPasswordMatched = await bcrypt.compare(password, doctor.password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password!", 400));
  }

  // Generate and send token
  generateToken(doctor, "Doctor login successful!", 200, res);
});
