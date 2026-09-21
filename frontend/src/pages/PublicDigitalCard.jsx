import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import "./PublicDigitalCard.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "CC"
  );
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function normalizeSkills(skills) {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills.filter(Boolean);
  if (typeof skills === "string") {
    return skills.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function CampusCodeMark() {
  return (
    <span className="public-id-mark" aria-label="CampusCode logo">
      <i />
      <i />
      <i />
    </span>
  );
}

function Brand() {
  return (
    <div className="public-id-brand">
      <CampusCodeMark />
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
          `${API_BASE_URL}/student/digital-id/public/${encodeURIComponent(campusId)}`
        );

        const result = await response.json().catch(() => ({}));

        if (cancelled) return;

        if (!response.ok || !result.success || !result.verified) {
          setCard(null);
          setError(result.message || "This Digital ID could not be verified.");
          setLoading(false);
          return;
        }

        setCard(result.digital_card || null);
      } catch (err) {
        if (cancelled) return;
        console.error("Public Digital Card Error:", err);
        setCard(null);
        setError("Unable to connect to the CampusCode verification service.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [campusId]);

  if (loading) {
    return (
      <main className="public-id-page">
        <div className="public-id-shell">
          <Brand />
          <section className="public-id-state">
            <div className="public-id-spinner" />
            <strong>VERIFYING DIGITAL ID</strong>
            <p>CampusCode is checking this participant ID.</p>
          </section>
          <PublicFooter />
        </div>
      </main>
    );
  }

  if (!card) {
    return (
      <main className="public-id-page">
        <div className="public-id-shell">
          <Brand />
          <section className="public-id-state public-id-state-error">
            <div className="public-id-error-icon">!</div>
            <span>VERIFICATION FAILED</span>
            <h1>Digital ID not verified.</h1>
            <p>{error || "This Digital ID is invalid or inactive."}</p>
            <div className="public-id-requested">
              <small>REQUESTED CAMPUS ID</small>
              <strong>{campusId || "—"}</strong>
            </div>
            <Link className="public-id-back" to="/">GO TO CAMPUSCODE</Link>
          </section>
          <PublicFooter />
        </div>
      </main>
    );
  }

  const participant = card.participant || {};
  const statistics = card.statistics || {};
  const verification = card.verification || {};
  const skills = normalizeSkills(participant.skills);
  const initials = getInitials(participant.name);
  const publicUrl = `${window.location.origin}/u/${encodeURIComponent(participant.campus_id || campusId)}`;

  return (
    <main className="public-id-page">
      <div className="public-id-shell">
        <Brand />

        <div className="public-id-layout">
          <section className="public-id-card">
            <div className="public-id-card-top">
              <Brand />
              <span className="public-id-verified">VERIFIED</span>
            </div>

            <div className="public-id-main">
              <div className="public-id-avatar">
                {participant.avatar_url ? (
                  <img src={participant.avatar_url} alt="Participant" />
                ) : (
                  initials
                )}
              </div>

              <div>
                <span>PARTICIPANT</span>
                <h1>{participant.name || "CampusCode Participant"}</h1>
                <p>{participant.campus_id || campusId}</p>
              </div>
            </div>

            <div className="public-id-data">
              <div>
                <span>HACKATHONS</span>
                <strong>{statistics.total_hackathons ?? 0}</strong>
              </div>
              <div>
                <span>TEAMS</span>
                <strong>{statistics.total_teams ?? 0}</strong>
              </div>
              <div>
                <span>COMPLETED</span>
                <strong>{statistics.completed_hackathons ?? 0}</strong>
              </div>
            </div>

            {skills.length > 0 && (
              <div className="public-id-skills">
                <span>SKILLS</span>
                <div>
                  {skills.map((skill, index) => (
                    <b key={`${skill}-${index}`}>{skill}</b>
                  ))}
                </div>
              </div>
            )}

            <div className="public-id-qr-wrap">
              <QRCodeSVG
                value={publicUrl}
                size={180}
                level="H"
                bgColor="#ffffff"
                fgColor="#0a0a0a"
              />
              <span>SCAN TO VERIFY DIGITAL ID</span>
            </div>

            <div className="public-id-card-footer">
              <span>LEARN · BUILD · BELONG</span>
              <span>{participant.campus_id || campusId}</span>
            </div>
          </section>

          <section className="public-id-info">
            <span>IDENTITY VERIFICATION</span>
            <h2>Verified<br />participant.</h2>
            <p>
              This public page confirms that the CampusCode Digital ID belongs
              to an active participant account. Only limited public profile
              information is shown here.
            </p>

            <div className="public-id-check">
              <i />
              <strong>{verification.status || "ACTIVE"}</strong>
              <span>CampusCode Digital ID</span>
            </div>

            <div className="public-id-meta">
              <div>
                <span>MEMBER SINCE</span>
                <strong>{formatDate(participant.joined_at)}</strong>
              </div>
              <div>
                <span>PLATFORM</span>
                <strong>CampusCode</strong>
              </div>
            </div>

            <div className="public-id-actions">
              <Link to="/" className="public-id-primary">CAMPUSCODE HOME</Link>
            </div>
          </section>
        </div>

        <div className="public-id-security">
          <span>🔒</span>
          <p>No email, password, private account data, or authentication information is exposed through this public verification page.</p>
        </div>

        <PublicFooter />
      </div>
    </main>
  );
}
