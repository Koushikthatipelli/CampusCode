import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import "./PublicDigitalCard.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function value(...values) {
  return (
    values.find(
      (item) => item !== undefined && item !== null && item !== ""
    ) ?? "—"
  );
}

function formatDate(date) {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return String(date);

  return parsed.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitial(name = "S") {
  return String(name).trim().charAt(0).toUpperCase() || "S";
}

function normalizeSkills(skills) {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills.filter(Boolean);
  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

/* Same CampusCode mark used by StudentPanel.jsx */
function CCMark({ small = false }) {
  return (
    <span
      className={`public-cc-mark ${small ? "public-cc-mark-small" : ""}`}
      aria-label="CampusCode logo"
    >
      <span />
      <span />
      <span />
    </span>
  );
}

function Brand({ compact = false }) {
  return (
    <div className={`public-brand ${compact ? "public-brand-compact" : ""}`}>
      <CCMark small={compact} />
      <div>
        <strong>CAMPUSCODE</strong>
        <span>HACKATHON ARENA</span>
      </div>
    </div>
  );
}

function PublicFooter() {
  return (
    <footer className="public-id-footer-page">
      <span>LEARN · BUILD · BELONG</span>
      <span>Verified by CampusCode</span>
    </footer>
  );
}

export default function PublicDigitalCard() {
  const { campusId } = useParams();

  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!campusId) {
        setError("Campus ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/student/digital-id/public/${encodeURIComponent(
            campusId
          )}`
        );

        const result = await response.json().catch(() => ({}));

        if (cancelled) return;

        if (!response.ok || !result.success || !result.verified) {
          setCard(null);
          setError(
            result.message ||
              "This Digital ID could not be verified."
          );
          setLoading(false);
          return;
        }

        setCard(result.digital_card || null);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;

        console.error("Public Digital Card Error:", err);
        setCard(null);
        setError(
          "Unable to connect to the CampusCode verification service."
        );
        setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [campusId]);

  /* ----------------------------------------------------------
     LOADING
     ---------------------------------------------------------- */
  if (loading) {
    return (
      <main className="public-id-page">
        <div className="public-id-shell public-id-state-shell">
          <Brand />

          <section className="public-id-state">
            <div className="public-id-spinner" />
            <strong>VERIFYING DIGITAL ID</strong>
            <h1>Checking CampusCode ID.</h1>
            <p>
              CampusCode is securely checking the participant
              identity and card status.
            </p>
          </section>

          <PublicFooter />
        </div>
      </main>
    );
  }

  /* ----------------------------------------------------------
     INVALID / INACTIVE
     ---------------------------------------------------------- */
  if (!card) {
    return (
      <main className="public-id-page">
        <div className="public-id-shell public-id-state-shell">
          <Brand />

          <section className="public-id-state public-id-state-error">
            <div className="public-id-error-icon">!</div>
            <span>VERIFICATION FAILED</span>
            <h1>Digital ID not verified.</h1>
            <p>
              {error ||
                "This Digital ID is invalid or inactive."}
            </p>

            <div className="public-id-requested">
              <small>REQUESTED CAMPUS ID</small>
              <strong>{campusId || "—"}</strong>
            </div>

            <Link
              className="public-id-back"
              to="/"
            >
              GO TO CAMPUSCODE
            </Link>
          </section>

          <PublicFooter />
        </div>
      </main>
    );
  }

  const participant = card.participant || {};
  const statistics = card.statistics || {};
  const verification = card.verification || {};
  const campusCodeId = value(
    participant.campus_id,
    campusId
  );
  const initials = getInitial(participant.name);
  const publicUrl = `${window.location.origin}/u/${encodeURIComponent(
    campusCodeId
  )}`;

  const skills = normalizeSkills(participant.skills);

  return (
    <main className="public-id-page">
      <div className="public-id-shell">
        <header className="public-id-page-brand">
          <Brand />
        </header>

        <div className="public-id-layout">
          {/* ==================================================
              PHYSICAL-STYLE DIGITAL ID CARD
              ================================================== */}
          <section className="public-id-card">
            <div className="public-id-card-accent" />

            <div className="public-id-top">
              <Brand />

              <div className="public-id-verified-label">
                <i />
                VERIFIED
              </div>
            </div>

            <div className="public-id-card-title-row">
              <span>STUDENT DIGITAL ID</span>
              <small>CC / IDENTITY / 01</small>
            </div>

            <div className="public-id-main">
              <div className="public-id-avatar">
                {initials}
              </div>

              <div className="public-id-person">
                <span>STUDENT</span>
                <h1>{value(participant.name)}</h1>
                <p>{campusCodeId}</p>
              </div>

              <div className="public-id-status-stamp">
                <span>ACTIVE</span>
                <strong>✓</strong>
              </div>
            </div>

            <div className="public-id-data">
              <div>
                <span>CAMPUSCODE ID</span>
                <strong>{campusCodeId}</strong>
              </div>

              <div>
                <span>ROLE</span>
                <strong>STUDENT</strong>
              </div>

              <div>
                <span>ACCOUNT</span>
                <strong>ACTIVE</strong>
              </div>
            </div>

            {skills.length > 0 && (
              <div className="public-id-skills">
                <span>SKILLS</span>
                <div>
                  {skills.slice(0, 6).map((skill, index) => (
                    <b key={`${skill}-${index}`}>{skill}</b>
                  ))}
                </div>
              </div>
            )}

            <div className="public-id-card-bottom">
              <div className="public-id-qr-wrap">
                <QRCodeSVG
                  value={publicUrl}
                  size={184}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#0a0a0a"
                  includeMargin
                />
                <span>SCAN TO VERIFY DIGITAL ID</span>
              </div>

              <div className="public-id-card-side-copy">
                <strong>CAMPUSCODE</strong>
                <span>VERIFIED PARTICIPANT</span>
                <small>
                  This card is digitally issued by the
                  CampusCode platform.
                </small>
              </div>
            </div>

            <div className="public-id-card-footer">
              <span>LEARN · BUILD · BELONG</span>
              <span>{campusCodeId}</span>
            </div>
          </section>

          {/* ==================================================
              VERIFICATION INFORMATION
              ================================================== */}
          <section className="public-id-info">
            <span>IDENTITY / VERIFIED ACCOUNT</span>

            <h2>
              One ID.
              <br />
              Your CampusCode.
            </h2>

            <p>
              This public verification page confirms that this
              Digital ID belongs to an active CampusCode student.
              Only limited public profile information is shown.
            </p>

            <div className="public-id-check">
              <i />
              <strong>
                {String(
                  verification.status || "ACTIVE"
                ).toUpperCase()}
              </strong>
              <span>CampusCode Digital ID</span>
            </div>

            <div className="public-id-meta">
              <div>
                <span>MEMBER SINCE</span>
                <strong>
                  {formatDate(participant.joined_at)}
                </strong>
              </div>

              <div>
                <span>HACKATHONS</span>
                <strong>
                  {statistics.total_hackathons ?? 0}
                </strong>
              </div>

              <div>
                <span>TEAMS</span>
                <strong>
                  {statistics.total_teams ?? 0}
                </strong>
              </div>

              <div>
                <span>COMPLETED</span>
                <strong>
                  {statistics.completed_hackathons ?? 0}
                </strong>
              </div>
            </div>

            <div className="public-id-verification-box">
              <div className="public-id-verification-icon">
                ✓
              </div>
              <div>
                <strong>Verified by CampusCode</strong>
                <span>
                  Digital identity is currently active.
                </span>
              </div>
            </div>

            <div className="public-id-actions">
              <Link
                to="/"
                className="public-id-primary"
              >
                CAMPUSCODE HOME
              </Link>
            </div>
          </section>
        </div>

        <div className="public-id-security">
          <span>🔒</span>
          <p>
            No email, password, private account data, or
            authentication information is exposed through this
            public verification page.
          </p>
        </div>

        <PublicFooter />
      </div>
    </main>
  );
}
