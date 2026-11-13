
import { Router } from "express";

import {
  register,
  login,
  getCurrentUser
} from "../controllers/authController.js";

import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", authenticate, getCurrentUser);

export default router;
