import express from "express";
import {
  addNewAdmin,
  addNewDoctor,
  doctorLogin,
  getAllDoctors,
  getUserDetails,
  login,
  logoutAdmin,
  logoutDoctor,
  logoutPatient,
  patientRegister,
} from "../controller/userController.js";
import { isAdminAuthenticated, isPatientAuthenticated, isDoctorAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Login route
router.post("/login", login);


// Patient routes
router.post("/patient/register", patientRegister);
router.get("/patient/me", isPatientAuthenticated, getUserDetails);
router.get("/patient/logout", isPatientAuthenticated, logoutPatient);

// Admin routes
router.post("/admin/addnew", isAdminAuthenticated, addNewAdmin);
router.get("/admin/me", isAdminAuthenticated, getUserDetails);
router.get("/admin/logout", isAdminAuthenticated, logoutAdmin);

// Doctor routes
router.post("/doctor/addnew", isAdminAuthenticated, addNewDoctor);
router.post("/doctor/login", doctorLogin);
router.get("/doctor/me", isDoctorAuthenticated, getUserDetails);
router.get("/doctors", getAllDoctors);
router.get("/doctor/logout", isDoctorAuthenticated, logoutDoctor);



export default router;
