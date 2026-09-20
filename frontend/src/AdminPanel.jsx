import { useEffect, useMemo, useState } from "react";
import "./AdminPanel.css";

import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Bell,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Database,
  FileCheck2,
  Globe2,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  Network,
  MessageSquare,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Send,
  Settings,
  Trash2,
  Trophy,
  UserCircle,
  Users,
  X,
  Zap,
  Ban,
  Bot,
} from "lucide-react";

import { apiFetch } from "./api";


const navGroups = [
  {
    label: "Command",
    items: [
      ["dashboard", "Dashboard", LayoutDashboard],
      ["ai", "AI Analysis", Bot],
      ["notifications", "Notifications", Bell],
    ],
  },
  {
    label: "Management",
    items: [
      ["hackathons", "Hackathons", Trophy],
      ["approvals", "Approvals", FileCheck2],
      ["users", "Users", Users],
      ["teams", "Teams", Users],
      ["submissions", "Submissions", FileCheck2],
      ["evaluations", "Evaluations", BarChart3],
      ["results", "Results", BarChart3],
    ],
  },
  {
    label: "System",
    items: [
      ["activity", "System Activity", Activity],
      ["system", "System Blueprint", Network],
    ],
  },
  {
    label: "Account",
    items: [["profile", "Profile", UserCircle]],
  },
];

const unwrap = (data, keys = []) => {
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return Array.isArray(data) ? data : [];
};

const value = (v, fallback = "—") =>
  v === null || v === undefined || v === "" ? fallback : v;

const formatDate = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? String(v)
    : d.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const formatTime = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? String(v)
    : d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
};

function Logo() {
  return (
    <div className="admin-brand">
      <div className="admin-logo-mark" aria-label="CampusCode">
        <span className="admin-logo-bar admin-logo-black" />
        <span className="admin-logo-bar admin-logo-purple" />
        <span className="admin-logo-bar admin-logo-lime" />
      </div>
      <div>
        <div className="admin-brand-name">CAMPUSCODE</div>
        <div className="admin-brand-sub">HACKATHON ARENA</div>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="admin-loading">
      <LoaderCircle size={24} className="spin" />
      <span>Loading live backend data...</span>
    </div>
  );
}

function ErrorBox({ message }) {
  return (
    <div className="admin-error">
      <AlertCircle size={16} />
      <span>{message}</span>
    </div>
  );
}

