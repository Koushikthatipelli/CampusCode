import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function getInitials(name = "Student") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return (
    parts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "ST"
  );
}

function normalizeSkills(skills) {
  if (!skills) return [];

  if (Array.isArray(skills)) {
    return skills.filter(Boolean).slice(0, 8);
  }

  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 8);
  }

  return [];
}

function CampusCodeMark() {
  return (
    <span className="public-card-brand-mark" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

function CampusCodeLogo({ dark = true }) {
  return (
    <div className={`public-card-logo ${dark ? "dark" : ""}`}>
      <CampusCodeMark />
      <div>
        <strong>
          CAMPUS<span>CODE</span>
        </strong>
        <small>HACKATHON ARENA</small>
      </div>
    </div>
  );
}

function PageFooter() {
  return (
    <footer className="public-card-page-footer">
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
            result.message || "This CampusCode Digital ID could not be verified."
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
        setError("Unable to connect to the CampusCode verification service.");
        setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [campusId]);

  if (loading) {
    return (
      <main className="public-card-page">
        <div className="public-card-page-shell public-card-state-shell">
          <CampusCodeLogo />

          <section className="public-card-state">
            <div className="public-card-spinner" />
            <span>IDENTITY / VERIFICATION</span>
            <h1>Verifying CampusCode ID</h1>
            <p>
              Checking the participant identity and active Digital ID status.
            </p>
          </section>

          <PageFooter />
        </div>
      </main>
    );
  }

  if (!card) {
    return (
      <main className="public-card-page">
        <div className="public-card-page-shell public-card-state-shell">
          <CampusCodeLogo />

          <section className="public-card-state public-card-state-error">
            <div className="public-card-error-icon">!</div>
            <span>IDENTITY / VERIFICATION</span>
            <h1>Digital ID not verified</h1>
            <p>
              {error ||
                "This Digital ID is invalid, inactive, or no longer available."}
            </p>

            <div className="public-card-requested-id">
              <small>REQUESTED CAMPUSCODE ID</small>
              <strong>{campusId || "—"}</strong>
            </div>

            <Link to="/" className="public-card-home-button">
              GO TO CAMPUSCODE
            </Link>
          </section>

          <PageFooter />
        </div>
      </main>
    );
  }

  const participant = card.participant || {};
  const statistics = card.statistics || {};
  const verification = card.verification || {};

  const studentName = value(participant.name, "CampusCode Student");
  const campusCodeId = value(participant.campus_id, campusId);
  const initials = getInitials(studentName);
  const skills = normalizeSkills(participant.skills);

  const active = verification.status
    ? String(verification.status).toUpperCase() === "ACTIVE"
    : verification.verified !== false;

  return (
    <main className="public-card-page">
      <div className="public-card-page-shell">
        {/* Main heading */}
        <header className="public-card-page-heading">
          <CampusCodeLogo />
          <div className="public-card-heading-copy">
            <span>IDENTITY / PUBLIC VERIFICATION</span>
            <h1>CAMPUSCODE</h1>
            <p>Student Digital ID</p>
          </div>
        </header>

        <div className="public-card-verified-heading">
          <span className="public-card-verified-dot" />
          <strong>{active ? "VERIFIED PARTICIPANT" : "ID INACTIVE"}</strong>
          <span>{active ? "Valid CampusCode Digital ID" : "Verification requires attention"}</span>
        </div>

        {/* Layout 1: attached ID card + details */}
        <section className="public-card-layout-one">
          <div className="public-id-card-stage">
            {/* Attached ID tag */}
            <div className="public-id-lanyard" aria-hidden="true">
              <div className="public-id-lanyard-strap">
                <span>CAMPUSCODE</span>
              </div>
              <div className="public-id-lanyard-clip">
                <span />
              </div>
            </div>

            <article className="public-id-card-real" aria-label="CampusCode student digital ID card">
              <div className="public-id-card-top-line" />

              <div className="public-id-card-header">
                <CampusCodeLogo />
                <span className="public-id-card-type">STUDENT ID</span>
              </div>

              <div className="public-id-card-rule" />

              <div className="public-id-card-identity">
                <div className="public-id-photo">
                  {participant.avatar_url ? (
                    <img
                      src={participant.avatar_url}
                      alt={`${studentName} profile`}
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>

                <div className="public-id-card-name-block">
                  <span>STUDENT</span>
                  <h2>{studentName}</h2>
                  <strong>{campusCodeId}</strong>
                </div>

                <div className="public-id-card-active">
                  <span>{active ? "ACTIVE" : "INACTIVE"}</span>
                  <b>{active ? "✓" : "!"}</b>
                </div>
              </div>

              <div className="public-id-card-fields">
                <div>
                  <span>CAMPUSCODE ID</span>
                  <strong>{campusCodeId}</strong>
                </div>
                <div>
                  <span>ROLE</span>
                  <strong>STUDENT</strong>
                </div>
                <div>
                  <span>MEMBER SINCE</span>
                  <strong>{formatDate(participant.joined_at)}</strong>
                </div>
              </div>

              {skills.length > 0 && (
                <div className="public-id-card-skills">
                  <span>SKILLS</span>
                  <div>
                    {skills.map((skill, index) => (
                      <b key={`${skill}-${index}`}>{skill}</b>
                    ))}
                  </div>
                </div>
              )}

              <div className="public-id-card-bottom">
                <div>
                  <strong>CAMPUSCODE DIGITAL ID</strong>
                  <span>VALID PARTICIPANT CREDENTIAL</span>
                </div>
                <div className="public-id-card-mini-check">
                  <span>✓</span>
                  <small>VERIFIED</small>
                </div>
              </div>

              <div className="public-id-card-footer">
                <span>LEARN · BUILD · BELONG</span>
                <span>CC / IDENTITY</span>
              </div>
            </article>
          </div>

          {/* Public details outside the physical card */}
          <aside className="public-card-details-panel">
            <div className="public-card-details-kicker">VERIFIED STUDENT</div>
            <h2>Participant details</h2>
            <p>
              This CampusCode Digital ID was verified from the public CampusCode
              identity service. Sensitive account information is intentionally hidden.
            </p>

            <div className="public-card-verification-box">
              <div className="public-card-verification-check">✓</div>
              <div>
                <strong>Verified by CampusCode</strong>
                <span>{active ? "Active Digital ID" : "Inactive Digital ID"}</span>
              </div>
            </div>

            <div className="public-card-detail-list">
              <div>
                <span>NAME</span>
                <strong>{studentName}</strong>
              </div>
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
                <strong>{active ? "ACTIVE" : "INACTIVE"}</strong>
              </div>
              <div>
                <span>MEMBER SINCE</span>
                <strong>{formatDate(participant.joined_at)}</strong>
              </div>
            </div>

            <div className="public-card-stat-grid">
              <div>
                <strong>{statistics.total_hackathons ?? 0}</strong>
                <span>Hackathons</span>
              </div>
              <div>
                <strong>{statistics.total_teams ?? 0}</strong>
                <span>Teams</span>
              </div>
              <div>
                <strong>{statistics.completed_hackathons ?? 0}</strong>
                <span>Completed</span>
              </div>
            </div>

            <div className="public-card-security-note">
              <span>🔒</span>
              <p>
                No email, password, private account data, or authentication
                information is displayed on this public page.
              </p>
            </div>
          </aside>
        </section>

        <PageFooter />
      </div>
    </main>
  );
}
