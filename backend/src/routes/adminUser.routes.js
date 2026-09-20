import express from "express";

import {
  getAllUsers,
  updateUserStatus,
  deleteUser,
} from "../controllers/adminUser.controller.js";

import {
  requireAuth,
  requireRole,
} from "../middleware/auth.middleware.js";

const router = express.Router();

/*
=========================================================
ADMIN AUTHORIZATION
=========================================================
*/

/*
  requireAuth:
  - Checks JWT
  - Loads user into req.user
  - Checks account is active

  requireRole("ADMIN"):
  - Allows only ADMIN users
*/

const adminOnly = requireRole("ADMIN");

/*
=========================================================
GET ALL USERS
GET /api/users/admin/all
=========================================================
*/

router.get(
  "/all",
  requireAuth,
  adminOnly,
  getAllUsers
);

/*
=========================================================
BLOCK / UNBLOCK USER
PATCH /api/users/admin/:id/status
=========================================================
*/

router.patch(
  "/:id/status",
  requireAuth,
  adminOnly,
  updateUserStatus
);

/*
=========================================================
DELETE USER
DELETE /api/users/admin/:id
=========================================================
*/

router.delete(
  "/:id",
  requireAuth,
  adminOnly,
  deleteUser
);

export default router;