import express from "express";
import { getAllMessages, sendMessage } from "../controller/messageController.js";
import { isAdminAuthenticated, isDoctorAuthenticated } from "../middlewares/auth.js"

const router = express.Router();

const isAuthenticated = (req, res, next) => {
    // First, try admin authentication
    isAdminAuthenticated(req, res, (err) => {
      if (!err) {
        // Admin authentication succeeded
        return next();
      }
      // If admin fails, try doctor authentication
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
router.post("/send", sendMessage);
router.get("/getall", isAuthenticated, getAllMessages)

export default router;