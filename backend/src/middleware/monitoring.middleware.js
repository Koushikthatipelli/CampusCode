import crypto from "crypto";
import pool from "../config/db.js";

/*
=========================================================
CAMPUSCODE - API MONITORING MIDDLEWARE
=========================================================

Tracks:
- Request ID
- HTTP method
- Endpoint
- Status code
- Response time
- User ID
- User role
- Errors
- User agent

Important:
Monitoring must NEVER break the actual API.
=========================================================
*/

export function monitoringMiddleware(req, res, next) {
  // Only monitor API requests
  if (!req.originalUrl.startsWith("/api")) {
    return next();
  }

  // Do not monitor monitoring endpoints themselves
  // This prevents monitoring loops.
  if (req.originalUrl.startsWith("/api/monitoring")) {
    return next();
  }

  const startedAt = process.hrtime.bigint();

  const requestId = crypto.randomUUID();

  req.monitoringRequestId = requestId;

  // Send request ID back to frontend/Postman
  res.setHeader("X-Request-ID", requestId);

  res.on("finish", () => {
    const endedAt = process.hrtime.bigint();

    const responseTimeMs =
      Number(endedAt - startedAt) / 1_000_000;

    const user = req.user || {};

    const errorMessage =
      req.monitoringError ||
      (res.statusCode >= 400
        ? res.statusMessage || null
        : null);

    pool
      .query(
        `
        INSERT INTO monitoring_logs (
          request_id,
          method,
          endpoint,
          status_code,
          response_time_ms,
          user_id,
          user_role,
          error_message,
          user_agent,
          created_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          NOW()
        )
        `,
        [
          requestId,
          req.method,
          req.originalUrl,
          res.statusCode,
          Number(responseTimeMs.toFixed(2)),
          user.id || null,
          user.role || null,
          errorMessage,
          req.get("user-agent") || null,
        ]
      )
      .catch((error) => {
        /*
          Monitoring failure must NEVER crash CampusCode.
        */

        console.error(
          "Monitoring log write failed:",
          error.message
        );
      });
  });

  next();
}