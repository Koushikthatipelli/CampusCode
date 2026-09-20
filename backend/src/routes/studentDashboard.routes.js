import express from "express";

import {
  getStudentDashboard,
} from "../controllers/studentDashboard.controller.js";

import {
  requireAuth,
  requireRole,
} from "../middleware/auth.middleware.js";

const router = express.Router();

/*
  GET STUDENT DASHBOARD

  GET /api/student/dashboard
*/

router.get(
  "/",
  requireAuth,
  requireRole("STUDENT"),
  getStudentDashboard
);

export default router;