const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/interactions";

const DEFAULT_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.6-flash";

/*
 * If the primary Gemini model is temporarily unavailable (503),
 * automatically try fallback models.
 */
const GEMINI_MODELS = [
  DEFAULT_MODEL,
  "gemini-3.5-flash-lite",
  "gemini-2.5-flash-lite",
];

const MAX_RETRIES_PER_MODEL = 2;

const RETRY_DELAYS = [2000, 5000];

/* =========================================================
   WAIT
========================================================= */

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/* =========================================================
   CHECK WHETHER ERROR SHOULD BE RETRIED
========================================================= */

function isRetryableStatus(status) {
  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}

/* =========================================================
   EXTRACT JSON FROM MODEL RESPONSE
========================================================= */

function extractJson(text) {
  if (!text) {
    throw new Error("AI returned an empty response");
  }

  let cleaned = text.trim();

  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (
    firstBrace === -1 ||
    lastBrace === -1 ||
    lastBrace <= firstBrace
  ) {
    throw new Error(
      "AI response did not contain valid JSON"
    );
  }

  cleaned = cleaned.slice(
    firstBrace,
    lastBrace + 1
  );

  return JSON.parse(cleaned);
}

/* =========================================================
   BUILD AI PROMPT
========================================================= */

function buildProjectPrompt(project) {
  return `
You are the official AI analysis engine for CampusCode,
a student hackathon platform.

Your job is to analyze a hackathon project and provide
a recommendation for whether the TEAM should progress
to the next round.

This is AI decision support only.

The organizer must make the final selection decision.

PROJECT INFORMATION

Title:
${project.title || "Not provided"}

Track:
${project.track || "Not specified"}

Problem Statement:
${project.problem_statement || "Not provided"}

Solution:
${project.solution || "Not provided"}

Technologies:
${
  Array.isArray(project.technologies)
    ? project.technologies.join(", ")
    : project.technologies || "Not provided"
}

GitHub:
${project.github_url || "Not provided"}

Live Demo:
${project.live_demo_url || "Not provided"}

Evaluate the project using these five criteria:

1. novelty_score
2. relevance_score
3. innovation_score
4. technical_score
5. impact_score

Each score must be an integer from 0 to 100.

Evaluation guidelines:

NOVELTY:
How original and differentiated is the project?

RELEVANCE:
How clearly does the solution address the stated problem?

INNOVATION:
How effectively does the project introduce a meaningful new approach?

TECHNICAL:
How strong and appropriate is the technical implementation based on
the provided technologies and project description?

IMPACT:
How useful could the solution be for its intended users or broader community?

RECOMMENDATION:

After calculating the five scores, provide exactly ONE recommendation:

SELECT:
The project shows strong overall potential and should be considered
for progression to the next round.

REVIEW:
The project has potential but requires closer human evaluation
before making a selection decision.

REJECT:
The project currently does not demonstrate enough strength,
relevance, innovation, technical quality, or impact for progression.

IMPORTANT:

- The recommendation is advisory only.
- Do not automatically select or reject the team.
- The organizer makes the final decision.
- Do not evaluate personal characteristics of team members.
- Evaluate only the project information provided.
- Do not invent features that are not mentioned.
- Do not assume a GitHub repository or live demo works if no evidence is provided.
- Be constructive but critical.
- Give specific feedback that a student team can act on.
- Return ONLY valid JSON.
- Do not use Markdown.
- Do not wrap the JSON in code fences.

Required JSON format:

{
  "novelty_score": 0,
  "relevance_score": 0,
  "innovation_score": 0,
  "technical_score": 0,
  "impact_score": 0,
  "recommendation": "SELECT",
  "feedback": "Constructive analysis of the project."
}

The recommendation MUST be exactly one of:

SELECT
REVIEW
REJECT
`;
}

/* =========================================================
   CALL ONE GEMINI MODEL
========================================================= */

