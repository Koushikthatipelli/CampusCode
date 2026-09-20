import pool from "../config/db.js";

/* =========================================================
   GET ROUND 2 STATUS

   GET
   /api/student/round2/hackathons/:hackathonId
========================================================= */

export async function getRound2Status(req, res) {
  try {
    const studentId = req.user.id;
    const { hackathonId } = req.params;

    if (!hackathonId) {
      return res.status(400).json({
        success: false,
        message: "Hackathon ID is required",
      });
    }

    /* -----------------------------------------------------
       1. CHECK REGISTRATION

       IMPORTANT:
       Actual table:
       hackathon_participants

       Actual user column:
       user_id
    ----------------------------------------------------- */

    const registrationResult = await pool.query(
      `
      SELECT
        hp.id AS participant_id,
        hp.status AS registration_status,

        h.id AS hackathon_id,
        h.title AS hackathon_title,
        h.description AS hackathon_description,
        h.status AS hackathon_status,
        h.current_round,
        h.start_date,
        h.end_date

      FROM hackathon_participants hp

      INNER JOIN hackathons h
        ON h.id = hp.hackathon_id

      WHERE hp.user_id = $1
        AND hp.hackathon_id = $2

      LIMIT 1
      `,
      [studentId, hackathonId]
    );

    if (registrationResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "You are not registered for this hackathon",
      });
    }

    const registration = registrationResult.rows[0];

    /* -----------------------------------------------------
       2. GET HACKATHON
    ----------------------------------------------------- */

    const hackathonResult = await pool.query(
      `
      SELECT
        id,
        title,
        description,
        status,
        current_round,
        start_date,
        end_date
      FROM hackathons
      WHERE id = $1
      LIMIT 1
      `,
      [hackathonId]
    );

    if (hackathonResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    const hackathon = hackathonResult.rows[0];

    const currentRound = Number(hackathon.current_round);

    /* -----------------------------------------------------
       3. FIND STUDENT TEAM

       IMPORTANT:
       Actual team_members column:
       user_id
    ----------------------------------------------------- */

    const teamResult = await pool.query(
      `
      SELECT
        t.id AS team_id,
        t.name AS team_name,
        t.status AS team_status

      FROM team_members tm

      INNER JOIN teams t
        ON t.id = tm.team_id

      WHERE tm.user_id = $1
        AND t.hackathon_id = $2

      LIMIT 1
      `,
      [studentId, hackathonId]
    );

    if (teamResult.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Round 2 status fetched successfully",

        accessible: false,

        submission: null,

        decision: null,

        hackathon: {
          ...hackathon,
          current_round: currentRound,
        },

        registration,

        team: null,

        round1: {
          selected: false,
          decision: null,
        },

        round2: {
          accessible: false,
          current_round: currentRound,
          submission: null,
          decision: null,
        },

        reason: "NO_TEAM",
      });
    }

    const teamRow = teamResult.rows[0];

    const team = {
      id: teamRow.team_id,
      name: teamRow.team_name,
      status: teamRow.team_status,
    };

    /* -----------------------------------------------------
       4. GET ROUND 1 DECISION
    ----------------------------------------------------- */

    const round1DecisionResult = await pool.query(
      `
      SELECT
        id,
        hackathon_id,
        team_id,
        round1_submission_id,
        decision,
        organizer_feedback,
        decided_by,
        decided_at

      FROM round1_decisions

      WHERE hackathon_id = $1
        AND team_id = $2

      ORDER BY decided_at DESC

      LIMIT 1
      `,
      [hackathonId, team.id]
    );

    const round1Decision =
      round1DecisionResult.rows.length > 0
        ? round1DecisionResult.rows[0]
        : null;

    const round1Selected =
      round1Decision?.decision === "SELECTED";

    /* -----------------------------------------------------
       5. ROUND 1 MUST BE SELECTED
    ----------------------------------------------------- */

    if (!round1Selected) {
      return res.status(200).json({
        success: true,
        message: "Round 2 status fetched successfully",

        accessible: false,

        submission: null,

        decision: null,

        hackathon: {
          ...hackathon,
          current_round: currentRound,
        },

        registration,

        team,

        round1: {
          selected: false,
          decision: round1Decision,
        },

        round2: {
          accessible: false,
          current_round: currentRound,
          submission: null,
          decision: null,
        },

        reason: "NOT_SELECTED_IN_ROUND_1",
      });
    }

    /* -----------------------------------------------------
       6. GET ROUND 2 SUBMISSION
    ----------------------------------------------------- */

    const round2SubmissionResult = await pool.query(
      `
      SELECT
        id,
        hackathon_id,
        team_id,
        submitted_by,
        github_url,
        pdf_url,
        status,
        submitted_at,
        created_at,
        updated_at

      FROM round2_submissions

      WHERE hackathon_id = $1
        AND team_id = $2

      ORDER BY created_at DESC

      LIMIT 1
      `,
      [hackathonId, team.id]
    );

    const submission =
      round2SubmissionResult.rows.length > 0
        ? round2SubmissionResult.rows[0]
        : null;

    /* -----------------------------------------------------
       7. GET ROUND 2 DECISION
    ----------------------------------------------------- */

    let decision = null;

    if (submission) {
      const round2DecisionResult = await pool.query(
        `
        SELECT
          id,
          hackathon_id,
          team_id,
          round2_submission_id,
          decision,
          organizer_feedback,
          decided_by,
          decided_at

        FROM round2_decisions

        WHERE hackathon_id = $1
          AND team_id = $2
          AND round2_submission_id = $3

        ORDER BY decided_at DESC

        LIMIT 1
        `,
        [
          hackathonId,
          team.id,
          submission.id,
        ]
      );

      if (round2DecisionResult.rows.length > 0) {
        decision = round2DecisionResult.rows[0];
      }
    }

    /* -----------------------------------------------------
       8. CHECK ROUND 2 ACCESS

       Hackathon current_round = 2
       means Round 2 is active.
    ----------------------------------------------------- */

    const accessible = currentRound >= 2;

    /* -----------------------------------------------------
       9. RETURN RESPONSE
    ----------------------------------------------------- */

    return res.status(200).json({
      success: true,
      message: "Round 2 status fetched successfully",

      /*
       * These are required by StudentPanel.
       */
      accessible,

      submission,

      decision,

      hackathon: {
        ...hackathon,
        current_round: currentRound,
      },

      registration,

      team,

      round1: {
        selected: true,
        decision: round1Decision,
      },

      round2: {
        accessible,
        current_round: currentRound,
        submission,
        decision,
      },

      reason: accessible
        ? null
        : "ROUND_2_NOT_ACTIVE",
    });
  } catch (error) {
    console.error(
      "getRound2Status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Round 2 status",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
}


/* =========================================================
   SUBMIT ROUND 2

   POST
   /api/student/round2/hackathons/:hackathonId/submit
========================================================= */

export async function submitRound2(req, res) {
  try {
    const studentId = req.user.id;
    const { hackathonId } = req.params;

    const {
      github_url,
      pdf_url,
    } = req.body;

    /* -----------------------------------------------------
       1. VALIDATE
    ----------------------------------------------------- */

    if (!hackathonId) {
      return res.status(400).json({
        success: false,
        message: "Hackathon ID is required",
      });
    }

    if (
      !github_url ||
      typeof github_url !== "string" ||
      !github_url.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "GitHub repository URL is required",
      });
    }

    if (
      !pdf_url ||
      typeof pdf_url !== "string" ||
      !pdf_url.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Google Drive PDF URL is required",
      });
    }

    /* -----------------------------------------------------
       2. CHECK REGISTRATION + HACKATHON
    ----------------------------------------------------- */

    const registrationResult = await pool.query(
      `
      SELECT
        hp.id AS participant_id,
        hp.status AS registration_status,

        h.id AS hackathon_id,
        h.title AS hackathon_title,
        h.current_round,
        h.status AS hackathon_status

      FROM hackathon_participants hp

      INNER JOIN hackathons h
        ON h.id = hp.hackathon_id

      WHERE hp.user_id = $1
        AND hp.hackathon_id = $2

      LIMIT 1
      `,
      [studentId, hackathonId]
    );

    if (registrationResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "You are not registered for this hackathon",
      });
    }

    const hackathon =
      registrationResult.rows[0];

    /* -----------------------------------------------------
       3. ROUND 2 MUST BE ACTIVE
    ----------------------------------------------------- */

    if (
      Number(hackathon.current_round) !== 2
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Round 2 is not currently active",

        current_round:
          Number(hackathon.current_round),
      });
    }

    /* -----------------------------------------------------
       4. FIND TEAM
    ----------------------------------------------------- */

    const teamResult = await pool.query(
      `
      SELECT
        t.id AS team_id,
        t.name AS team_name,
        t.status AS team_status

      FROM team_members tm

      INNER JOIN teams t
        ON t.id = tm.team_id

      WHERE tm.user_id = $1
        AND t.hackathon_id = $2

      LIMIT 1
      `,
      [studentId, hackathonId]
    );

    if (teamResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message:
          "You are not part of a team for this hackathon",
      });
    }

    const team = teamResult.rows[0];

    /* -----------------------------------------------------
       5. CHECK ROUND 1 DECISION
    ----------------------------------------------------- */

    const round1DecisionResult =
      await pool.query(
        `
        SELECT
          id,
          decision,
          organizer_feedback,
          decided_at

        FROM round1_decisions

        WHERE hackathon_id = $1
          AND team_id = $2

        ORDER BY decided_at DESC

        LIMIT 1
        `,
        [
          hackathonId,
          team.team_id,
        ]
      );

    if (
      round1DecisionResult.rows.length === 0
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Round 1 decision has not been recorded",
      });
    }

    const round1Decision =
      round1DecisionResult.rows[0];

    if (
      round1Decision.decision !== "SELECTED"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your Round 1 team decision must be SELECTED to submit Round 2",
      });
    }

    /* -----------------------------------------------------
       6. CHECK EXISTING SUBMISSION
    ----------------------------------------------------- */

    const existingSubmissionResult =
      await pool.query(
        `
        SELECT
          id,
          status,
          github_url,
          pdf_url,
          submitted_at

        FROM round2_submissions

        WHERE hackathon_id = $1
          AND team_id = $2

        ORDER BY created_at DESC

        LIMIT 1
        `,
        [
          hackathonId,
          team.team_id,
        ]
      );

    if (
      existingSubmissionResult.rows.length > 0
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Your team has already submitted Round 2",

        submission:
          existingSubmissionResult.rows[0],
      });
    }

    /* -----------------------------------------------------
       7. CREATE ROUND 2 SUBMISSION
    ----------------------------------------------------- */

    const submissionResult =
      await pool.query(
        `
        INSERT INTO round2_submissions (
          hackathon_id,
          team_id,
          submitted_by,
          github_url,
          pdf_url,
          status,
          submitted_at
        )

        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          'SUBMITTED',
          NOW()
        )

        RETURNING
          id,
          hackathon_id,
          team_id,
          submitted_by,
          github_url,
          pdf_url,
          status,
          submitted_at,
          created_at,
          updated_at
        `,
        [
          hackathonId,
          team.team_id,
          studentId,
          github_url.trim(),
          pdf_url.trim(),
        ]
      );

    const submission =
      submissionResult.rows[0];

    /* -----------------------------------------------------
       8. SUCCESS
    ----------------------------------------------------- */

    return res.status(201).json({
      success: true,

      message:
        "Round 2 submission submitted successfully",

      accessible: true,

      submission,

      decision: null,

      hackathon: {
        id: hackathon.hackathon_id,
        title: hackathon.hackathon_title,
        current_round:
          Number(hackathon.current_round),
        status: hackathon.hackathon_status,
      },

      team: {
        id: team.team_id,
        name: team.team_name,
        status: team.team_status,
      },

      round1: {
        selected: true,
        decision: round1Decision,
      },

      round2: {
        accessible: true,
        current_round:
          Number(hackathon.current_round),
        submission,
        decision: null,
      },
    });
  } catch (error) {
    console.error(
      "submitRound2 error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to submit Round 2",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
}