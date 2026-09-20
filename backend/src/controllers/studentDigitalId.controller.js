import pool from "../config/db.js";

/*
  GET STUDENT DIGITAL ID

  GET /api/student/digital-id
*/
export const getStudentDigitalId = async (req, res) => {
  try {
    const studentId = req.user.id;

    // --------------------------------------------------
    // 1. Get student profile
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
        is_active,
        created_at
      FROM users
      WHERE id = $1
        AND role = 'STUDENT'
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
    // 2. Get number of registered hackathons
    // --------------------------------------------------
    const hackathonResult = await pool.query(
      `
      SELECT COUNT(*) AS total_hackathons
      FROM hackathon_participants
      WHERE user_id = $1
      `,
      [studentId]
    );

    // --------------------------------------------------
    // 3. Get number of teams
    // --------------------------------------------------
    const teamResult = await pool.query(
      `
      SELECT COUNT(DISTINCT tm.team_id) AS total_teams
      FROM team_members tm
      INNER JOIN teams t
        ON t.id = tm.team_id
      WHERE tm.user_id = $1
      `,
      [studentId]
    );

    // --------------------------------------------------
    // 4. Get completed hackathons
    // --------------------------------------------------
    const completedResult = await pool.query(
      `
      SELECT COUNT(*) AS completed_hackathons
      FROM hackathon_participants hp
      INNER JOIN hackathons h
        ON h.id = hp.hackathon_id
      WHERE hp.user_id = $1
        AND h.status = 'COMPLETED'
      `,
      [studentId]
    );

    // --------------------------------------------------
    // 5. Digital ID response
    // --------------------------------------------------
    return res.status(200).json({
      success: true,
      message: "Digital ID fetched successfully",

      digital_id: {
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          role: student.role,
          avatar_url: student.avatar_url,
          bio: student.bio,
          skills: student.skills,
          is_active: student.is_active,
          joined_at: student.created_at,
        },

        statistics: {
          total_hackathons: Number(
            hackathonResult.rows[0].total_hackathons
          ),
          total_teams: Number(
            teamResult.rows[0].total_teams
          ),
          completed_hackathons: Number(
            completedResult.rows[0].completed_hackathons
          ),
        },

        verification: {
          verified: student.is_active,
          platform: "CampusCode",
        },
      },
    });
  } catch (error) {
    console.error("Get Student Digital ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch digital ID",
      error: error.message,
    });
  }
};