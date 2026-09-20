import pool from "../config/db.js";

export async function getStudentDashboard(req, res) {
  try {
    const userId = req.user.id;

    const [statsResult, currentResult, notificationsResult] =
      await Promise.all([
        pool.query(
          `SELECT
             (SELECT COUNT(*)::integer
              FROM hackathon_participants hp
              JOIN hackathons h ON h.id = hp.hackathon_id
              WHERE hp.user_id = $1
                AND hp.status = 'ACTIVE'
                AND h.status IN ('OPEN', 'LIVE', 'PAUSED')) AS active_hackathons,

             (SELECT COUNT(DISTINCT t.id)::integer
              FROM team_members tm
              JOIN teams t ON t.id = tm.team_id
              WHERE tm.user_id = $1) AS projects,

             (SELECT COUNT(*)::integer
              FROM team_members tm
              WHERE tm.user_id = $1) AS team_members`,
          [userId]
        ),

        pool.query(
          `WITH my_teams AS (
             SELECT
               t.id AS team_id,
               t.name AS team_name,
               t.status AS team_status,
               t.hackathon_id
             FROM team_members tm
             JOIN teams t ON t.id = tm.team_id
             WHERE tm.user_id = $1
           ),
           ranked AS (
             SELECT
               t.id AS team_id,
               ROUND(AVG(e.overall_score)::numeric, 2) AS score,
               RANK() OVER (
                 ORDER BY AVG(e.overall_score) DESC
               ) AS rank
             FROM teams t
             JOIN projects p ON p.team_id = t.id
             JOIN submissions s ON s.project_id = p.id
             JOIN evaluations e
               ON e.submission_id = s.id
              AND e.status = 'COMPLETED'
             GROUP BY t.id
           )
           SELECT
             h.id AS hackathon_id,
             h.title AS hackathon_title,
             h.track AS hackathon_track,
             h.status AS hackathon_status,
             h.start_date,
             h.end_date,
             h.registration_deadline,

             mt.team_id,
             mt.team_name,
             mt.team_status,

             p.id AS project_id,
             p.title AS project_title,
             p.track AS project_track,
             p.completion_percentage,

             s.id AS submission_id,
             s.status AS submission_status,
             s.submitted_at,

             r.score,
             r.rank

           FROM my_teams mt
           JOIN hackathons h
             ON h.id = mt.hackathon_id
           LEFT JOIN projects p
             ON p.team_id = mt.team_id
           LEFT JOIN submissions s
             ON s.project_id = p.id
           LEFT JOIN ranked r
             ON r.team_id = mt.team_id

           ORDER BY
             CASE h.status
               WHEN 'LIVE' THEN 1
               WHEN 'PAUSED' THEN 2
               WHEN 'OPEN' THEN 3
               ELSE 4
             END,
             h.start_date DESC

           LIMIT 1`,
          [userId]
        ),

        pool.query(
          `SELECT
             id,
             title,
             message,
             type,
             is_read,
             created_at
           FROM notifications
           WHERE user_id = $1
           ORDER BY created_at DESC
           LIMIT 5`,
          [userId]
        ),
      ]);

    const stats = statsResult.rows[0];
    const current = currentResult.rows[0] || null;

    let currentEvent = null;

    if (current) {
      const memberCountResult = await pool.query(
        `SELECT COUNT(*)::integer AS count
         FROM team_members
         WHERE team_id = $1`,
        [current.team_id]
      );

      currentEvent = {
        hackathon: {
          id: current.hackathon_id,
          title: current.hackathon_title,
          track: current.hackathon_track,
          status: current.hackathon_status,
          start_date: current.start_date,
          end_date: current.end_date,
          registration_deadline:
            current.registration_deadline,
        },

        team: {
          id: current.team_id,
          name: current.team_name,
          status: current.team_status,
          member_count:
            memberCountResult.rows[0].count,
        },

        project: current.project_id
          ? {
              id: current.project_id,
              title: current.project_title,
              track: current.project_track,
              completion_percentage:
                current.completion_percentage ?? 0,
            }
          : null,

        submission: current.submission_id
          ? {
              id: current.submission_id,
              status: current.submission_status,
              submitted_at: current.submitted_at,
            }
          : null,

        score:
          current.score === null
            ? null
            : Number(current.score),

        rank:
          current.rank === null
            ? null
            : Number(current.rank),
      };
    }

    return res.json({
      success: true,

      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        campus_code_id:
          req.user.campus_code_id || null,
        role: req.user.role,
      },

      stats: {
        active_hackathons:
          Number(stats.active_hackathons || 0),

        projects:
          Number(stats.projects || 0),

        team_members:
          Number(stats.team_members || 0),

        current_rank:
          currentEvent?.rank || null,
      },

      current_event: currentEvent,

      notifications:
        notificationsResult.rows,
    });
  } catch (error) {
    console.error(
      "GET STUDENT DASHBOARD ERROR:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load student dashboard",
    });
  }
}