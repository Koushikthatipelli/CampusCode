import express from "express";

import {
  getStudentDashboard,
} from "../controllers/student-dashboard.controller.js";

import {
  requireAuth,
  requireRole,
} from "../middleware/auth.middleware.js";

const router = express.Router();

/* =========================================================
   STUDENT DASHBOARD
========================================================= */

router.get(
  "/student",
  requireAuth,
  requireRole("STUDENT"),
  getStudentDashboard
);

export default router;