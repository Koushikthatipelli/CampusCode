import express from "express";

import {
  getStudentDigitalId,
} from "../controllers/studentDigitalId.controller.js";

import {
  requireAuth,
  requireRole,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/",
  requireAuth,
  requireRole("STUDENT"),
  getStudentDigitalId
);

export default router;