async function callGeminiModel(prompt, model) {
  let lastError = null;

  for (
    let attempt = 0;
    attempt <= MAX_RETRIES_PER_MODEL;
    attempt++
  ) {
    try {
      console.log(
        `Gemini request: model=${model}, attempt=${attempt + 1}/${
          MAX_RETRIES_PER_MODEL + 1
        }`
      );

      const response = await fetch(
        `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            model,

            input: prompt,

            response_format: {
              type: "text",
              mime_type: "application/json",

              schema: {
                type: "object",

                properties: {
                  novelty_score: {
                    type: "integer",
                  },

                  relevance_score: {
                    type: "integer",
                  },

                  innovation_score: {
                    type: "integer",
                  },

                  technical_score: {
                    type: "integer",
                  },

                  impact_score: {
                    type: "integer",
                  },

                  recommendation: {
                    type: "string",

                    enum: [
                      "SELECT",
                      "REVIEW",
                      "REJECT",
                    ],
                  },

                  feedback: {
                    type: "string",
                  },
                },

                required: [
                  "novelty_score",
                  "relevance_score",
                  "innovation_score",
                  "technical_score",
                  "impact_score",
                  "recommendation",
                  "feedback",
                ],
              },
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        console.error(
          `GEMINI API ERROR [${response.status}] using ${model}:`,
          errorText
        );

        if (
          isRetryableStatus(response.status) &&
          attempt < MAX_RETRIES_PER_MODEL
        ) {
          const delay = RETRY_DELAYS[attempt];

          console.log(
            `Temporary Gemini error (${response.status}). ` +
              `Retrying ${model} in ${delay / 1000}s...`
          );

          await sleep(delay);

          continue;
        }

        const error = new Error(
          `Gemini API error: ${response.status}`
        );

        error.status = response.status;
        error.model = model;
        error.responseBody = errorText;

        throw error;
      }

      const data = await response.json();

      console.log(
        `GEMINI RESPONSE RECEIVED FROM ${model}`
      );

      const outputText =
        data.steps
          ?.filter(
            (step) =>
              step.type === "model_output"
          )
          ?.flatMap(
            (step) =>
              step.content || []
          )
          ?.filter(
            (content) =>
              content.type === "text"
          )
          ?.map(
            (content) =>
              content.text
          )
          ?.join("")
          ?.trim() || "";

      if (!outputText) {
        console.error(
          `GEMINI EMPTY RESPONSE FROM ${model}:`,
          JSON.stringify(data, null, 2)
        );

        throw new Error(
          `Gemini returned no text output from ${model}`
        );
      }

      return {
        outputText,
        model,
      };
    } catch (error) {
      lastError = error;

      /*
       * Do not retry authentication/configuration errors.
       */
      const status = error.status;

      const shouldRetry =
        attempt < MAX_RETRIES_PER_MODEL &&
        (
          !status ||
          isRetryableStatus(status)
        );

      if (shouldRetry) {
        const delay = RETRY_DELAYS[attempt];

        console.log(
          `Gemini request error for ${model}. ` +
            `Retrying in ${delay / 1000}s...`
        );

        await sleep(delay);

        continue;
      }

      break;
    }
  }

  throw lastError ||
    new Error(
      `Gemini model ${model} failed`
    );
}

/* =========================================================
   CALL GEMINI WITH MODEL FALLBACK
========================================================= */

async function callGemini(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not configured"
    );
  }

  let lastError = null;

  /*
   * Try each model.
   *
   * Example:
   *
   * gemini-3.6-flash
   *       ↓ 503
   * retry
   *       ↓ 503
   * gemini-3.5-flash-lite
   *       ↓
   * response
   */

  for (const model of GEMINI_MODELS) {
    try {
      console.log(
        `Trying Gemini model: ${model}`
      );

      const result =
        await callGeminiModel(
          prompt,
          model
        );

      console.log(
        `Gemini analysis successful using ${model}`
      );

      return result;
    } catch (error) {
      lastError = error;

      console.error(
        `Gemini model ${model} failed:`,
        error.message
      );

      /*
       * Do not switch models for permanent
       * authentication/configuration errors.
       */

      if (
        error.status === 400 ||
        error.status === 401 ||
        error.status === 403
      ) {
        throw error;
      }

      /*
       * Otherwise continue to the next
       * fallback model.
       */

      console.log(
        `Switching from ${model} to next Gemini fallback model...`
      );
    }
  }

  throw lastError ||
    new Error(
      "All Gemini models failed"
    );
}

/* =========================================================
   ANALYZE PROJECT WITH AI
========================================================= */

export async function analyzeProjectWithAI(
  project
) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not configured"
    );
  }

  const prompt =
    buildProjectPrompt(project);

  /*
   * callGemini now returns:
   *
   * {
   *   outputText,
   *   model
   * }
   */

  const {
    outputText,
    model,
  } = await callGemini(prompt);

  const analysis =
    extractJson(outputText);

  /* =======================================================
     VALIDATE SCORES
  ======================================================= */

  const scoreFields = [
    "novelty_score",
    "relevance_score",
    "innovation_score",
    "technical_score",
    "impact_score",
  ];

  for (const field of scoreFields) {
    const value =
      Number(analysis[field]);

    if (
      !Number.isInteger(value) ||
      value < 0 ||
      value > 100
    ) {
      throw new Error(
        `Invalid AI score for ${field}`
      );
    }

    analysis[field] = value;
  }

  /* =======================================================
     VALIDATE RECOMMENDATION
  ======================================================= */

  const validRecommendations = [
    "SELECT",
    "REVIEW",
    "REJECT",
  ];

  if (
    !validRecommendations.includes(
      analysis.recommendation
    )
  ) {
    throw new Error(
      "Invalid AI recommendation"
    );
  }

  /* =======================================================
     VALIDATE FEEDBACK
  ======================================================= */

  if (
    typeof analysis.feedback !==
      "string" ||
    !analysis.feedback.trim()
  ) {
    throw new Error(
      "AI feedback is missing"
    );
  }

  /* =======================================================
     CALCULATE OVERALL SCORE
  ======================================================= */

  const overallScore =
    (
      (
        analysis.novelty_score +
        analysis.relevance_score +
        analysis.innovation_score +
        analysis.technical_score +
        analysis.impact_score
      ) / 5
    );

  /* =======================================================
     RETURN FINAL ANALYSIS
  ======================================================= */

  return {
    ...analysis,

    overall_score:
      Number(
        overallScore.toFixed(2)
      ),

    /*
     * Return the model that actually
     * produced the analysis.
     */
    model_name: model,
  };
}