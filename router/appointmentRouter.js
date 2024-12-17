import express from "express";
import { deleteAppointment, getAllAppointments, postAppointment, updateAppointmentStatus } from "../controller/appointmentController.js";
import { isAdminAuthenticated, isPatientAuthenticated, isDoctorAuthenticated} from "../middlewares/auth.js"

const router = express.Router();
const isAdminOrDoctorAuthenticated = (req, res, next) => {
    // First, try admin authentication
    isAdminAuthenticated(req, res, (err) => {
      if (!err) {
        // Admin authentication succeeded
        return next();
      }
      // If admin authentication fails, try doctor authentication
      isDoctorAuthenticated(req, res, (err) => {
        if (!err) {
          // Doctor authentication succeeded
          return next();
        }
        // Both authentications failed
        res.status(403).json({ message: "Unauthorized" });
      });
    });
  };
  

router.post("/post", isPatientAuthenticated, postAppointment);
router.get("/getall", isAdminOrDoctorAuthenticated, getAllAppointments);
router.put("/update/:id", isAdminOrDoctorAuthenticated, updateAppointmentStatus);
router.delete("/delete/:id", isAdminOrDoctorAuthenticated, deleteAppointment);


export default router;