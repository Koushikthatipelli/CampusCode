import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./PublicDigitalCard.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getInitials = (name = "") => {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "CC"
  );
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const normalizeSkills = (skills) => {
  if (!skills) return [];

  if (Array.isArray(skills)) {
    return skills.filter(Boolean);
  }

  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return [];
};

export default function PublicDigitalCard() {
  const { campusId } = useParams();

  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchDigitalCard = async () => {
      if (!campusId) {
        setError("Invalid Digital ID.");
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

        let result = {};

        try {
          result = await response.json();
        } catch {
          result = {};
        }

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
          "Unable to connect to CampusCode verification service."
        );
        setLoading(false);
      }
    };

    fetchDigitalCard();

    return () => {
      cancelled = true;
    };
  }, [campusId]);

  const participant = card?.participant || {};
  const verification = card?.verification || {};
  const statistics = card?.statistics || {};

  const skills = useMemo(
    () => normalizeSkills(participant.skills),
    [participant.skills]
  );

  const initials = useMemo(
    () => getInitials(participant.name),
    [participant.name]
  );

  /*
   * ----------------------------------------------------------
   * LOADING
   * ----------------------------------------------------------
   */
  if (loading) {
    return (
      <main className="public-card-page">
        <div className="public-card-background" />

        <div className="public-card-shell">
          <header className="public-card-brand">
            <div className="public-card-logo">
              <span />
              <span />
              <span />
            </div>

            <div className="public-card-brand-text">
              <strong>CAMPUSCODE</strong>
              <span>HACKATHON ARENA</span>
            </div>
          </header>

          <section className="public-card-status-card public-card-loading-card">
            <div className="public-card-spinner" />

            <h1>Verifying Digital ID</h1>

            <p>
              Please wait while CampusCode verifies this
              participant.
            </p>
          </section>

          <PublicCardFooter />
        </div>
      </main>
    );
  }

  /*
   * ----------------------------------------------------------
   * ERROR / INVALID CARD
   * ----------------------------------------------------------
   */
  if (!card) {
    return (
      <main className="public-card-page">
        <div className="public-card-background" />

        <div className="public-card-shell">
          <header className="public-card-brand">
            <div className="public-card-logo">
              <span />
              <span />
              <span />
            </div>

            <div className="public-card-brand-text">
              <strong>CAMPUSCODE</strong>
              <span>HACKATHON ARENA</span>
            </div>
          </header>

          <section className="public-card-status-card public-card-error-card">
            <div className="public-card-status-icon public-card-status-icon-error">
              !
            </div>

            <div className="public-card-status-label error">
              VERIFICATION FAILED
            </div>

            <h1>Digital ID Not Verified</h1>

            <p>
              {error ||
                "The Digital ID could not be verified by CampusCode."}
            </p>

            <div className="public-card-error-code">
              <span>Requested ID</span>
              <strong>{campusId || "Unknown"}</strong>
            </div>

            <div className="public-card-help-box">
              <strong>What does this mean?</strong>

              <p>
                The Digital ID may be invalid, inactive, or no
                longer available. Please verify that the QR code
                was issued by CampusCode.
              </p>
            </div>

            <Link
              to="/"
              className="public-card-home-button"
            >
              Go to CampusCode
            </Link>
          </section>

          <PublicCardFooter />
        </div>
      </main>
    );
  }

  /*
   * ----------------------------------------------------------
   * VERIFIED DIGITAL CARD
   * ----------------------------------------------------------
   */
  return (
    <main className="public-card-page">
      <div className="public-card-background" />

      <div className="public-card-shell">
        {/* BRAND */}
        <header className="public-card-brand">
          <div className="public-card-logo">
            <span />
            <span />
            <span />
          </div>

          <div className="public-card-brand-text">
            <strong>CAMPUSCODE</strong>
            <span>HACKATHON ARENA</span>
          </div>
        </header>

        {/* MAIN CARD */}
        <section className="public-digital-card">
          {/* TOP CARD BAR */}
          <div className="public-card-top">
            <div>
              <span className="public-card-eyebrow">
                DIGITAL PARTICIPANT ID
              </span>

              <h1>CampusCode</h1>
            </div>

            <div className="public-card-verified-pill">
              <span className="public-card-check">✓</span>
              VERIFIED
            </div>
          </div>

          {/* PARTICIPANT */}
          <div className="public-card-profile">
            <div className="public-card-avatar">
              {participant.avatar_url ? (
                <img
                  src={participant.avatar_url}
                  alt={`${participant.name || "Participant"} profile`}
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <div className="public-card-profile-info">
              <span className="public-card-profile-label">
                PARTICIPANT
              </span>

              <h2>
                {participant.name || "CampusCode Participant"}
              </h2>

              <div className="public-card-campus-id">
                <span>Campus ID</span>
                <strong>
                  {participant.campus_id || campusId}
                </strong>
              </div>
            </div>
          </div>

          {/* VERIFICATION */}
          <div className="public-card-verification">
            <div className="public-card-verification-icon">
              ✓
            </div>

            <div>
              <strong>Identity Verified</strong>

              <span>
                This Digital ID is currently active and
                verified by CampusCode.
              </span>
            </div>
          </div>

          {/* STATISTICS */}
          <div className="public-card-section">
            <div className="public-card-section-heading">
              <span>PARTICIPATION</span>
              <small>CampusCode activity</small>
            </div>

            <div className="public-card-stats">
              <div className="public-card-stat">
                <strong>
                  {statistics.total_hackathons ?? 0}
                </strong>

                <span>Hackathons</span>
              </div>

              <div className="public-card-stat">
                <strong>
                  {statistics.total_teams ?? 0}
                </strong>

                <span>Teams</span>
              </div>

              <div className="public-card-stat">
                <strong>
                  {statistics.completed_hackathons ?? 0}
                </strong>

                <span>Completed</span>
              </div>
            </div>
          </div>

          {/* SKILLS */}
          {skills.length > 0 && (
            <div className="public-card-section">
              <div className="public-card-section-heading">
                <span>SKILLS</span>
                <small>Participant profile</small>
              </div>

              <div className="public-card-skills">
                {skills.map((skill, index) => (
                  <span key={`${skill}-${index}`}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CARD DETAILS */}
          <div className="public-card-details">
            <div>
              <span>STATUS</span>
              <strong className="public-card-active">
                ACTIVE
              </strong>
            </div>

            <div>
              <span>PLATFORM</span>
              <strong>CampusCode</strong>
            </div>

            <div>
              <span>MEMBER SINCE</span>
              <strong>
                {formatDate(participant.joined_at)}
              </strong>
            </div>
          </div>

          {/* VERIFIED FOOTER */}
          <div className="public-card-verified-footer">
            <div className="public-card-footer-check">
              ✓
            </div>

            <div>
              <strong>Verified by CampusCode</strong>

              <span>
                Digital identity verification service
              </span>
            </div>
          </div>
        </section>

        {/* SECURITY NOTE */}
        <div className="public-card-security-note">
          <span>🔒</span>

          <p>
            This page displays limited public information for
            Digital ID verification. Sensitive account
            information is not displayed.
          </p>
        </div>

        <PublicCardFooter />
      </div>
    </main>
  );
}


/*
 * ----------------------------------------------------------
 * FOOTER
 * ----------------------------------------------------------
 */
function PublicCardFooter() {
  return (
    <footer className="public-card-footer">
      <span>
        © {new Date().getFullYear()} CampusCode
      </span>

      <span>Learn · Build · Belong</span>
    </footer>
  );
}