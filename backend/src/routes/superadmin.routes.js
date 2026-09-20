// routes/superadmin.routes.js

import express from "express";

import {
  requireAuth,
  requireRole,
} from "../middleware/auth.middleware.js";

import {
  getSuperAdminOverview,
  getSystemHealth,
  getSystemStats,
  getLiveRequests,
  getLiveErrors,
  getResponseTime,
  getSystemBlueprint,
  getBlueprintNode,
  getMaintenanceMode,
  updateMaintenanceMode,
  getSystemActivity,
  clearTelemetry,
} from "../controllers/superadmin.controller.js";

const router = express.Router();

/* =========================================================
   CAMPUSCODE SUPER ADMIN ACCESS
=========================================================

   Only users whose database role is:

   SUPER_ADMIN

   can access these monitoring endpoints.

   Authentication flow:

   Login
      ↓
   /api/auth/login
      ↓
   JWT contains role = SUPER_ADMIN
      ↓
   requireAuth()
      ↓
   requireRole("SUPER_ADMIN")
      ↓
   Super Admin Monitoring API

========================================================= */


/* =========================================================
   OVERVIEW

   GET /api/superadmin/overview
========================================================= */

router.get(
  "/overview",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  getSuperAdminOverview
);


/* =========================================================
   SYSTEM HEALTH

   GET /api/superadmin/health
========================================================= */

router.get(
  "/health",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  getSystemHealth
);


/* =========================================================
   SYSTEM STATISTICS

   GET /api/superadmin/stats
========================================================= */

router.get(
  "/stats",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  getSystemStats
);


/* =========================================================
   LIVE REQUESTS

   GET /api/superadmin/requests

   Optional:

   ?service=student
   ?service=admin
   ?service=organizer
   ?service=database
   ?service=gemini
   ?service=landing

   ?limit=100
========================================================= */

router.get(
  "/requests",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  getLiveRequests
);


/* =========================================================
   LIVE ERRORS

   GET /api/superadmin/errors

   Optional:

   ?service=student
   ?service=admin
   ?service=organizer
   ?service=database
   ?service=gemini
   ?service=landing

   ?limit=100
========================================================= */

router.get(
  "/errors",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  getLiveErrors
);


/* =========================================================
   RESPONSE TIME

   GET /api/superadmin/response-time
========================================================= */

router.get(
  "/response-time",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  getResponseTime
);


/* =========================================================
   SYSTEM BLUEPRINT

   GET /api/superadmin/blueprint
========================================================= */

router.get(
  "/blueprint",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  getSystemBlueprint
);


/* =========================================================
   BLUEPRINT NODE

   GET /api/superadmin/blueprint/:nodeId

   Examples:

   /blueprint/student
   /blueprint/admin
   /blueprint/organizer
   /blueprint/database
   /blueprint/gemini
   /blueprint/landing
========================================================= */

router.get(
  "/blueprint/:nodeId",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  getBlueprintNode
);


/* =========================================================
   SYSTEM ACTIVITY

   GET /api/superadmin/activity
========================================================= */

router.get(
  "/activity",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  getSystemActivity
);


/* =========================================================
   MAINTENANCE STATUS

   GET /api/superadmin/maintenance
========================================================= */

router.get(
  "/maintenance",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  getMaintenanceMode
);


/* =========================================================
   MAINTENANCE CONTROL

   PATCH /api/superadmin/maintenance

   Body:

   {
     "enabled": true,
     "message": "CampusCode is under maintenance."
   }

   OR

   {
     "enabled": false
   }
========================================================= */

router.patch(
  "/maintenance",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  updateMaintenanceMode
);


/* =========================================================
   CLEAR TELEMETRY

   DELETE /api/superadmin/telemetry

   Clears in-memory monitoring data.
========================================================= */

router.delete(
  "/telemetry",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  clearTelemetry
);


export default router;