function Empty({ title, text }) {
  return (
    <div className="admin-empty">
      <Database size={25} />
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

function PageTitle({ eyebrow, title, description, action }) {
  return (
    <div className="admin-page-title">
      <div>
        <div className="admin-eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

function StatCard({ icon: Icon, label, number, detail, tone = "" }) {
  return (
    <div className={`admin-stat ${tone}`}>
      <div className="admin-stat-icon">
        <Icon size={18} />
      </div>
      <div className="admin-stat-label">{label}</div>
      <div className="admin-stat-number">{number}</div>
      <div className="admin-stat-detail">{detail}</div>
    </div>
  );
}

function AdminSidebar({ section, navigate, open, onLogout, user }) {
  return (
    <aside className={`admin-sidebar ${open ? "open" : ""}`}>
      <div className="admin-sidebar-top">
        <Logo />
        <button
          className="admin-mobile-close"
          onClick={() => navigate(section)}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <div className="admin-sidebar-scroll">
        {navGroups.map((group) => (
          <div className="admin-nav-group" key={group.label}>
            <div className="admin-nav-label">{group.label}</div>

            {group.items.map(([key, label, Icon]) => (
              <button
                key={key}
                className={`admin-nav-item ${
                  section === key ? "active" : ""
                }`}
                onClick={() => navigate(key)}
              >
                <Icon size={17} />
                <span>{label}</span>

                {key === "approvals" && (
                  <span className="admin-nav-dot" />
                )}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="admin-sidebar-bottom">
        <div className="admin-mini-user">
          <div className="admin-avatar">
            {(user?.name || "A").charAt(0).toUpperCase()}
          </div>

          <div className="admin-mini-user-copy">
            <strong>{value(user?.name, "Administrator")}</strong>
            <span>ADMIN</span>
          </div>
        </div>

        <button className="admin-logout" onClick={onLogout}>
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

function AdminTopbar({ onMenu, user, section }) {
  const labels = {
    dashboard: "Dashboard",
    ai: "AI Analysis",
    notifications: "Notifications",
    hackathons: "Hackathons",
    approvals: "Approvals",
    users: "Users",
    teams: "Teams",
    submissions: "Submissions",
    evaluations: "Evaluations",
    results: "Results",
    activity: "System Activity",
    profile: "Profile",
  };

  return (
    <header className="admin-topbar">
      <button className="admin-menu-button" onClick={onMenu}>
        <Menu size={19} />
      </button>

      <div className="admin-breadcrumb">
        <span>ADMINISTRATION</span>
        <ChevronRight size={13} />
        <strong>{labels[section] || "Dashboard"}</strong>
      </div>

      <div className="admin-top-actions">
        <div className="admin-live-pill">
          <span />
          LIVE SYSTEM
        </div>

        <div className="admin-top-profile">
          <div className="admin-avatar small">
            {(user?.name || "A").charAt(0).toUpperCase()}
          </div>
          <span>{value(user?.name, "Admin")}</span>
        </div>
      </div>
    </header>
  );
}


/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({ onNavigate }) {
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [pending, setPending] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  const load = async () => {
    setLoading(true);
    setErrors([]);

    const results = await Promise.allSettled([
      apiFetch("/dashboard/admin"),
      apiFetch("/users/admin/all"),
      apiFetch("/hackathons"),
      apiFetch("/hackathons/admin/pending-approvals"),
      apiFetch("/health"),
    ]);

    const nextErrors = [];

    if (results[0].status === "fulfilled") {
      setData(results[0].value);
    } else {
      nextErrors.push(results[0].reason?.message || "Unable to load admin dashboard.");
    }

    if (results[1].status === "fulfilled") {
      setUsers(unwrap(results[1].value, ["users", "data"]));
    } else {
      nextErrors.push(results[1].reason?.message || "Unable to load users.");
    }

    if (results[2].status === "fulfilled") {
      setHackathons(
        unwrap(results[2].value, ["hackathons", "events", "data"])
      );
    } else {
      nextErrors.push(results[2].reason?.message || "Unable to load hackathons.");
    }

    if (results[3].status === "fulfilled") {
      setPending(
        unwrap(results[3].value, ["hackathons", "data"])
      );
    } else {
      nextErrors.push(results[3].reason?.message || "Unable to load approvals.");
    }

    if (results[4].status === "fulfilled") {
      setHealth(results[4].value);
    } else {
      nextErrors.push(results[4].reason?.message || "Unable to check backend health.");
    }

    setErrors(nextErrors);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const dashboardStats =
    data?.statistics || data?.stats || data?.data || {};

  const totalUsers =
    dashboardStats.total_users ??
    dashboardStats.users ??
    users.length;

  const activeUsers =
    dashboardStats.active_users ??
    users.filter((u) => u.is_active !== false).length;

  const totalHackathons =
    dashboardStats.total_hackathons ??
    dashboardStats.hackathons ??
    hackathons.length;

  const pendingCount =
    dashboardStats.pending_approvals ??
    dashboardStats.pending_hackathons ??
    pending.length;

  return (
    <div>
      <PageTitle
        eyebrow="Command Center"
        title={
          <>
            Platform <span>overview.</span>
          </>
        }
        description="A live administrative view of CampusCode. Metrics and records come from the connected backend."
        action={
          <button className="admin-refresh" onClick={load}>
            <RefreshCw size={15} />
            Refresh
          </button>
        }
      />

      {errors.map((error, index) => (
        <ErrorBox key={index} message={error} />
      ))}

      {loading ? (
        <Loading />
      ) : (
        <>
          <section className="admin-hero-grid">
            <div className="admin-command-card">
              <div className="admin-command-grid" />

              <div className="admin-command-content">
                <div className="admin-command-tag">
                  <Zap size={13} />
                  CAMPUSCODE / ADMINISTRATION
                </div>

                <h2>
                  COMMAND
                  <br />
                  <em>CENTER.</em>
                </h2>

                <p>
                  Manage the hackathon ecosystem, review organizer requests,
                  operate notifications and keep platform activity visible.
                </p>

                <div className="admin-command-meta">
                  <span>
                    <i />
                    API {health?.status === "healthy" ? "HEALTHY" : "CONNECTED"}
                  </span>

                  <span>
                    DATABASE {health?.database || "—"}
                  </span>
                </div>
              </div>

              <div className="admin-command-orbit">
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className="admin-system-card">
              <div className="admin-card-head">
                <div>
                  <span className="admin-kicker">System snapshot</span>
                  <h3>Control signals</h3>
                </div>
                <Activity size={18} />
              </div>

              <div className="admin-signal">
                <span>Backend</span>
                <strong>{value(health?.status)}</strong>
                <i className={health?.status === "healthy" ? "ok" : ""} />
              </div>

              <div className="admin-signal">
                <span>Database</span>
                <strong>{value(health?.database)}</strong>
                <i className={health?.database === "connected" ? "ok" : ""} />
              </div>

              <div className="admin-signal">
                <span>Pending approvals</span>
                <strong>{pendingCount}</strong>
                <i className={pendingCount ? "warn" : "ok"} />
              </div>

              <div className="admin-system-footer">
                Last checked {formatTime(new Date())}
              </div>
            </div>
          </section>

          <section className="admin-stats-grid">
            <StatCard
              icon={Users}
              label="Total users"
              number={totalUsers}
              detail="Live from backend"
            />

            <StatCard
              icon={Trophy}
              label="Hackathons"
              number={totalHackathons}
              detail="Live hackathon registry"
              tone="purple"
            />

            <StatCard
              icon={Clock3}
              label="Pending approvals"
              number={pendingCount}
              detail="Requires admin review"
              tone="amber"
            />

            <StatCard
              icon={ShieldCheck}
              label="Active users"
              number={activeUsers}
              detail="Accounts currently active"
              tone="cyan"
            />
          </section>

          <section className="admin-two-column">
            <div className="admin-panel-card">
              <div className="admin-card-head">
                <div>
                  <span className="admin-kicker">Approval queue</span>
                  <h3>Needs your attention</h3>
                </div>

                <button onClick={() => onNavigate("approvals")}>
                  Open queue <ChevronRight size={14} />
                </button>
              </div>

              {pending.length ? (
                pending.slice(0, 5).map((item) => (
                  <div className="admin-list-row" key={item.id}>
                    <div className="admin-row-icon">
                      <FileCheck2 size={15} />
                    </div>

                    <div className="admin-row-main">
                      <strong>
                        {value(item.title, "Untitled hackathon")}
                      </strong>

                      <span>
                        {value(item.organizer_name, "Unknown organizer")} ·{" "}
                        {formatDate(item.created_at)}
                      </span>
                    </div>

                    <span className="status-badge pending">
                      {String(
                        item.approval_status || "PENDING"
                      ).replaceAll("_", " ")}
                    </span>
                  </div>
                ))
              ) : (
                <Empty
                  title="Approval queue is clear"
                  text="No pending hackathon approvals were returned by the backend."
                />
              )}
            </div>

            <div className="admin-panel-card">
              <div className="admin-card-head">
                <div>
                  <span className="admin-kicker">Platform records</span>
                  <h3>Hackathon activity</h3>
                </div>

                <button onClick={() => onNavigate("hackathons")}>
                  View all <ChevronRight size={14} />
                </button>
              </div>

              {hackathons.length ? (
                hackathons.slice(0, 5).map((item) => (
                  <div className="admin-list-row" key={item.id}>
                    <div className="admin-row-icon purple">
                      <Trophy size={15} />
                    </div>

                    <div className="admin-row-main">
                      <strong>
                        {value(item.title || item.name)}
                      </strong>

                      <span>
                        {value(item.track || item.category, "No track")} ·{" "}
                        {formatDate(item.created_at)}
                      </span>
                    </div>

                    <span className="status-badge">
                      {String(
                        item.publication_status ||
                        item.approval_status ||
                        item.status ||
                        "UNKNOWN"
                      ).replaceAll("_", " ")}
                    </span>
                  </div>
                ))
              ) : (
                <Empty
                  title="No hackathons found"
                  text="The backend returned an empty hackathon collection."
                />
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}


/* =========================================================
   AI ANALYSIS
========================================================= */

function AIAnalysisPage() {
  const [hackathons, setHackathons] = useState([]);
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadHackathons = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch("/hackathons");
      const list = unwrap(data, ["hackathons", "events", "data"]);

      setHackathons(list);

      if (list[0]?.id && !selected) {
        setSelected(String(list[0].id));
      }
    } catch (e) {
      setError(e.message);
      setHackathons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHackathons();
  }, []);

  const runRound1Analysis = async () => {
    if (!selected) return;

    setAnalyzing(true);
    setError("");
    setSuccess("");
    setResult(null);

    try {
      const data = await apiFetch(
        `/ai/hackathons/${selected}/round1/analyze`,
        {
          method: "POST",
        }
      );

      setResult(data);
      setSuccess("Round 1 AI analysis completed by the backend.");
    } catch (e) {
      setError(e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div>
      <PageTitle
        eyebrow="Command / Artificial Intelligence"
        title={
          <>
            AI <span>analysis.</span>
          </>
        }
        description="Operate the existing CampusCode AI analysis service. AI results are returned by the backend."
        action={
          <button className="admin-refresh" onClick={loadHackathons}>
            <RefreshCw size={15} />
            Refresh
          </button>
        }
      />

      {error && <ErrorBox message={error} />}
      {success && (
        <div className="admin-success">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      {loading ? (
        <Loading />
      ) : (
        <div className="ai-command-layout">
          <section className="admin-panel-card ai-control-card">
            <div className="ai-glow" />

            <div className="ai-icon-large">
              <Bot size={30} />
            </div>

            <span className="admin-kicker">Gemini / AI service</span>

            <h2>Round 1 intelligence.</h2>

            <p>
              Select a hackathon and invoke the existing Round 1 AI analysis
              endpoint. Nothing is generated or scored inside this frontend.
            </p>

            <label className="admin-field-label">HACKATHON</label>

            <select
              className="admin-select"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {!hackathons.length && (
                <option value="">No hackathons available</option>
              )}

              {hackathons.map((hackathon) => (
                <option key={hackathon.id} value={hackathon.id}>
                  {hackathon.title || hackathon.name || "Hackathon"}
                </option>
              ))}
            </select>

            <button
              className="ai-run-button"
              onClick={runRound1Analysis}
              disabled={!selected || analyzing}
            >
              {analyzing ? (
                <LoaderCircle className="spin" size={16} />
              ) : (
                <Zap size={16} />
              )}

              {analyzing ? "Analyzing..." : "Run Round 1 AI Analysis"}
            </button>

            <div className="ai-route-note">
              <span>POST</span>
              /api/ai/hackathons/:hackathonId/round1/analyze
            </div>
          </section>

          <section className="admin-panel-card ai-result-card">
            <div className="admin-card-head">
              <div>
                <span className="admin-kicker">Backend response</span>
                <h3>Analysis output</h3>
              </div>
              <Server size={18} />
            </div>

            {result ? (
              <pre className="ai-json">
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : (
              <Empty
                title="No analysis loaded"
                text="Run an analysis to display the real backend response here."
              />
            )}
          </section>
        </div>
      )}
    </div>
  );
}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function NotificationsPage() {
  const [history, setHistory] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [users, setUsers] = useState([]);

  const [audience, setAudience] = useState("STUDENTS");
  const [hackathonId, setHackathonId] = useState("");
  const [userId, setUserId] = useState("");
  const [userIds, setUserIds] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("ANNOUNCEMENT");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");

    const results = await Promise.allSettled([
      apiFetch("/notifications/history"),
      apiFetch("/hackathons"),
      apiFetch("/users/admin/all"),
    ]);

    if (results[0].status === "fulfilled") {
      setHistory(
        unwrap(results[0].value, [
          "notifications",
          "history",
          "data",
          "items",
        ])
      );
    }

    if (results[1].status === "fulfilled") {
      const list = unwrap(
        results[1].value,
        ["hackathons", "events", "data"]
      );
      setHackathons(list);

      if (list[0]?.id && !hackathonId) {
        setHackathonId(String(list[0].id));
      }
    }

    if (results[2].status === "fulfilled") {
      setUsers(
        unwrap(results[2].value, ["users", "data"])
      );
    }

    const failed = results.find((r) => r.status === "rejected");

    if (failed) {
      setError(failed.reason?.message || "Unable to load notification data.");
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleUser = (id) => {
    setUserIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const send = async (e) => {
    e.preventDefault();

    setSending(true);
    setError("");
    setSuccess("");

    const payload = {
      audience,
      title: title.trim(),
      message: message.trim(),
      type,
    };

    if (audience === "USER") {
      payload.user_id = userId;
    }

    if (audience === "SELECTED_USERS") {
      payload.user_ids = userIds;
    }

    if (audience === "HACKATHON_PARTICIPANTS") {
      payload.hackathon_id = hackathonId;
    }

    try {
      await apiFetch("/notifications", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccess("Notification sent successfully through the backend.");
      setTitle("");
      setMessage("");
      setUserId("");
      setUserIds([]);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <PageTitle
        eyebrow="Command / Communications"
        title={
          <>
            Notification <span>center.</span>
          </>
        }
        description="Send real CampusCode notifications and review notification history."
        action={
          <button className="admin-refresh" onClick={load}>
            <RefreshCw size={15} />
            Refresh
          </button>
        }
      />

      {error && <ErrorBox message={error} />}
      {success && (
        <div className="admin-success">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      {loading ? (
        <Loading />
      ) : (
        <div className="notification-layout">
          <form className="admin-panel-card notification-compose" onSubmit={send}>
            <div className="admin-card-head">
              <div>
                <span className="admin-kicker">Broadcast</span>
                <h3>Compose notification</h3>
              </div>
              <MessageSquare size={18} />
            </div>

            <label className="admin-field-label">AUDIENCE</label>

            <select
              className="admin-select"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            >
              <option value="STUDENTS">All Students</option>
              <option value="ORGANIZERS">All Organizers</option>
              <option value="ALL_USERS">All Users</option>
              <option value="USER">Single User</option>
              <option value="SELECTED_USERS">Selected Users</option>
              <option value="HACKATHON_PARTICIPANTS">
                Hackathon Participants
              </option>
            </select>

            {audience === "USER" && (
              <>
                <label className="admin-field-label">USER</label>
                <select
                  className="admin-select"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                >
                  <option value="">Select user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email}
                    </option>
                  ))}
                </select>
              </>
            )}

            {audience === "SELECTED_USERS" && (
              <div className="user-picker">
                <div className="user-picker-head">
                  <span>Select recipients</span>
                  <strong>{userIds.length} selected</strong>
                </div>

                <div className="user-picker-list">
                  {users.map((user) => (
                    <button
                      type="button"
                      key={user.id}
                      className={`user-picker-row ${
                        userIds.includes(user.id) ? "selected" : ""
                      }`}
                      onClick={() => toggleUser(user.id)}
                    >
                      <span>
                        {(user.name || "U").charAt(0).toUpperCase()}
                      </span>

                      <div>
                        <strong>{value(user.name)}</strong>
                        <small>{value(user.email)}</small>
                      </div>

                      {userIds.includes(user.id) && (
                        <CheckCircle2 size={16} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {audience === "HACKATHON_PARTICIPANTS" && (
              <>
                <label className="admin-field-label">HACKATHON</label>
                <select
                  className="admin-select"
                  value={hackathonId}
                  onChange={(e) => setHackathonId(e.target.value)}
                  required
                >
                  <option value="">Select hackathon</option>
                  {hackathons.map((hackathon) => (
                    <option key={hackathon.id} value={hackathon.id}>
                      {hackathon.title || hackathon.name}
                    </option>
                  ))}
                </select>
              </>
            )}

            <label className="admin-field-label">TYPE</label>

            <select
              className="admin-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="ANNOUNCEMENT">Announcement</option>
              <option value="INFO">Info</option>
              <option value="HACKATHON">Hackathon</option>
              <option value="ROUND">Round</option>
            </select>

            <label className="admin-field-label">TITLE</label>

            <input
              className="admin-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
              required
            />

            <label className="admin-field-label">MESSAGE</label>

            <textarea
              className="admin-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message..."
              rows={6}
              required
            />

            <button
              className="notification-send"
              type="submit"
              disabled={sending}
            >
              {sending ? (
                <LoaderCircle className="spin" size={16} />
              ) : (
                <Send size={16} />
              )}
              {sending ? "Sending..." : "Send notification"}
            </button>
          </form>

          <section className="admin-panel-card notification-history">
            <div className="admin-card-head">
              <div>
                <span className="admin-kicker">Backend records</span>
                <h3>Notification history</h3>
              </div>
              <Bell size={18} />
            </div>

            {history.length ? (
              history.slice(0, 30).map((item, index) => (
                <div className="notification-history-row" key={item.id || index}>
                  <div className="notification-history-icon">
                    <Bell size={15} />
                  </div>

                  <div>
                    <strong>
                      {value(item.title, "Notification")}
                    </strong>

                    <span>
                      {value(item.message)} ·{" "}
                      {formatDate(item.created_at || item.sent_at)}
                    </span>
                  </div>

                  <small>
                    {value(item.audience || item.type)}
                  </small>
                </div>
              ))
            ) : (
              <Empty
                title="No notification history"
                text="The backend returned no notification history records."
              />
            )}
          </section>
        </div>
      )}
    </div>
  );
}


/* =========================================================
   HACKATHONS
========================================================= */

function HackathonsPage() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch("/hackathons");
      setHackathons(
        unwrap(data, ["hackathons", "events", "data"])
      );
    } catch (e) {
      setError(e.message);
      setHackathons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (hackathon, status) => {
    if (!hackathon?.id) return;

    setBusy(`${status}-${hackathon.id}`);
    setError("");
    setSuccess("");

    try {
      await apiFetch(`/hackathons/${hackathon.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setSuccess(`Hackathon status changed to ${status}.`);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };

  const deleteHackathon = async (hackathon) => {
    if (!hackathon?.id) return;

    const title = hackathon.title || hackathon.name || "this hackathon";

    if (
      !window.confirm(
        `Delete "${title}"?\n\nThis permanently removes the hackathon and related data.`
      )
    ) {
      return;
    }

    setBusy(`delete-${hackathon.id}`);
    setError("");
    setSuccess("");

    try {
      await apiFetch(`/hackathons/${hackathon.id}`, {
        method: "DELETE",
      });

      setSuccess("Hackathon deleted successfully.");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };

  return (
    <div>
      <PageTitle
        eyebrow="Management / Events"
        title={
          <>
            Hackathon <span>registry.</span>
          </>
        }
        description="Manage hackathons using the existing CampusCode administrator APIs."
        action={
          <button className="admin-refresh" onClick={load}>
            <RefreshCw size={15} />
            Refresh
          </button>
        }
      />

      {error && <ErrorBox message={error} />}
      {success && (
        <div className="admin-success">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      {loading ? (
        <Loading />
      ) : hackathons.length ? (
        <div className="admin-event-grid">
          {hackathons.map((hackathon) => {
            const status = String(
              hackathon.publication_status ||
                hackathon.approval_status ||
                hackathon.status ||
                "UNKNOWN"
            ).toUpperCase();

            return (
              <article className="admin-event-card" key={hackathon.id}>
                <div className="admin-event-top">
                  <span className="event-index">
                    #{String(hackathon.id).slice(0, 8)}
                  </span>

                  <span className="status-badge">
                    {status.replaceAll("_", " ")}
                  </span>
                </div>

                <h3>
                  {value(
                    hackathon.title || hackathon.name,
                    "Untitled hackathon"
                  )}
                </h3>

                <p>
                  {value(
                    hackathon.description,
                    "No description provided."
                  )}
                </p>

                <div className="admin-event-meta">
                  <span>
                    TRACK
                    <b>{value(hackathon.track || hackathon.category)}</b>
                  </span>

                  <span>
                    ORGANIZER
                    <b>
                      {value(
                        hackathon.organizer_name ||
                          hackathon.organizer
                      )}
                    </b>
                  </span>

                  <span>
                    ROUND
                    <b>{value(hackathon.current_round, "0")}</b>
                  </span>

                  <span>
                    CREATED
                    <b>{formatDate(hackathon.created_at)}</b>
                  </span>
                </div>

                <div className="admin-event-actions">
                  <button
                    className="event-action neutral"
                    disabled={!!busy}
                    onClick={() =>
                      updateStatus(
                        hackathon,
                        status === "BLOCKED" ? "OPEN" : "BLOCKED"
                      )
                    }
                  >
                    {status === "BLOCKED" ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <Ban size={14} />
                    )}
                    {status === "BLOCKED" ? "Unblock" : "Block"}
                  </button>

                  <button
                    className="event-action danger"
                    disabled={!!busy}
                    onClick={() => deleteHackathon(hackathon)}
                  >
                    {busy === `delete-${hackathon.id}` ? (
                      <LoaderCircle className="spin" size={14} />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <Empty
          title="No hackathons found"
          text="The backend returned an empty hackathon collection."
        />
      )}
    </div>
  );
}


/* =========================================================
   APPROVALS
========================================================= */

function ApprovalsPage() {
  const [items, setItems] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch(
        "/hackathons/admin/pending-approvals"
      );

      setItems(
        unwrap(data, ["hackathons", "data"])
      );
    } catch (e) {
      setError(e.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const review = async (item, decision) => {
    if (!item?.id) return;

    setBusy(`${decision}-${item.id}`);
    setError("");
    setSuccess("");

    try {
      await apiFetch(`/hackathons/${item.id}/approval`, {
        method: "PATCH",
        body: JSON.stringify({
          decision,
          feedback: feedback[item.id]?.trim() || null,
        }),
      });

      setSuccess(
        `"${item.title || "Hackathon"}" was ${
          decision === "APPROVE" ? "approved" : "rejected"
        }.`
      );

      setItems((current) =>
        current.filter((item) => item.id !== item.id)
      );

      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };

  return (
    <div>
      <PageTitle
        eyebrow="Management / Approval Queue"
        title={
          <>
            Review <span>requests.</span>
          </>
        }
        description="Organizer-submitted hackathons waiting for an administrator decision."
        action={
          <button className="admin-refresh" onClick={load}>
            <RefreshCw size={15} />
            Refresh
          </button>
        }
      />

      {error && <ErrorBox message={error} />}
      {success && (
        <div className="admin-success">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      {loading ? (
        <Loading />
      ) : items.length ? (
        <div className="admin-approval-stack">
          {items.map((item) => (
            <article className="admin-approval-card" key={item.id}>
              <div className="approval-header">
                <div>
                  <span className="admin-kicker">PENDING REVIEW</span>
                  <h3>{value(item.title, "Untitled hackathon")}</h3>
                  <p>
                    {value(item.organizer_name, "Unknown organizer")} ·{" "}
                    {value(item.organizer_email)}
                  </p>
                </div>

                <span className="status-badge pending">PENDING</span>
              </div>

              <div className="approval-grid">
                <div>
                  <label>TRACK</label>
                  <strong>{value(item.track)}</strong>
                </div>

                <div>
                  <label>LOCATION</label>
                  <strong>{value(item.location)}</strong>
                </div>

                <div>
                  <label>EXPECTED DATE</label>
                  <strong>
                    {formatDate(
                      item.expected_date || item.start_date
                    )}
                  </strong>
                </div>

                <div>
                  <label>MAX TEAMS</label>
                  <strong>{value(item.max_teams)}</strong>
                </div>
              </div>

              <p className="approval-description">
                {value(
                  item.description,
                  "No description provided."
                )}
              </p>

              <textarea
                value={feedback[item.id] || ""}
                onChange={(e) =>
                  setFeedback((current) => ({
                    ...current,
                    [item.id]: e.target.value,
                  }))
                }
                placeholder="Optional feedback for the organizer..."
              />

              <div className="approval-actions">
                <button
                  className="approve"
                  disabled={!!busy}
                  onClick={() => review(item, "APPROVE")}
                >
                  {busy === `APPROVE-${item.id}` ? (
                    <LoaderCircle className="spin" size={15} />
                  ) : (
                    <CheckCircle2 size={15} />
                  )}
                  Approve
                </button>

                <button
                  className="reject"
                  disabled={!!busy}
                  onClick={() => review(item, "REJECT")}
                >
                  {busy === `REJECT-${item.id}` ? (
                    <LoaderCircle className="spin" size={15} />
                  ) : (
                    <X size={15} />
                  )}
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title="No pending approvals"
          text="The approval endpoint returned an empty queue."
        />
      )}
    </div>
  );
}


/* =========================================================
   USERS
========================================================= */

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch("/users/admin/all");
      setUsers(unwrap(data, ["users", "data"]));
    } catch (e) {
      setError(e.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleUser = async (user) => {
    if (!user?.id) return;

    if (String(user.role || "").toUpperCase() === "ADMIN") {
      setError("Administrator accounts cannot be blocked from this panel.");
      return;
    }

    const nextActive = user.is_active === false;

    setBusy(`status-${user.id}`);
    setError("");
    setSuccess("");

    try {
      await apiFetch(`/users/admin/${user.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: nextActive }),
      });

      setSuccess(
        `${user.name || "User"} has been ${nextActive ? "unblocked" : "blocked"}.`
      );
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };

  const deleteUser = async (user) => {
    if (!user?.id) return;

    if (String(user.role || "").toUpperCase() === "ADMIN") {
      setError("Administrator accounts cannot be deleted from this panel.");
      return;
    }

    const name = user.name || user.email || "this user";

    if (
      !window.confirm(
        `Delete "${name}"?\n\nThis permanently removes the user account. If the account is referenced by protected records, the backend will safely reject the deletion.`
      )
    ) {
      return;
    }

    setBusy(`delete-${user.id}`);
    setError("");
    setSuccess("");

    try {
      await apiFetch(`/users/admin/${user.id}`, {
        method: "DELETE",
      });

      setSuccess("User deleted successfully.");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };

  const filtered = useMemo(
    () =>
      users.filter((user) =>
        `${user.name || ""} ${user.email || ""} ${
          user.role || ""
        } ${user.campus_code_id || ""}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [users, query]
  );

  return (
    <div>
      <PageTitle
        eyebrow="Management / Users"
        title={
          <>
            User <span>directory.</span>
          </>
        }
        description="Manage live CampusCode accounts, access status and account removal."
        action={
          <button className="admin-refresh" onClick={load}>
            <RefreshCw size={15} />
            Refresh
          </button>
        }
      />

      {error && <ErrorBox message={error} />}
      {success && (
        <div className="admin-success">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      <div className="admin-user-control-note">
        <ShieldCheck size={15} />
        <span>
          Blocking changes <b>is_active</b> and immediately prevents that account
          from logging in. Deletion is permanent and is protected by the
          database relationships.
        </span>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, role or campus ID..."
          />
        </div>

        <span>
          {filtered.length} / {users.length} users
        </span>
      </div>

      {loading ? (
        <Loading />
      ) : filtered.length ? (
        <div className="admin-table-wrap">
          <table className="admin-table admin-user-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Campus ID</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((user) => {
                const isAdmin = String(user.role || "").toUpperCase() === "ADMIN";
                const blocked = user.is_active === false;

                return (
                  <tr key={user.id}>
                    <td>
                      <div className="table-user">
                        <div className="admin-avatar">
                          {(user.name || "U").charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <strong>{value(user.name)}</strong>
                          <span>{value(user.email)}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`role-badge ${String(
                          user.role || ""
                        ).toLowerCase()}`}
                      >
                        {value(user.role)}
                      </span>
                    </td>

                    <td>{value(user.campus_code_id)}</td>

                    <td>
                      <span
                        className={`status-badge ${blocked ? "blocked" : "active"}`}
                      >
                        {blocked ? "BLOCKED" : "ACTIVE"}
                      </span>
                    </td>

                    <td>{formatDate(user.created_at)}</td>

                    <td>
                      <div className="admin-user-actions">
                        <button
                          className={`user-action ${blocked ? "restore" : "block"}`}
                          disabled={!!busy || isAdmin}
                          title={isAdmin ? "Admin accounts are protected" : blocked ? "Unblock user" : "Block user"}
                          onClick={() => toggleUser(user)}
                        >
                          {busy === `status-${user.id}` ? (
                            <LoaderCircle className="spin" size={14} />
                          ) : blocked ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <Ban size={14} />
                          )}
                          {blocked ? "Unblock" : "Block"}
                        </button>

                        <button
                          className="user-action delete"
                          disabled={!!busy || isAdmin}
                          title={isAdmin ? "Admin accounts are protected" : "Delete user"}
                          onClick={() => deleteUser(user)}
                        >
                          {busy === `delete-${user.id}` ? (
                            <LoaderCircle className="spin" size={14} />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty
          title="No users found"
          text="No matching users were returned by the backend."
        />
      )}
    </div>
  );
}

/* =========================================================
   TEAMS
========================================================= */

function TeamsPage() {
  const [hackathons, setHackathons] = useState([]);
  const [selected, setSelected] = useState("");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHackathons = async () => {
    try {
      const data = await apiFetch("/hackathons");
      const list = unwrap(data, ["hackathons", "events", "data"]);
      setHackathons(list);

      if (list[0]?.id && !selected) {
        setSelected(String(list[0].id));
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHackathons();
  }, []);

  useEffect(() => {
    if (!selected) return;

    apiFetch(`/hackathons/${selected}/teams`)
      .then((data) =>
        setTeams(unwrap(data, ["teams", "data"]))
      )
      .catch((e) => {
        setError(e.message);
        setTeams([]);
      });
  }, [selected]);

  return (
    <div>
      <PageTitle
        eyebrow="Management / Collaboration"
        title={
          <>
            Team <span>management.</span>
          </>
        }
        description="Live teams loaded from the existing hackathon team API."
      />

      {error && <ErrorBox message={error} />}

      <div className="admin-select-wrap">
        <label>HACKATHON</label>

        <select
          className="admin-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {!hackathons.length && (
            <option value="">No hackathons</option>
          )}

          {hackathons.map((hackathon) => (
            <option key={hackathon.id} value={hackathon.id}>
              {hackathon.title || hackathon.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loading />
      ) : teams.length ? (
        <div className="admin-simple-list">
          {teams.map((team) => (
            <div className="admin-simple-row" key={team.id}>
              <div>
                <strong>
                  {value(team.name || team.team_name)}
                </strong>
                <span>
                  {value(team.status, "No status")}
                </span>
              </div>

              <b>
                {team.member_count ??
                  team.members?.length ??
                  "—"}{" "}
                members
              </b>
            </div>
          ))}
        </div>
      ) : (
        <Empty
          title="No teams found"
          text="The selected hackathon returned no team records."
        />
      )}
    </div>
  );
}


/* =========================================================
   SUBMISSIONS
========================================================= */

function SubmissionsPage() {
  const [hackathons, setHackathons] = useState([]);
  const [selected, setSelected] = useState("");
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/hackathons")
      .then((data) => {
        const list = unwrap(data, [
          "hackathons",
          "events",
          "data",
        ]);

        setHackathons(list);

        if (list[0]?.id) {
          setSelected(String(list[0].id));
        }
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!selected) return;

    apiFetch(`/hackathons/${selected}/teams`)
      .then((data) =>
        setTeams(unwrap(data, ["teams", "data"]))
      )
      .catch((e) => {
        setError(e.message);
        setTeams([]);
      });
  }, [selected]);

  return (
    <div>
      <PageTitle
        eyebrow="Management / Review"
        title={
          <>
            Submission <span>oversight.</span>
          </>
        }
        description="Live team/project records from the connected hackathon APIs."
      />

      {error && <ErrorBox message={error} />}

      <div className="admin-select-wrap">
        <label>HACKATHON</label>

        <select
          className="admin-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {hackathons.map((hackathon) => (
            <option key={hackathon.id} value={hackathon.id}>
              {hackathon.title || hackathon.name}
            </option>
          ))}
        </select>
      </div>

      {teams.length ? (
        <div className="admin-simple-list">
          {teams.map((team) => (
            <div className="admin-simple-row" key={team.id}>
              <div>
                <strong>
                  {value(team.name || team.team_name)}
                </strong>
                <span>
                  Project:{" "}
                  {value(
                    team.project_title ||
                      team.project?.title,
                    "No project"
                  )}
                </span>
              </div>

              <b>{value(team.status)}</b>
            </div>
          ))}
        </div>
      ) : (
        <Empty
          title="No submission records"
          text="No team/project records were returned for the selected hackathon."
        />
      )}
    </div>
  );
}


/* =========================================================
   EVALUATIONS
========================================================= */

function EvaluationsPage() {
  const [hackathons, setHackathons] = useState([]);
  const [selected, setSelected] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/hackathons")
      .then((data) => {
        const list = unwrap(data, [
          "hackathons",
          "events",
          "data",
        ]);

        setHackathons(list);

        if (list[0]?.id) {
          setSelected(String(list[0].id));
        }
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!selected) return;

    apiFetch(`/results/hackathon/${selected}`)
      .then((data) =>
        setResults(unwrap(data, ["results", "data"]))
      )
      .catch((e) => {
        setError(e.message);
        setResults([]);
      });
  }, [selected]);

  return (
    <div>
      <PageTitle
        eyebrow="Management / Evaluation"
        title={
          <>
            Evaluation <span>records.</span>
          </>
        }
        description="Read evaluation/result records returned by the backend. No scores are generated here."
      />

      {error && <ErrorBox message={error} />}

      <div className="admin-select-wrap">
        <label>HACKATHON</label>

        <select
          className="admin-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {hackathons.map((hackathon) => (
            <option key={hackathon.id} value={hackathon.id}>
              {hackathon.title || hackathon.name}
            </option>
          ))}
        </select>
      </div>

      {results.length ? (
        <div className="admin-results-list">
          {results.map((item, index) => (
            <div
              className="admin-result-row"
              key={
                item.submission_id ||
                item.team_id ||
                item.id ||
                index
              }
            >
              <div className="rank">
                #{item.rank ?? index + 1}
              </div>

              <div className="result-main">
                <strong>
                  {value(
                    item.team_name ||
                      item.team?.name,
                    "Team"
                  )}
                </strong>

                <span>
                  {value(
                    item.project_title ||
                      item.project?.title,
                    "Project"
                  )}
                </span>
              </div>

              <div className="result-score">
                {value(
                  item.score ??
                    item.overall_score
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty
          title="No evaluation records"
          text="No result/evaluation records were returned for the selected hackathon."
        />
      )}
    </div>
  );
}


/* =========================================================
   RESULTS / RESULT REQUESTS
========================================================= */

function ResultsPage() {
  const [requests, setRequests] = useState([]);
  const [results, setResults] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");

    const response = await Promise.allSettled([
      apiFetch("/admin/result-requests/pending"),
      apiFetch("/hackathons"),
    ]);

    if (response[0].status === "fulfilled") {
      setRequests(
        unwrap(response[0].value, [
          "requests",
          "resultRequests",
          "data",
        ])
      );
    }

    if (response[1].status === "fulfilled") {
      const list = unwrap(
        response[1].value,
        ["hackathons", "events", "data"]
      );

      setHackathons(list);

      if (list[0]?.id && !selected) {
        setSelected(String(list[0].id));
      }
    }

    const failed = response.find(
      (item) => item.status === "rejected"
    );

    if (failed) {
      setError(failed.reason?.message || "Unable to load result data.");
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!selected) return;

    apiFetch(`/results/hackathon/${selected}`)
      .then((data) =>
        setResults(unwrap(data, ["results", "data"]))
      )
      .catch((e) => {
        setError(e.message);
        setResults([]);
      });
  }, [selected]);

  const decide = async (request, action) => {
    if (!request?.id) return;

    setBusy(`${action}-${request.id}`);
    setError("");
    setSuccess("");

    try {
      await apiFetch(
        `/admin/result-requests/${request.id}/${action}`,
        {
          method: "POST",
        }
      );

      setSuccess(
        `Result request ${action === "approve" ? "approved" : "rejected"}.`
      );

      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };

  return (
    <div>
      <PageTitle
        eyebrow="Management / Results"
        title={
          <>
            Results <span>control.</span>
          </>
        }
        description="Review result-publication requests and read published result records."
        action={
          <button className="admin-refresh" onClick={load}>
            <RefreshCw size={15} />
            Refresh
          </button>
        }
      />

      {error && <ErrorBox message={error} />}
      {success && (
        <div className="admin-success">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      {loading ? (
        <Loading />
      ) : (
        <>
          <section className="admin-panel-card result-request-card">
            <div className="admin-card-head">
              <div>
                <span className="admin-kicker">
                  ADMIN RESULT REQUESTS
                </span>
                <h3>Pending publication requests</h3>
              </div>

              <BarChart3 size={18} />
            </div>

            {requests.length ? (
              requests.map((request) => (
                <div
                  className="result-request-row"
                  key={request.id}
                >
                  <div>
                    <strong>
                      {value(
                        request.hackathon_title ||
                          request.title ||
                          request.hackathon?.title,
                        "Hackathon result request"
                      )}
                    </strong>

                    <span>
                      {value(
                        request.organizer_name ||
                          request.organizer?.name,
                        "Organizer"
                      )}{" "}
                      · {formatDate(request.created_at)}
                    </span>
                  </div>

                  <div className="result-request-actions">
                    <button
                      className="approve"
                      disabled={!!busy}
                      onClick={() =>
                        decide(request, "approve")
                      }
                    >
                      {busy === `approve-${request.id}` ? (
                        <LoaderCircle className="spin" size={14} />
                      ) : (
                        <CheckCircle2 size={14} />
                      )}
                      Approve
                    </button>

                    <button
                      className="reject"
                      disabled={!!busy}
                      onClick={() =>
                        decide(request, "reject")
                      }
                    >
                      <X size={14} />
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <Empty
                title="No pending result requests"
                text="The admin result-request endpoint returned an empty queue."
              />
            )}
          </section>

          <section className="admin-panel-card published-results-card">
            <div className="admin-card-head">
              <div>
                <span className="admin-kicker">
                  PUBLISHED DATA
                </span>
                <h3>Hackathon results</h3>
              </div>
            </div>

            <div className="admin-select-wrap">
              <label>HACKATHON</label>

              <select
                className="admin-select"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                {!hackathons.length && (
                  <option value="">No hackathons</option>
                )}

                {hackathons.map((hackathon) => (
                  <option
                    key={hackathon.id}
                    value={hackathon.id}
                  >
                    {hackathon.title || hackathon.name}
                  </option>
                ))}
              </select>
            </div>

            {results.length ? (
              <div className="admin-results-list">
                {results.map((item, index) => (
                  <div
                    className="admin-result-row"
                    key={
                      item.submission_id ||
                      item.team_id ||
                      item.id ||
                      index
                    }
                  >
                    <div className="rank">
                      #{item.rank ?? index + 1}
                    </div>

                    <div className="result-main">
                      <strong>
                        {value(
                          item.team_name ||
                            item.team?.name,
                          "Team"
                        )}
                      </strong>

                      <span>
                        {value(
                          item.project_title ||
                            item.project?.title,
                          "Project"
                        )}
                      </span>
                    </div>

                    <div className="result-score">
                      {value(
                        item.score ??
                          item.overall_score
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                title="No published results"
                text="No result records were returned for the selected hackathon."
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}



/* =========================================================
   SYSTEM BLUEPRINT / ADMIN DIGITAL TWIN
   Former Super Admin blueprint visual + interactions, now
   integrated into the Admin panel.
========================================================= */

const ADMIN_BLUEPRINT = {
  campuscode: {
    id: "campuscode", name: "CAMPUSCODE", type: "PLATFORM", status: "ONLINE",
    description: "CampusCode production platform and service topology.",
    details: "The complete CampusCode platform connecting portals, backend services, PostgreSQL data, AI services and observability.",
    children: ["frontend", "backend", "database", "ai", "monitoring"],
  },
  frontend: {
    id: "frontend", name: "FRONTEND", type: "APPLICATION", status: "ONLINE",
    description: "React application layer serving all CampusCode portals.",
    details: "Client-side application containing the Student, Organizer and Admin experiences and their supporting pages.",
    children: ["student", "organizer", "admin"],
  },
  student: {
    id: "student", name: "STUDENT PAGE", type: "PORTAL", status: "ONLINE",
    description: "Student-facing portal for hackathons, teams, submissions, IdeaCheck and results.",
    details: "Student workspace for discovering hackathons, joining teams, submitting projects, using AI assistance and viewing competition outcomes.",
    children: ["student-overview", "student-hackathons", "student-team", "student-project", "student-rounds", "student-ideacheck", "student-rulebot", "student-leaderboard", "student-notifications"],
  },
  organizer: {
    id: "organizer", name: "ORGANIZER PAGE", type: "PORTAL", status: "ONLINE",
    description: "Organizer portal for hackathon management, round reviews, decisions and feedback.",
    details: "Organizer workspace for creating and managing hackathons, reviewing rounds, making decisions, publishing feedback and managing results.",
    children: ["organizer-dashboard", "organizer-hackathons", "organizer-r1", "organizer-r2", "organizer-r3", "organizer-results", "organizer-notifications"],
  },
  admin: {
    id: "admin", name: "ADMIN PAGE", type: "PORTAL", status: "ONLINE",
    description: "Admin control layer for platform governance and administration.",
    details: "Administrative control surface for users, hackathons, teams, submissions, evaluations, results, notifications and system operations.",
    children: ["admin-dashboard", "admin-users", "admin-hackathons", "admin-teams", "admin-submissions", "admin-results", "admin-notifications", "admin-system"],
  },
  backend: {
    id: "backend", name: "BACKEND API", type: "BACKEND", status: "ONLINE",
    description: "Node.js and Express API layer handling authentication, modules and platform workflows.",
    details: "The API layer receives authenticated requests, enforces role access, coordinates business logic and communicates with PostgreSQL and AI services.",
    children: ["backend-auth", "backend-users", "backend-hackathons", "backend-teams", "backend-rounds", "backend-results", "backend-ideacheck", "backend-rulebot", "backend-notifications"],
  },
  database: {
    id: "database", name: "NEON POSTGRESQL", type: "DATABASE", status: "ONLINE",
    description: "Primary PostgreSQL data layer for CampusCode.",
    details: "Persistent platform data including users, hackathons, participants, teams, submissions, round decisions, AI analysis and notifications.",
    children: ["db-users", "db-hackathons", "db-participants", "db-teams", "db-submissions", "db-results", "db-ai", "db-notifications"],
  },
  ai: {
    id: "ai", name: "GEMINI AI", type: "AI ENGINE", status: "ONLINE",
    description: "AI service used by supported CampusCode analysis workflows.",
    details: "AI layer supporting project analysis, recommendations and selected intelligence workflows while keeping organizer control over decisions.",
    children: ["ai-r1", "ai-r2", "ai-ideacheck", "ai-rulebot"],
  },
  monitoring: {
    id: "monitoring", name: "OBSERVABILITY", type: "MONITORING", status: "ONLINE",
    description: "Request, error, latency and platform activity telemetry.",
    details: "System observability layer used to inspect health, requests, errors, response time and platform activity.",
    children: ["monitoring-requests", "monitoring-errors", "monitoring-health", "monitoring-activity"],
  },
};

const ADMIN_BLUEPRINT_EXTRA = {
  "student-overview": ["OVERVIEW", "PAGE", "Student dashboard and current competition state.", "Student landing and summary surface."],
  "student-hackathons": ["HACKATHONS", "MODULE", "Discover, view and join available hackathons.", "Hackathon discovery and registration flow."],
  "student-team": ["MY TEAM", "MODULE", "Team creation, membership and team workspace.", "Student team management workflow."],
  "student-project": ["MY PROJECT", "MODULE", "Project details and submission workspace.", "Student project and submission preparation."],
  "student-rounds": ["R1 / R2 / R3", "MODULE", "Round status, submissions, decisions and feedback.", "Multi-round competition lifecycle."],
  "student-ideacheck": ["IDEACHECK AI", "AI MODULE", "Similarity and originality analysis workflow.", "AI-assisted idea comparison."],
  "student-rulebot": ["RULEBOT", "AI MODULE", "Hackathon rule assistance and student guidance.", "Rule-aware assistance module."],
  "student-leaderboard": ["LEADERBOARD", "MODULE", "Published competition ranking and results.", "Results visibility for students."],
  "student-notifications": ["NOTIFICATIONS", "MODULE", "Student-facing competition and platform notifications.", "Notification delivery surface."],
  "organizer-dashboard": ["DASHBOARD", "PAGE", "Organizer overview and active hackathon state.", "Organizer command surface."],
  "organizer-hackathons": ["HACKATHONS", "MODULE", "Create, configure and manage organizer hackathons.", "Hackathon management workflow."],
  "organizer-r1": ["ROUND 1", "REVIEW MODULE", "Review Round 1 submissions and AI analysis.", "Organizer Round 1 evaluation."],
  "organizer-r2": ["ROUND 2", "REVIEW MODULE", "Review Round 2 submissions and AI analysis.", "Organizer Round 2 evaluation."],
  "organizer-r3": ["ROUND 3", "MANUAL REVIEW", "Manual scoring, decisions and organizer feedback.", "Final manual competition review."],
  "organizer-results": ["RESULTS", "MODULE", "Result request, publication and leaderboard workflow.", "Organizer result workflow."],
  "organizer-notifications": ["NOTIFICATIONS", "MODULE", "Organizer-facing notifications and updates.", "Organizer notification surface."],
  "admin-dashboard": ["DASHBOARD", "PAGE", "Platform administration overview and controls.", "Admin dashboard."],
  "admin-users": ["USERS", "MODULE", "User administration, roles and account state.", "Administrative user management."],
  "admin-hackathons": ["HACKATHONS", "MODULE", "Hackathon administration and platform oversight.", "Administrative hackathon management."],
  "admin-teams": ["TEAMS", "MODULE", "Team administration and participant oversight.", "Administrative team management."],
  "admin-submissions": ["SUBMISSIONS", "MODULE", "Submission and evaluation oversight.", "Administrative submission management."],
  "admin-results": ["RESULT APPROVAL", "MODULE", "Review and approve/reject organizer result requests.", "Administrative result approval."],
  "admin-notifications": ["NOTIFICATIONS", "MODULE", "Platform notification controls.", "Administrative notification management."],
  "admin-system": ["SYSTEM BLUEPRINT", "SYSTEM", "Interactive architecture, health and system controls.", "Admin-integrated platform observability."],
  "backend-auth": ["AUTH", "API MODULE", "JWT authentication and role-based authorization.", "Authentication and authorization API."],
  "backend-users": ["USERS", "API MODULE", "User and role management APIs.", "User service endpoints."],
  "backend-hackathons": ["HACKATHONS", "API MODULE", "Hackathon creation, discovery, registration and administration APIs.", "Hackathon service endpoints."],
  "backend-teams": ["TEAMS", "API MODULE", "Team creation, membership and project relationships.", "Team service endpoints."],
  "backend-rounds": ["ROUNDS", "API MODULE", "Round 1, Round 2 and Round 3 lifecycle APIs.", "Competition round services."],
  "backend-results": ["RESULTS", "API MODULE", "Result requests, approval and leaderboard APIs.", "Result service endpoints."],
  "backend-ideacheck": ["IDEACHECK", "API MODULE", "Similarity and originality analysis API.", "IdeaCheck service."],
  "backend-rulebot": ["RULEBOT", "API MODULE", "Rule assistance API.", "RuleBot service."],
  "backend-notifications": ["NOTIFICATIONS", "API MODULE", "Notification creation and retrieval APIs.", "Notification service."],
  "db-users": ["USERS", "TABLE GROUP", "User identity, roles and account state.", "Core user records."],
  "db-hackathons": ["HACKATHONS", "TABLE GROUP", "Hackathon configuration and lifecycle data.", "Hackathon records."],
  "db-participants": ["PARTICIPANTS", "TABLE GROUP", "Hackathon participation relationships.", "Participant records."],
  "db-teams": ["TEAMS", "TABLE GROUP", "Team and membership data.", "Team records."],
  "db-submissions": ["SUBMISSIONS", "TABLE GROUP", "Project and round submission data.", "Submission records."],
  "db-results": ["RESULTS", "TABLE GROUP", "Result requests, decisions and leaderboard data.", "Result records."],
  "db-ai": ["AI ANALYSIS", "TABLE GROUP", "AI scores, feedback and analysis metadata.", "AI analysis records."],
  "db-notifications": ["NOTIFICATIONS", "TABLE GROUP", "Notification and delivery records.", "Notification records."],
  "ai-r1": ["R1 ANALYSIS", "AI FLOW", "AI-assisted Round 1 project analysis.", "Gemini analysis flow."],
  "ai-r2": ["R2 ANALYSIS", "AI FLOW", "AI-assisted Round 2 project analysis.", "Gemini analysis flow."],
  "ai-ideacheck": ["IDEACHECK", "AI FLOW", "Similarity analysis using project descriptions and scoring.", "IdeaCheck intelligence flow."],
  "ai-rulebot": ["RULEBOT", "AI FLOW", "Rule-aware student assistance.", "RuleBot assistance flow."],
  "monitoring-requests": ["REQUEST TELEMETRY", "TELEMETRY", "HTTP request method, endpoint, status, role and response time.", "Monitoring request logs."],
  "monitoring-errors": ["ERROR TELEMETRY", "TELEMETRY", "Captured API error messages and failed requests.", "Monitoring error logs."],
  "monitoring-health": ["HEALTH CHECKS", "TELEMETRY", "API, database and AI health state.", "Platform health monitoring."],
  "monitoring-activity": ["SYSTEM ACTIVITY", "TELEMETRY", "Recent platform and administrative activity.", "Activity monitoring."],
};

function adminBlueprintNode(id) {
  if (ADMIN_BLUEPRINT[id]) return ADMIN_BLUEPRINT[id];
  const extra = ADMIN_BLUEPRINT_EXTRA[id];
  if (extra) return { id, name: extra[0], type: extra[1], status: "ONLINE", description: extra[2], details: extra[3], children: [] };
  return { id, name: String(id || "UNKNOWN").replaceAll("-", " ").toUpperCase(), type: "SERVICE", status: "ONLINE", description: "CampusCode system component.", details: "System component.", children: [] };
}

function adminBlueprintIcon(type) {
  const t = String(type || "").toLowerCase();
  if (t.includes("database") || t.includes("table")) return Database;
  if (t.includes("ai")) return BrainCircuit;
  if (t.includes("backend") || t.includes("api")) return Server;
  if (t.includes("monitor") || t.includes("telemetry")) return Activity;
  if (t.includes("portal") || t.includes("page") || t.includes("application")) return Globe2;
  if (t.includes("system")) return Network;
  return Boxes;
}

function AdminBlueprintNode({ node, x, y, selected, onClick }) {
  const Icon = adminBlueprintIcon(node.type);
  return (
    <button type="button" className={`admin-blueprint-node ${selected ? "selected" : ""}`} style={{ left: `${x}%`, top: `${y}%` }} onClick={() => onClick(node)}>
      <span className="admin-blueprint-node-shadow" />
      <span className="admin-blueprint-node-face">
        <span className="admin-blueprint-node-top"><Icon size={16} /><i /></span>
        <strong>{node.name}</strong>
        <small>{node.type}</small>
      </span>
      <span className="admin-blueprint-node-side" />
      <span className="admin-blueprint-node-pulse" />
    </button>
  );
}

function AdminBlueprintScene({ rootId, selectedId, onNodeClick }) {
  const root = adminBlueprintNode(rootId);
  const children = (root.children || []).map(adminBlueprintNode);
  const positions = [[18,50],[37,22],[37,78],[62,22],[62,78],[82,50]];
  const visible = children.slice(0, 6);

  return (
    <div className="admin-blueprint-scene">
      <div className="admin-blueprint-stars" />
      <div className="admin-blueprint-grid" />
      <div className="admin-blueprint-vignette" />

      <div className="admin-blueprint-label"><span>INTERACTIVE DIGITAL TWIN / LIVE TOPOLOGY</span><strong>{root.name}</strong></div>
      <div className="admin-blueprint-code">CC / ARCH-01<br /><b>LIVE MAP</b></div>

      <div className="admin-blueprint-floor"><i /><i /><i /></div>

      <svg className="admin-blueprint-connections" viewBox="0 0 100 100" preserveAspectRatio="none">
        {visible.map((child, index) => {
          const [x, y] = positions[index];
          return <g key={child.id}>
            <line x1="50" y1="50" x2={x} y2={y} className="admin-blueprint-line" />
            <circle r=".8" className="admin-blueprint-packet">
              <animate attributeName="cx" values={`50;${x};50`} dur={`${2.7 + index * .3}s`} repeatCount="indefinite" />
              <animate attributeName="cy" values={`50;${y};50`} dur={`${2.7 + index * .3}s`} repeatCount="indefinite" />
            </circle>
          </g>;
        })}
      </svg>

      <div className="admin-blueprint-core">
        <div className="admin-blueprint-ring ring-a" />
        <div className="admin-blueprint-ring ring-b" />
        <div className="admin-blueprint-ring ring-c" />
        <div className="admin-blueprint-core-card">
          <div className="admin-blueprint-core-glow" />
          <Network size={25} />
          <strong>{root.name}</strong>
          <small>{root.type}</small>
          <span><i /> {root.status}</span>
        </div>
      </div>

      {visible.map((child, index) => {
        const [x, y] = positions[index];
        return <AdminBlueprintNode key={child.id} node={child} x={x} y={y} selected={selectedId === child.id} onClick={onNodeClick} />;
      })}

      <div className="admin-blueprint-legend"><span><i className="live" /> LIVE</span><span><i className="flow" /> REQUEST FLOW</span><span><i className="node" /> CLICK NODE</span></div>
      <div className="admin-blueprint-depth">NODE DEPTH: {children.length}</div>
      <div className="admin-blueprint-help">Click any module to open its architecture. Click a module with children to enter its blueprint.</div>
    </div>
  );
}

function BlueprintNodeModal({ node, details, onClose, onEnter }) {
  if (!node) return null;
  const Icon = adminBlueprintIcon(node.type);
  const detail = details || node;
  const children = (node.children || []).map(adminBlueprintNode);

  return (
    <div className="admin-blueprint-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section className="admin-blueprint-modal" role="dialog" aria-modal="true">
        <button type="button" className="admin-blueprint-modal-close" onClick={onClose}><X size={17} /></button>
        <div className="admin-blueprint-modal-head">
          <div className="admin-blueprint-modal-icon"><Icon size={24} /></div>
          <div><span>NODE INSPECTOR / ARCHITECTURE</span><h2>{node.name}</h2><small>{node.type} · {node.status}</small></div>
        </div>

        <div className="admin-blueprint-modal-status"><i /> SYSTEM {String(node.status).toUpperCase()}</div>

        <div className="admin-blueprint-modal-section"><span>DESCRIPTION</span><p>{node.description}</p><p className="detail">{node.details}</p></div>

        <div className="admin-blueprint-modal-grid">
          <div><span>NODE ID</span><strong>{node.id}</strong></div>
          <div><span>TYPE</span><strong>{node.type}</strong></div>
          <div><span>STATUS</span><strong>{node.status}</strong></div>
          <div><span>CHILD MODULES</span><strong>{children.length}</strong></div>
        </div>

        {children.length > 0 && <div className="admin-blueprint-modal-section"><span>CONNECTED MODULES</span><div className="admin-blueprint-child-list">{children.map(child => <button key={child.id} type="button" onClick={() => onEnter(child)}><b>{child.name}</b><small>{child.type}</small><ChevronRight size={14} /></button>)}</div></div>}

        <div className="admin-blueprint-modal-section"><span>LIVE BACKEND DETAILS</span><pre>{JSON.stringify(detail, null, 2)}</pre></div>

        <div className="admin-blueprint-modal-actions">
          {children.length > 0 && <button type="button" className="primary" onClick={() => onEnter(node)}><Network size={14} /> OPEN {node.name} BLUEPRINT</button>}
          <button type="button" className="secondary" onClick={onClose}>CLOSE</button>
        </div>
      </section>
    </div>
  );
}

function SystemBlueprintPage() {
  const [blueprint, setBlueprint] = useState(null);
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [maintenance, setMaintenance] = useState(null);
  const [rootId, setRootId] = useState("campuscode");
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeDetails, setNodeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [bp, h, s, m] = await Promise.all([
        apiFetch("/superadmin/blueprint"),
        apiFetch("/superadmin/health"),
        apiFetch("/superadmin/stats"),
        apiFetch("/superadmin/maintenance"),
      ]);
      setBlueprint(bp?.blueprint || bp?.system || bp?.data || bp || {});
      setHealth(h); setStats(s?.statistics || s?.stats || s?.data || s || {}); setMaintenance(m);
    } catch (e) { setError(e.message || "Unable to load CampusCode system blueprint."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const maintenanceEnabled = Boolean(maintenance?.enabled ?? maintenance?.maintenance_mode);
  const backendNodes = Array.isArray(blueprint?.nodes) ? blueprint.nodes : [];

  const openNode = async (node) => {
    setSelectedNode(node); setNodeDetails(null); setError("");
    try {
      const result = await apiFetch(`/superadmin/blueprint/${encodeURIComponent(node.id)}`);
      setNodeDetails(result?.node || result?.data || result);
    } catch { setNodeDetails(node); }
  };

  const enterBlueprint = (node) => {
    if (node.children?.length) {
      setRootId(node.id); setSelectedNode(null); setNodeDetails(null);
    } else {
      openNode(node);
    }
  };

  const goBack = () => {
    if (rootId === "campuscode") return;
    const parent = Object.values(ADMIN_BLUEPRINT).find(n => (n.children || []).includes(rootId));
    setRootId(parent?.id || "campuscode"); setSelectedNode(null); setNodeDetails(null);
  };

  const toggleMaintenance = async () => {
    if (busy) return;
    setBusy(true); setError(""); setSuccess("");
    try {
      const result = await apiFetch("/superadmin/maintenance", { method: "PATCH", body: JSON.stringify({ enabled: !maintenanceEnabled }) });
      setMaintenance(result); setSuccess(!maintenanceEnabled ? "Maintenance mode enabled." : "Maintenance mode disabled.");
    } catch (e) { setError(e.message || "Unable to update maintenance mode."); }
    finally { setBusy(false); }
  };

  const clearTelemetry = async () => {
    if (busy) return;
    setBusy(true); setError(""); setSuccess("");
    try { await apiFetch("/superadmin/telemetry", { method: "DELETE" }); setSuccess("System telemetry cleared."); }
    catch (e) { setError(e.message || "Unable to clear telemetry."); }
    finally { setBusy(false); }
  };

  const root = adminBlueprintNode(rootId);
  const statsObject = stats || {};
  const healthStatus = String(health?.status || health?.overall || "ONLINE").toUpperCase();
  const mergedDetails = nodeDetails || selectedNode;

  if (loading) return <Loading />;

  return (
    <div className="admin-system-blueprint-page">
      <PageTitle
        eyebrow="System / Architecture / Digital Twin"
        title={<>CampusCode <span>system blueprint.</span></>}
        description="The former Super Admin architecture view is integrated here as an Admin system map. Explore each layer, inspect nodes and open child blueprints without leaving the Admin panel."
        action={<button className="admin-refresh" onClick={load}><RefreshCw size={15} /> Refresh</button>}
      />

      {error && <ErrorBox message={error} />}
      {success && <div className="admin-success"><CheckCircle2 size={16} />{success}</div>}

      <div className="admin-blueprint-stats">
        <StatCard icon={Users} label="Users" number={statsObject?.total_users ?? statsObject?.users ?? "—"} detail="Platform users" />
        <StatCard icon={Trophy} label="Hackathons" number={statsObject?.total_hackathons ?? statsObject?.hackathons ?? "—"} detail="Registered events" tone="purple" />
        <StatCard icon={FileCheck2} label="Submissions" number={statsObject?.total_submissions ?? statsObject?.submissions ?? "—"} detail="Recorded submissions" tone="cyan" />
        <StatCard icon={Server} label="Backend" number={healthStatus} detail={value(health?.database, "Database unknown")} tone="amber" />
      </div>

      <section className="admin-blueprint-card">
        <div className="admin-blueprint-toolbar">
          <div><span className="admin-kicker">INTERACTIVE DIGITAL TWIN</span><h3>{root.name}</h3><p>{root.description}</p></div>
          <div className="admin-blueprint-toolbar-actions">
            {rootId !== "campuscode" && <button type="button" className="admin-blueprint-back" onClick={goBack}><ArrowLeft size={14} /> BACK</button>}
            <div className="admin-blueprint-breadcrumb"><button type="button" onClick={() => { setRootId("campuscode"); setSelectedNode(null); }}>CAMPUSCODE</button>{rootId !== "campuscode" && <><ChevronRight size={13} /><span>{root.name}</span></>}</div>
          </div>
        </div>

        <AdminBlueprintScene rootId={rootId} selectedId={selectedNode?.id} onNodeClick={openNode} />
      </section>

      <div className="admin-blueprint-bottom-grid">
        <section className="admin-panel-card">
          <div className="admin-card-head"><div><span className="admin-kicker">SYSTEM CONTROL</span><h3>Maintenance mode</h3></div><Settings size={18} /></div>
          <p className="approval-description">Use the existing backend maintenance control without leaving the Admin panel.</p>
          <div className="admin-list-row"><div className="admin-row-main"><strong>{maintenanceEnabled ? "MAINTENANCE ENABLED" : "SYSTEM LIVE"}</strong><span>{maintenanceEnabled ? "Platform is in maintenance mode." : "Normal operation is active."}</span></div><button className="event-action neutral" disabled={busy} onClick={toggleMaintenance}>{maintenanceEnabled ? "Disable" : "Enable"}</button></div>
          <button className="event-action danger" style={{ marginTop: 12, width: "100%" }} disabled={busy} onClick={clearTelemetry}><Trash2 size={14} /> Clear telemetry</button>
        </section>

        <section className="admin-panel-card">
          <div className="admin-card-head"><div><span className="admin-kicker">NODE INSPECTOR</span><h3>{value(mergedDetails?.name, "Select a system node")}</h3></div><Database size={18} /></div>
          {mergedDetails ? <div className="admin-blueprint-inspector"><div className="admin-blueprint-inspector-row"><span>TYPE</span><strong>{value(mergedDetails.type)}</strong></div><div className="admin-blueprint-inspector-row"><span>STATUS</span><strong>{value(mergedDetails.status)}</strong></div><div className="admin-blueprint-inspector-row"><span>DESCRIPTION</span><strong>{value(mergedDetails.description)}</strong></div><button className="event-action neutral" onClick={() => setSelectedNode(mergedDetails)}>OPEN FULL NODE INFORMATION</button></div> : <Empty title="No node selected" text="Click any blueprint node to inspect its complete architecture information." />}
        </section>
      </div>

      {backendNodes.length > 0 && <div className="admin-blueprint-backend-note"><Server size={15} /><span>Backend blueprint data is connected to the existing system endpoint. The visual topology above preserves the full interactive module hierarchy.</span></div>}

      <BlueprintNodeModal node={selectedNode} details={nodeDetails} onClose={() => { setSelectedNode(null); setNodeDetails(null); }} onEnter={enterBlueprint} />
    </div>
  );
}

/* =========================================================
   ACTIVITY
========================================================= */

function ActivityPage() {
  const [tab, setTab] = useState("requests");
  const [data, setData] = useState([]);
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const endpoints = {
    requests: "/monitoring/requests",
    errors: "/monitoring/errors",
    response: "/monitoring/response-time",
  };

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const [h, s, d] = await Promise.all([
        apiFetch("/monitoring/health"),
        apiFetch("/monitoring/stats"),
        apiFetch(endpoints[tab]),
      ]);

      setHealth(h);
      setStats(s);

      setData(
        unwrap(d, [
          "requests",
          "errors",
          "data",
          "logs",
          "items",
        ])
      );
    } catch (e) {
      setError(e.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [tab]);

  return (
    <div>
      <PageTitle
        eyebrow="System / Observatory"
        title={
          <>
            System <span>activity.</span>
          </>
        }
        description="Admin-only operational telemetry from the CampusCode monitoring APIs."
        action={
          <button className="admin-refresh" onClick={load}>
            <RefreshCw size={15} />
            Refresh
          </button>
        }
      />

      {error && <ErrorBox message={error} />}

      <div className="monitor-health-grid">
        <div className="monitor-health-card">
          <Server size={18} />
          <span>BACKEND</span>
          <strong>{value(health?.status)}</strong>
          <i
            className={
              health?.status === "healthy"
                ? "ok"
                : "warn"
            }
          />
        </div>

        <div className="monitor-health-card">
          <Database size={18} />
          <span>DATABASE</span>
          <strong>{value(health?.database)}</strong>
          <i
            className={
              health?.database === "connected"
                ? "ok"
                : "warn"
            }
          />
        </div>

        <div className="monitor-health-card">
          <Activity size={18} />
          <span>MONITORING</span>
          <strong>ADMIN ONLY</strong>
          <i className="ok" />
        </div>

        <div className="monitor-health-card">
          <Clock3 size={18} />
          <span>RESPONSE DATA</span>
          <strong>
            {value(
              stats?.average_response_time ??
                stats?.avg_response_time ??
                stats?.averageResponseTime
            )}
          </strong>
          <i className="ok" />
        </div>
      </div>

      <div className="monitor-tabs">
        {[
          ["requests", "Requests"],
          ["errors", "Errors"],
          ["response", "Response time"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={tab === key ? "active" : ""}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : data.length ? (
        <div className="monitor-log-list">
          {data.slice(0, 50).map((row, index) => (
            <div
              className="monitor-log-row"
              key={
                row.id ||
                row.request_id ||
                index
              }
            >
              <span className="log-method">
                {value(row.method)}
              </span>

              <span className="log-path">
                {value(
                  row.endpoint ||
                    row.path ||
                    row.route
                )}
              </span>

              <span>
                {value(
                  row.status_code ??
                    row.status
                )}
              </span>

              <span>
                {value(
                  row.response_time ??
                    row.latency
                )}
              </span>

              <span>
                {formatDate(
                  row.created_at ||
                    row.timestamp
                )}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <Empty
          title={`No ${tab} data`}
          text="The monitoring endpoint returned no records."
        />
      )}
    </div>
  );
}


/* =========================================================
   PROFILE
========================================================= */

function ProfilePage({ user }) {
  const [profile, setProfile] = useState(user || {});
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [skills, setSkills] = useState(
    Array.isArray(user?.skills)
      ? user.skills.join(", ")
      : user?.skills || ""
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    apiFetch("/users/me")
      .then((data) => {
        const profileData =
          data.profile ||
          data.user ||
          data.data ||
          data;

        setProfile(profileData);
        setName(profileData.name || "");
        setBio(profileData.bio || "");
        setSkills(
          Array.isArray(profileData.skills)
            ? profileData.skills.join(", ")
            : profileData.skills || ""
        );
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const data = await apiFetch("/users/me", {
        method: "PUT",
        body: JSON.stringify({
          name,
          bio,
          skills: skills
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });

      const profileData =
        data.profile ||
        data.user ||
        data.data ||
        data;

      setProfile(profileData);
      setSuccess("Profile saved to the backend.");

      localStorage.setItem(
        "user",
        JSON.stringify(profileData)
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <PageTitle
        eyebrow="Account / Administrator"
        title={
          <>
            Admin <span>profile.</span>
          </>
        }
        description="Your administrator profile loaded from the authenticated user endpoint."
      />

      {error && <ErrorBox message={error} />}

      {success && (
        <div className="admin-success">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      <div className="profile-layout">
        <div className="profile-identity">
          <div className="profile-big-avatar">
            {(name || "A").charAt(0).toUpperCase()}
          </div>

          <span className="role-badge admin">
            ADMIN
          </span>

          <h3>{value(name, "Administrator")}</h3>
          <p>{value(profile.email)}</p>

          <div className="profile-id">
            CAMPUS ID
            <br />
            <strong>
              {value(profile.campus_code_id)}
            </strong>
          </div>
        </div>

        <div className="profile-form">
          <div className="field-grid">
            <label>
              FULL NAME
              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />
            </label>

            <label>
              EMAIL
              <input
                value={profile.email || ""}
                disabled
              />
            </label>
          </div>

          <label>
            BIO
            <textarea
              value={bio}
              onChange={(e) =>
                setBio(e.target.value)
              }
              rows={5}
            />
          </label>

          <label>
            SKILLS
            <input
              value={skills}
              onChange={(e) =>
                setSkills(e.target.value)
              }
              placeholder="React, Node.js, PostgreSQL"
            />
          </label>

          <button
            className="profile-save"
            disabled={saving}
            onClick={save}
          >
            {saving && (
              <LoaderCircle
                className="spin"
                size={16}
              />
            )}

            {saving
              ? "Saving..."
              : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   ADMIN PANEL
========================================================= */

export default function AdminPanel({
  section = "dashboard",
  navigate,
  sidebarOpen,
  setSidebarOpen,
  user,
  onLogout,
}) {
  const go = (next) => {
    navigate?.(next);
    setSidebarOpen?.(false);
  };

  return (
    <div className="admin-app">
      <div className="admin-bg-grid" />
      <div className="admin-bg-glow one" />
      <div className="admin-bg-glow two" />

      {sidebarOpen && (
        <div
          className="admin-mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AdminSidebar
        section={section}
        navigate={go}
        open={sidebarOpen}
        user={user}
        onLogout={onLogout}
      />

      <div className="admin-main">
        <AdminTopbar
          onMenu={() => setSidebarOpen?.(true)}
          user={user}
          section={section}
        />

        <main className="admin-content">
          {section === "dashboard" && (
            <Dashboard onNavigate={go} />
          )}

          {section === "ai" && <AIAnalysisPage />}

          {section === "notifications" && (
            <NotificationsPage />
          )}

          {section === "hackathons" && (
            <HackathonsPage />
          )}

          {section === "approvals" && (
            <ApprovalsPage />
          )}

          {section === "users" && <UsersPage />}

          {section === "teams" && <TeamsPage />}

          {section === "submissions" && (
            <SubmissionsPage />
          )}

          {section === "evaluations" && (
            <EvaluationsPage />
          )}

          {section === "results" && <ResultsPage />}

          {section === "activity" && (
            <ActivityPage />
          )}

          {section === "system" && (
            <SystemBlueprintPage />
          )}

          {section === "profile" && (
            <ProfilePage user={user} />
          )}

          {![
            "dashboard",
            "ai",
            "notifications",
            "hackathons",
            "approvals",
            "users",
            "teams",
            "submissions",
            "evaluations",
            "results",
            "activity",
            "system",
            "profile",
          ].includes(section) && (
            <Dashboard onNavigate={go} />
          )}
        </main>
      </div>
    </div>
  );
}
