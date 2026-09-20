import { useEffect, useMemo, useState } from "react";
import "./AdminPanel.css";
import CampusCodeLoader from "./components/ui/CampusCodeLoader";

import {
  Activity,
  AlertCircle,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Database,
  FileCheck2,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
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
    items: [["activity", "System Activity", Activity]],
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
    <div className="admin-loading campuscode-panel-loader">
      <CampusCodeLoader fullScreen={false} text="Loading" subtext="Syncing backend data" />
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
        description="Review platform accounts returned by the administrator users API."
        action={
          <button className="admin-refresh" onClick={load}>
            <RefreshCw size={15} />
            Refresh
          </button>
        }
      />

      {error && <ErrorBox message={error} />}

      <div className="admin-user-control-note">
        <Ban size={15} />
        <span>
          User block/delete controls are shown only when the backend exposes
          those administrator mutation endpoints. The currently supplied
          user API does not expose verified block/delete routes, so no fake
          destructive action is wired here.
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
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Campus ID</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="table-user">
                      <div className="admin-avatar">
                        {(user.name || "U")
                          .charAt(0)
                          .toUpperCase()}
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
                      className={`status-badge ${
                        user.is_active === false
                          ? "blocked"
                          : "active"
                      }`}
                    >
                      {user.is_active === false
                        ? "BLOCKED"
                        : "ACTIVE"}
                    </span>
                  </td>

                  <td>{formatDate(user.created_at)}</td>
                </tr>
              ))}
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
            "profile",
          ].includes(section) && (
            <Dashboard onNavigate={go} />
          )}
        </main>
      </div>
    </div>
  );
}
