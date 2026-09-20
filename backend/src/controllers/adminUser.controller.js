import pool from "../config/db.js";

/*
=========================================================
GET ALL USERS
GET /api/users/admin/all
ADMIN ONLY
=========================================================
*/

export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        campus_code_id,
        name,
        email,
        role,
        bio,
        skills,
        avatar_url,
        is_active,
        created_at
      FROM users
      ORDER BY created_at DESC
    `);

    return res.status(200).json({
      success: true,
      users: result.rows,
    });
  } catch (error) {
    console.error("GET ALL USERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch users",
    });
  }
};


/*
=========================================================
BLOCK / UNBLOCK USER
PATCH /api/users/admin/:id/status
ADMIN ONLY

Body:
{
  "is_active": false
}

or

{
  "is_active": true
}
=========================================================
*/

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "is_active must be true or false",
      });
    }

    /*
     * Prevent admin from blocking/deactivating
     * their own account.
     */
    if (req.user.id === id && !is_active) {
      return res.status(400).json({
        success: false,
        message: "You cannot block your own admin account",
      });
    }

    /*
     * Prevent changing another ADMIN account.
     */
    const existingUser = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        role,
        is_active
      FROM users
      WHERE id = $1
      `,
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (existingUser.rows[0].role === "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be blocked",
      });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET is_active = $1
      WHERE id = $2
      RETURNING
        id,
        campus_code_id,
        name,
        email,
        role,
        bio,
        skills,
        avatar_url,
        is_active,
        created_at
      `,
      [is_active, id]
    );

    return res.status(200).json({
      success: true,
      message: is_active
        ? "User unblocked successfully"
        : "User blocked successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("UPDATE USER STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update user status",
    });
  }
};


/*
=========================================================
DELETE USER
DELETE /api/users/admin/:id
ADMIN ONLY
=========================================================
*/

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    /*
     * Prevent admin from deleting their own account.
     */
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account",
      });
    }

    /*
     * Check user exists.
     */
    const existingUser = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        role
      FROM users
      WHERE id = $1
      `,
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /*
     * Protect ADMIN accounts.
     */
    if (existingUser.rows[0].role === "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be deleted",
      });
    }

    /*
     * Delete user.
     *
     * PostgreSQL foreign-key restrictions may prevent
     * deletion when the user is referenced by records
     * that use ON DELETE RESTRICT.
     */
    await pool.query(
      `
      DELETE FROM users
      WHERE id = $1
      `,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      deleted_user_id: id,
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);

    /*
     * PostgreSQL foreign-key violation.
     */
    if (error.code === "23503") {
      return res.status(409).json({
        success: false,
        message:
          "This user cannot be permanently deleted because other records depend on this account. Block the user instead.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to delete user",
    });
  }
};