import pool from "../config/db.js";

/*
  GET STUDENT DASHBOARD

  GET /api/student/dashboard
*/

export const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    // --------------------------------------------------
    // 1. Get student information
    // --------------------------------------------------

    const studentResult = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        role,
        avatar_url,
        bio,
        skills,
        campus_code_id
      FROM users
      WHERE id = $1
        AND role = 'STUDENT'
        AND is_active = TRUE
      `,
      [studentId]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const student = studentResult.rows[0];

    // --------------------------------------------------
    // 2. Hackathon statistics
    // --------------------------------------------------

    const hackathonStatsResult = await pool.query(
      `
      SELECT
        COUNT(*)::integer AS total_registered,

        COUNT(*) FILTER (
          WHERE h.status = 'LIVE'
        )::integer AS live_hackathons,

        COUNT(*) FILTER (
          WHERE h.status = 'COMPLETED'
        )::integer AS completed_hackathons

      FROM hackathon_participants hp

      INNER JOIN hackathons h
        ON h.id = hp.hackathon_id

      WHERE hp.user_id = $1
      `,
      [studentId]
    );

    // --------------------------------------------------
    // 3. Team statistics
    // --------------------------------------------------

    const teamStatsResult = await pool.query(
      `
      SELECT
        COUNT(DISTINCT tm.team_id)::integer AS total_teams

      FROM team_members tm

      INNER JOIN teams t
        ON t.id = tm.team_id

      WHERE tm.user_id = $1
      `,
      [studentId]
    );

    // --------------------------------------------------
    // 4. Project statistics
    // --------------------------------------------------

    const projectStatsResult = await pool.query(
      `
      SELECT
        COUNT(DISTINCT p.id)::integer AS total_projects

      FROM projects p

      INNER JOIN teams t
        ON t.id = p.team_id

      INNER JOIN team_members tm
        ON tm.team_id = t.id

      WHERE tm.user_id = $1
      `,
      [studentId]
    );

    // --------------------------------------------------
    // 5. Winner statistics
    // --------------------------------------------------

    const winsResult = await pool.query(
      `
      SELECT
        COUNT(DISTINCT t.id)::integer AS total_wins

      FROM teams t

      INNER JOIN team_members tm
        ON tm.team_id = t.id

      WHERE tm.user_id = $1
        AND t.status = 'WINNER'
      `,
      [studentId]
    );

    // --------------------------------------------------
    // 6. Recent hackathons
    // --------------------------------------------------

    const recentHackathonsResult = await pool.query(
      `
      SELECT
        h.id,
        h.title,
        h.description,
        h.track,
        h.location,
        h.start_date,
        h.end_date,
        h.registration_deadline,
        h.status,
        h.current_round,
        h.approval_status,
        h.publication_status,

        t.id AS team_id,
        t.name AS team_name,
        t.status AS team_status

      FROM hackathon_participants hp

      INNER JOIN hackathons h
        ON h.id = hp.hackathon_id

      LEFT JOIN teams t
        ON t.hackathon_id = h.id
       AND EXISTS (
         SELECT 1
         FROM team_members tm
         WHERE tm.team_id = t.id
           AND tm.user_id = $1
       )

      WHERE hp.user_id = $1

      ORDER BY h.created_at DESC

      LIMIT 5
      `,
      [studentId]
    );

    // --------------------------------------------------
    // 7. Recent notifications
    // --------------------------------------------------

    const notificationsResult = await pool.query(
      `
      SELECT
        id,
        title,
        message,
        type,
        is_read,
        created_at

      FROM notifications

      WHERE user_id = $1

      ORDER BY created_at DESC

      LIMIT 5
      `,
      [studentId]
    );

    // --------------------------------------------------
    // 8. Unread notification count
    // --------------------------------------------------

    const unreadResult = await pool.query(
      `
      SELECT
        COUNT(*)::integer AS unread_count

      FROM notifications

      WHERE user_id = $1
        AND is_read = FALSE
      `,
      [studentId]
    );

    // --------------------------------------------------
    // 9. Current active hackathon / team
    // --------------------------------------------------

    const currentHackathonResult = await pool.query(
      `
      SELECT
        h.id AS hackathon_id,
        h.title AS hackathon_title,
        h.track AS hackathon_track,
        h.location AS hackathon_location,
        h.status AS hackathon_status,
        h.current_round,
        h.start_date,
        h.end_date,
        h.registration_deadline,

        t.id AS team_id,
        t.name AS team_name,
        t.status AS team_status

      FROM hackathon_participants hp

      INNER JOIN hackathons h
        ON h.id = hp.hackathon_id

      LEFT JOIN teams t
        ON t.hackathon_id = h.id
       AND EXISTS (
         SELECT 1
         FROM team_members tm
         WHERE tm.team_id = t.id
           AND tm.user_id = $1
       )

      WHERE hp.user_id = $1

      ORDER BY
        CASE h.status
          WHEN 'LIVE' THEN 1
          WHEN 'PAUSED' THEN 2
          WHEN 'OPEN' THEN 3
          ELSE 4
        END,
        h.start_date DESC

      LIMIT 1
      `,
      [studentId]
    );

    // --------------------------------------------------
    // 10. Current team member count
    // --------------------------------------------------

    let currentEvent = null;

    if (currentHackathonResult.rows.length > 0) {
      const current =
        currentHackathonResult.rows[0];

      let memberCount = 0;

      if (current.team_id) {
        const memberCountResult = await pool.query(
          `
          SELECT
            COUNT(*)::integer AS count
          FROM team_members
          WHERE team_id = $1
          `,
          [current.team_id]
        );

        memberCount =
          Number(
            memberCountResult.rows[0]?.count || 0
          );
      }

      currentEvent = {
        hackathon: {
          id: current.hackathon_id,
          title: current.hackathon_title,
          track: current.hackathon_track,
          location: current.hackathon_location,
          status: current.hackathon_status,
          current_round:
            Number(current.current_round || 0),
          start_date: current.start_date,
          end_date: current.end_date,
          registration_deadline:
            current.registration_deadline,
        },

        team: current.team_id
          ? {
              id: current.team_id,
              name: current.team_name,
              status: current.team_status,
              member_count: memberCount,
            }
          : null,
      };
    }

    // --------------------------------------------------
    // 11. Prepare statistics
    // --------------------------------------------------

    const hackathonStats =
      hackathonStatsResult.rows[0];

    const teamStats =
      teamStatsResult.rows[0];

    const projectStats =
      projectStatsResult.rows[0];

    const wins =
      winsResult.rows[0];

    const unreadCount =
      unreadResult.rows[0];

    // --------------------------------------------------
    // 12. Final response
    // --------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Student dashboard fetched successfully",

      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        role: student.role,
        avatar_url: student.avatar_url,
        bio: student.bio,
        skills: student.skills || [],
        campus_code_id:
          student.campus_code_id || null,
      },

      statistics: {
        total_registered_hackathons:
          Number(
            hackathonStats.total_registered || 0
          ),

        live_hackathons:
          Number(
            hackathonStats.live_hackathons || 0
          ),

        completed_hackathons:
          Number(
            hackathonStats.completed_hackathons || 0
          ),

        total_teams:
          Number(
            teamStats.total_teams || 0
          ),

        total_projects:
          Number(
            projectStats.total_projects || 0
          ),

        total_wins:
          Number(
            wins.total_wins || 0
          ),
      },

      current_event:
        currentEvent,

      recent_hackathons:
        recentHackathonsResult.rows,

      notifications: {
        unread_count:
          Number(
            unreadCount.unread_count || 0
          ),

        recent:
          notificationsResult.rows,
      },
    });
  } catch (error) {
    console.error(
      "GET STUDENT DASHBOARD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch student dashboard",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};