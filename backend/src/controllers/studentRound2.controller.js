import pool from "../config/db.js";
import fs from "fs";
import os from "os";
import path from "path";
import { pipeline } from "stream/promises";
import * as pdfParseModule from "pdf-parse";

const pdfParse =
  pdfParseModule?.default ||
  pdfParseModule?.pdfParse ||
  pdfParseModule;

/* =========================================================
   HELPERS
========================================================= */

function normalizeText(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function extractGoogleDriveFileId(url) {
  const value = normalizeText(url);

  if (!value) return null;

  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/uc\?id=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);

    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

function isGoogleDriveUrl(url) {
  try {
    const parsed = new URL(url);

    return (
      parsed.hostname === "drive.google.com" ||
      parsed.hostname === "docs.google.com"
    );
  } catch {
    return false;
  }
}

/* =========================================================
   DOWNLOAD GOOGLE DRIVE PDF
========================================================= */

async function downloadGoogleDrivePdf(pdfUrl) {
  const fileId =
    extractGoogleDriveFileId(pdfUrl);

  if (!fileId) {
    throw new Error(
      "Invalid Google Drive PDF URL. Please provide a shareable Google Drive file link."
    );
  }

  const downloadUrl =
    `https://drive.usercontent.google.com/download?id=${encodeURIComponent(
      fileId
    )}&export=download&confirm=t`;

  const response = await fetch(
    downloadUrl,
    {
      redirect: "follow",
    }
  );

  if (!response.ok || !response.body) {
    throw new Error(
      `Unable to download the Google Drive PDF (HTTP ${response.status}).`
    );
  }

  const contentType = (
    response.headers.get(
      "content-type"
    ) || ""
  ).toLowerCase();

  const tempFile = path.join(
    os.tmpdir(),
    `campuscode-round2-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.pdf`
  );

  const fileStream =
    fs.createWriteStream(tempFile);

  await pipeline(
    response.body,
    fileStream
  );

  const stats =
    await fs.promises.stat(tempFile);

  const MAX_PDF_SIZE =
    10 * 1024 * 1024;

  if (stats.size === 0) {
    await fs.promises
      .unlink(tempFile)
      .catch(() => {});

    throw new Error(
      "The Google Drive file is empty."
    );
  }

  if (stats.size > MAX_PDF_SIZE) {
    await fs.promises
      .unlink(tempFile)
      .catch(() => {});

    throw new Error(
      "The Round 2 PDF must be 10 MB or smaller."
    );
  }

  const firstBytes =
    Buffer.alloc(5);

  const handle =
    await fs.promises.open(
      tempFile,
      "r"
    );

  try {
    await handle.read(
      firstBytes,
      0,
      5,
      0
    );
  } finally {
    await handle.close();
  }

  const looksLikePdf =
    firstBytes.toString("utf8") ===
    "%PDF-";

  if (!looksLikePdf) {
    await fs.promises
      .unlink(tempFile)
      .catch(() => {});

    if (
      contentType.includes(
        "text/html"
      )
    ) {
      throw new Error(
        "Google Drive returned a webpage instead of the PDF. Make sure the PDF sharing is set to anyone with the link can view."
      );
    }

    throw new Error(
      "The provided Google Drive file is not a valid PDF."
    );
  }

  return tempFile;
}

/* =========================================================
   EXTRACT PDF TEXT
========================================================= */

async function extractPdfText(pdfPath) {
  if (typeof pdfParse !== "function") {
    throw new Error(
      "PDF parser is not available. Check the pdf-parse package installation."
    );
  }

  const buffer =
    await fs.promises.readFile(
      pdfPath
    );

  const parsed =
    await pdfParse(buffer);

  return normalizeText(
    parsed?.text
  );
}

/* =========================================================
   GET ROUND 2 STATUS

   GET
   /api/student/round2/hackathons/:hackathonId
========================================================= */

export async function getRound2Status(
  req,
  res
) {
  try {
    const studentId =
      req.user.id;

    const { hackathonId } =
      req.params;

    if (!hackathonId) {
      return res.status(400).json({
        success: false,
        message:
          "Hackathon ID is required",
      });
    }

    /* -----------------------------------------------------
       1. CHECK REGISTRATION
    ----------------------------------------------------- */

    const registrationResult =
      await pool.query(
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
        [
          studentId,
          hackathonId,
        ]
      );

    if (
      registrationResult.rows
        .length === 0
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not registered for this hackathon",
      });
    }

    const registration =
      registrationResult.rows[0];

    /* -----------------------------------------------------
       2. GET HACKATHON
    ----------------------------------------------------- */

    const hackathonResult =
      await pool.query(
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

    if (
      hackathonResult.rows
        .length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Hackathon not found",
      });
    }

    const hackathon =
      hackathonResult.rows[0];

    const currentRound =
      Number(
        hackathon.current_round
      );

    /* -----------------------------------------------------
       3. FIND STUDENT TEAM
    ----------------------------------------------------- */

    const teamResult =
      await pool.query(
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
        [
          studentId,
          hackathonId,
        ]
      );

    if (
      teamResult.rows
        .length === 0
    ) {
      return res.status(200).json({
        success: true,

        message:
          "Round 2 status fetched successfully",

        accessible: false,

        submission: null,

        decision: null,

        hackathon: {
          ...hackathon,
          current_round:
            currentRound,
        },

        registration,

        team: null,

        round1: {
          selected: false,
          decision: null,
        },

        round2: {
          accessible: false,
          current_round:
            currentRound,
          submission: null,
          decision: null,
        },

        reason: "NO_TEAM",
      });
    }

    const teamRow =
      teamResult.rows[0];

    const team = {
      id: teamRow.team_id,
      name: teamRow.team_name,
      status: teamRow.team_status,
    };

    /* -----------------------------------------------------
       4. GET ROUND 1 DECISION
    ----------------------------------------------------- */

    const round1DecisionResult =
      await pool.query(
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
        [
          hackathonId,
          team.id,
        ]
      );

    const round1Decision =
      round1DecisionResult.rows
        .length > 0
        ? round1DecisionResult.rows[0]
        : null;

    const round1Selected =
      round1Decision?.decision ===
      "SELECTED";

    /* -----------------------------------------------------
       5. ROUND 1 MUST BE SELECTED
    ----------------------------------------------------- */

    if (!round1Selected) {
      return res.status(200).json({
        success: true,

        message:
          "Round 2 status fetched successfully",

        accessible: false,

        submission: null,

        decision: null,

        hackathon: {
          ...hackathon,
          current_round:
            currentRound,
        },

        registration,

        team,

        round1: {
          selected: false,
          decision:
            round1Decision,
        },

        round2: {
          accessible: false,
          current_round:
            currentRound,
          submission: null,
          decision: null,
        },

        reason:
          "NOT_SELECTED_IN_ROUND_1",
      });
    }

    /* -----------------------------------------------------
       6. GET ROUND 2 SUBMISSION

       GitHub = OPTIONAL
       PDF = REQUIRED
    ----------------------------------------------------- */

    const round2SubmissionResult =
      await pool.query(
        `
        SELECT
          id,
          hackathon_id,
          team_id,
          submitted_by,
          github_url,
          pdf_url,
          extracted_text,
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
        [
          hackathonId,
          team.id,
        ]
      );

    const submission =
      round2SubmissionResult.rows
        .length > 0
        ? round2SubmissionResult.rows[0]
        : null;

    /* -----------------------------------------------------
       7. GET ROUND 2 DECISION
    ----------------------------------------------------- */

    let decision = null;

    if (submission) {
      const round2DecisionResult =
        await pool.query(
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

      if (
        round2DecisionResult.rows
          .length > 0
      ) {
        decision =
          round2DecisionResult.rows[0];
      }
    }

    /* -----------------------------------------------------
       8. CHECK ROUND 2 ACCESS
    ----------------------------------------------------- */

    const accessible =
      currentRound >= 2;

    /* -----------------------------------------------------
       9. RETURN RESPONSE
    ----------------------------------------------------- */

    return res.status(200).json({
      success: true,

      message:
        "Round 2 status fetched successfully",

      accessible,

      submission,

      decision,

      hackathon: {
        ...hackathon,
        current_round:
          currentRound,
      },

      registration,

      team,

      round1: {
        selected: true,
        decision:
          round1Decision,
      },

      round2: {
        accessible,

        current_round:
          currentRound,

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

      message:
        "Failed to fetch Round 2 status",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
}

/* =========================================================
   SUBMIT ROUND 2

   POST
   /api/student/round2/hackathons/:hackathonId/submit

   REQUIRED:
   - Google Drive PDF URL

   OPTIONAL:
   - GitHub repository URL
========================================================= */

export async function submitRound2(
  req,
  res
) {
  let tempPdfPath = null;

  try {
    const studentId =
      req.user.id;

    const { hackathonId } =
      req.params;

    const {
      github_url,
      pdf_url,
    } = req.body || {};

    /*
     * GitHub is OPTIONAL.
     *
     * Empty string is converted to null
     * before saving to PostgreSQL.
     */
    const githubUrl =
      normalizeText(
        github_url
      );

    /*
     * PDF is REQUIRED.
     */
    const pdfUrl =
      normalizeText(
        pdf_url
      );

    /* -----------------------------------------------------
       1. VALIDATE REQUEST
    ----------------------------------------------------- */

    if (!hackathonId) {
      return res.status(400).json({
        success: false,

        message:
          "Hackathon ID is required",
      });
    }

    /*
     * IMPORTANT:
     *
     * DO NOT validate github_url here.
     *
     * GitHub is optional.
     */

    if (!pdfUrl) {
      return res.status(400).json({
        success: false,

        message:
          "Google Drive PDF URL is required",
      });
    }

    if (!isGoogleDriveUrl(pdfUrl)) {
      return res.status(400).json({
        success: false,

        message:
          "Please provide a valid Google Drive PDF URL",
      });
    }

    /* -----------------------------------------------------
       2. CHECK REGISTRATION + HACKATHON
    ----------------------------------------------------- */

    const registrationResult =
      await pool.query(
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
        [
          studentId,
          hackathonId,
        ]
      );

    if (
      registrationResult.rows
        .length === 0
    ) {
      return res.status(403).json({
        success: false,

        message:
          "You are not registered for this hackathon",
      });
    }

    const hackathon =
      registrationResult.rows[0];

    /* -----------------------------------------------------
       3. ROUND 2 MUST BE ACTIVE
    ----------------------------------------------------- */

    if (
      Number(
        hackathon.current_round
      ) !== 2
    ) {
      return res.status(403).json({
        success: false,

        message:
          "Round 2 is not currently active",

        current_round:
          Number(
            hackathon.current_round
          ),
      });
    }

    /* -----------------------------------------------------
       4. FIND TEAM
    ----------------------------------------------------- */

    const teamResult =
      await pool.query(
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
        [
          studentId,
          hackathonId,
        ]
      );

    if (
      teamResult.rows
        .length === 0
    ) {
      return res.status(403).json({
        success: false,

        message:
          "You are not part of a team for this hackathon",
      });
    }

    const team =
      teamResult.rows[0];

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
      round1DecisionResult.rows
        .length === 0
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
      round1Decision.decision !==
      "SELECTED"
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
          extracted_text,
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
      existingSubmissionResult.rows
        .length > 0
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
       7. DOWNLOAD GOOGLE DRIVE PDF
    ----------------------------------------------------- */

    try {
      tempPdfPath =
        await downloadGoogleDrivePdf(
          pdfUrl
        );
    } catch (pdfDownloadError) {
      console.error(
        "Round 2 PDF download error:",
        pdfDownloadError
      );

      return res.status(400).json({
        success: false,

        message:
          pdfDownloadError.message ||
          "Unable to access the Google Drive PDF",
      });
    }

    /* -----------------------------------------------------
       8. EXTRACT PDF TEXT
    ----------------------------------------------------- */

    let extractedText = "";

    try {
      extractedText =
        await extractPdfText(
          tempPdfPath
        );
    } catch (pdfParseError) {
      console.error(
        "Round 2 PDF extraction error:",
        pdfParseError
      );

      return res.status(400).json({
        success: false,

        message:
          "The PDF was downloaded, but its text could not be extracted. Please upload a readable text-based PDF.",
      });
    }

    if (!extractedText) {
      return res.status(400).json({
        success: false,

        message:
          "No readable text was found in the PDF. Please upload a text-based PDF.",
      });
    }

    /* -----------------------------------------------------
       9. INSERT ROUND 2 SUBMISSION

       GitHub:
       OPTIONAL -> NULL when empty.

       PDF:
       REQUIRED.

       extracted_text:
       Saved for Round 2 AI processing.
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
          extracted_text,
          status,
          submitted_at
        )

        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
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
          extracted_text,
          status,
          submitted_at,
          created_at,
          updated_at
        `,
        [
          hackathonId,
          team.team_id,
          studentId,

          /*
           * GitHub optional.
           * Save NULL if the student leaves it empty.
           */
          githubUrl || null,

          /*
           * PDF required.
           */
          pdfUrl,

          /*
           * Extracted PDF text.
           */
          extractedText,
        ]
      );

    const submission =
      submissionResult.rows[0];

    /* -----------------------------------------------------
       10. SUCCESS RESPONSE
    ----------------------------------------------------- */

    return res.status(201).json({
      success: true,

      message:
        "Round 2 submission submitted successfully",

      accessible: true,

      submission,

      decision: null,

      hackathon: {
        id:
          hackathon.hackathon_id,

        title:
          hackathon.hackathon_title,

        current_round:
          Number(
            hackathon.current_round
          ),

        status:
          hackathon.hackathon_status,
      },

      team: {
        id: team.team_id,
        name: team.team_name,
        status: team.team_status,
      },

      round1: {
        selected: true,

        decision:
          round1Decision,
      },

      round2: {
        accessible: true,

        current_round:
          Number(
            hackathon.current_round
          ),

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

      message:
        "Failed to submit Round 2",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  } finally {
    /* -----------------------------------------------------
       DELETE TEMPORARY PDF
    ----------------------------------------------------- */

    if (tempPdfPath) {
      await fs.promises
        .unlink(tempPdfPath)
        .catch(() => {});
    }
  }
}