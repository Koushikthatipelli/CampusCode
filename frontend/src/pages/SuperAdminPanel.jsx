import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Database,
  ExternalLink,
  Globe2,
  LayoutDashboard,
  Menu,
  Network,
  RefreshCw,
  Server,
  Shield,
  Terminal,
  Users,
  X,
  Zap,
  BookOpen,
  FlaskConical,
  Cpu,
  Code2,
  LockKeyhole,
  Workflow,
  Map,
  Info,
  CalendarDays,
  CheckCircle,
  CircleDot,
  ChevronDown,
} from "lucide-react";
import "./SuperAdminPanel.css";
import CampusCodeRefresh from "../components/ui/CampusCodeRefresh";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const JOURNEY = [
  {
    id: "v1", version: "V1", title: "FOUNDATION", status: "COMPLETED", year: "EARLY BUILD",
    summary: "The initial CampusCode foundation and core platform structure.",
    details: ["CampusCode concept and product foundation", "Authentication and role-based access", "Student registration and core user flows", "Initial hackathon and database structure"],
    milestone: "Established the first working CampusCode platform."
  },
  {
    id: "v2", version: "V2", title: "HACKATHON PLATFORM", status: "COMPLETED", year: "PLATFORM BUILD",
    summary: "CampusCode evolved into a complete multi-role hackathon platform.",
    details: ["Student, Organizer and Admin portals", "Hackathon registration and management", "Team creation and membership workflows", "Project submission and round management"],
    milestone: "Connected the complete core hackathon lifecycle."
  },
  {
    id: "v3", version: "V3", title: "AI + INTELLIGENCE", status: "COMPLETED", year: "INTELLIGENCE BUILD",
    summary: "AI and intelligence features were introduced into the platform.",
    details: ["Gemini-powered project analysis", "IdeaCheck similarity engine", "RuleBot student assistance", "AI feedback and recommendation workflows"],
    milestone: "Introduced intelligence without removing organizer control."
  },
  {
    id: "v4", version: "V4", title: "ADVANCED COMPETITION FLOW", status: "COMPLETED", year: "COMPETITION BUILD",
    summary: "The platform matured into a structured multi-round competition system.",
    details: ["R1 → R2 → R3 workflow", "Organizer decisions and feedback", "Manual R3 review and scoring", "Result approval, leaderboard and notifications"],
    milestone: "Built a complete competition workflow from registration to results."
  },
  {
    id: "v5", version: "V5", title: "CURRENT CAMPUSCODE", status: "CURRENT", year: "CURRENT BUILD",
    summary: "The current platform combines hackathon management, AI and system observability.",
    details: ["Student, Organizer, Admin and Super Admin", "AI evaluation + IdeaCheck + RuleBot", "Team, rounds, results, notifications and leaderboard", "System Blueprint, monitoring and platform intelligence"],
    milestone: "CampusCode is now positioned as an AI-powered hackathon management platform."
  }
];

const ROADMAP = [
  { status: "CURRENT", title: "Super Admin observability", text: "Control center, architecture, health, activity and telemetry surfaces." },
  { status: "CURRENT", title: "Live telemetry integration", text: "Connect backend request, latency and error events to the monitoring layer." },
  { status: "NEXT", title: "Advanced analytics", text: "Deeper platform, hackathon, organizer and submission insights." },
  { status: "NEXT", title: "AI-powered insights", text: "Higher-level summaries and actionable intelligence from platform data." },
  { status: "PLANNED", title: "Automated anomaly detection", text: "Identify unusual traffic, failures and system behavior." },
  { status: "FUTURE", title: "Multi-campus expansion", text: "Extend CampusCode into a broader campus competition ecosystem." }
];

const TEST_CASES = [
  ["TC-001", "Student authentication", "Authentication", "PASS"],
  ["TC-002", "Organizer authentication", "Authentication", "PASS"],
  ["TC-003", "Role-based API protection", "Security", "PASS"],
  ["TC-004", "Hackathon registration", "Hackathon", "PASS"],
  ["TC-005", "Team creation / join", "Team", "PASS"],
  ["TC-006", "Team exit / delete controls", "Team", "PASS"],
  ["TC-007", "Round 1 submission", "Rounds", "PASS"],
  ["TC-008", "Round 1 AI analysis", "AI", "PASS"],
  ["TC-009", "Round 2 AI analysis", "AI", "PASS"],
  ["TC-010", "Round 3 manual review", "Rounds", "PASS"],
  ["TC-011", "Result approval flow", "Results", "PASS"],
  ["TC-012", "Leaderboard visibility", "Results", "PASS"],
  ["TC-013", "Organizer feedback visibility", "Security", "PASS"],
  ["TC-014", "IdeaCheck similarity engine", "AI", "PASS"],
  ["TC-015", "RuleBot response flow", "AI", "PASS"],
  ["TC-016", "Notifications flow", "Platform", "PASS"]
];

const AI_MODULES = [
  { title: "Gemini AI", type: "GENERATIVE AI", icon: BrainCircuit, items: ["R1 project analysis", "R2 project analysis", "Organizer-facing feedback", "AI recommendations"] },
  { title: "IdeaCheck", type: "OUR INTELLIGENCE ENGINE", icon: Cpu, items: ["12,000-project dataset", "Cosine similarity", "Keyword overlap", "Similarity threshold and idea scoring"] },
  { title: "RuleBot", type: "RULE-BASED ASSISTANCE", icon: BookOpen, items: ["Hackathon rule assistance", "Student guidance", "Structured rule responses", "Hackathon-specific context"] }
];

const ALGORITHM_STEPS = [
  ["01", "Normalize text", "Clean and standardize the submitted project description."],
  ["02", "Tokenize", "Break the description into meaningful tokens."],
  ["03", "Remove stop words", "Reduce low-value words before similarity calculation."],
  ["04", "Cosine similarity", "Compare the student idea with stored project representations."],
  ["05", "Keyword overlap", "Measure shared meaningful keywords with the closest project."],
  ["06", "Weighted score", "Final similarity = cosine × 70% + keyword overlap × 30%."],
  ["07", "Decision", "A similarity score of 70 or higher is treated as a similar project."]
];

const TECH_STACK = [
  ["Frontend", "React + Tailwind CSS + Vite", Globe2],
  ["Backend", "Node.js + Express.js", Server],
  ["Database", "PostgreSQL + Neon", Database],
  ["AI", "Google Gemini", BrainCircuit],
  ["Authentication", "JWT + role-based authorization", LockKeyhole],
  ["Monitoring", "Super Admin telemetry layer", Activity]
];

const BLUEPRINT = {
  campuscode: {
    id: "campuscode",
    name: "CAMPUSCODE",
    type: "PLATFORM",
    status: "ONLINE",
    description: "CampusCode production platform and service topology.",
    children: ["frontend", "backend", "database", "ai", "monitoring"],
  },
  frontend: {
    id: "frontend",
    name: "FRONTEND",
    type: "APPLICATION",
    status: "ONLINE",
    description: "React application layer serving all CampusCode portals.",
    children: ["student", "organizer", "admin", "superadmin"],
  },
  student: {
    id: "student",
    name: "STUDENT PAGE",
    type: "PORTAL",
    status: "ONLINE",
    description: "Student-facing portal for hackathons, teams, submissions, IdeaCheck and results.",
    children: [
      "student-overview",
      "student-hackathons",
      "student-team",
      "student-project",
      "student-rounds",
      "student-ideacheck",
      "student-rulebot",
      "student-leaderboard",
      "student-notifications",
    ],
  },
  organizer: {
    id: "organizer",
    name: "ORGANIZER PAGE",
    type: "PORTAL",
    status: "ONLINE",
    description: "Organizer portal for reviewing participants, rounds, AI analysis and decisions.",
    children: [
      "organizer-dashboard",
      "organizer-hackathons",
      "organizer-r1",
      "organizer-r2",
      "organizer-r3",
      "organizer-results",
      "organizer-notifications",
    ],
  },
  admin: {
    id: "admin",
    name: "ADMIN PAGE",
    type: "PORTAL",
    status: "ONLINE",
    description: "Admin control layer for platform governance and hackathon administration.",
    children: [
      "admin-dashboard",
      "admin-users",
      "admin-hackathons",
      "admin-teams",
      "admin-submissions",
      "admin-results",
      "admin-notifications",
    ],
  },
  superadmin: {
    id: "superadmin",
    name: "SUPER ADMIN PAGE",
    type: "CONTROL",
    status: "ONLINE",
    description: "Platform observability and system control center.",
    children: [
      "superadmin-overview",
      "superadmin-blueprint",
      "superadmin-live",
      "superadmin-errors",
      "superadmin-activity",
    ],
  },
  backend: {
    id: "backend",
    name: "BACKEND API",
    type: "BACKEND",
    status: "ONLINE",
    description: "Node.js and Express API layer handling authentication, modules and platform workflows.",
    children: [
      "backend-auth",
      "backend-users",
      "backend-hackathons",
      "backend-teams",
      "backend-r1",
      "backend-r2",
      "backend-r3",
      "backend-ideacheck",
      "backend-rulebot",
      "backend-notifications",
      "backend-leaderboard",
    ],
  },
  database: {
    id: "database",
    name: "NEON POSTGRESQL",
    type: "DATABASE",
    status: "ONLINE",
    description: "Primary PostgreSQL data layer for CampusCode.",
    children: [
      "db-users",
      "db-hackathons",
      "db-participants",
      "db-teams",
      "db-submissions",
      "db-ai",
      "db-notifications",
    ],
  },
  ai: {
    id: "ai",
    name: "GEMINI AI",
    type: "AI ENGINE",
    status: "ONLINE",
    description: "AI service used by supported CampusCode analysis workflows.",
    children: ["ai-r1", "ai-r2", "ai-ideacheck", "ai-rulebot"],
  },
  monitoring: {
    id: "monitoring",
    name: "OBSERVABILITY",
    type: "MONITORING",
    status: "ONLINE",
    description: "Request, error, latency and platform activity telemetry.",
    children: ["monitoring-requests", "monitoring-errors", "monitoring-health"],
  },
};

const EXTRA_NODES = {
  "student-overview": ["OVERVIEW", "PAGE", "ONLINE"],
  "student-hackathons": ["HACKATHONS", "MODULE", "ONLINE"],
  "student-team": ["MY TEAM", "MODULE", "ONLINE"],
  "student-project": ["MY PROJECT", "MODULE", "ONLINE"],
  "student-rounds": ["R1 / R2 / R3", "MODULE", "ONLINE"],
  "student-ideacheck": ["IDEACHECK AI", "AI MODULE", "ONLINE"],
  "student-rulebot": ["RULEBOT", "AI MODULE", "ONLINE"],
  "student-leaderboard": ["LEADERBOARD", "MODULE", "ONLINE"],
  "student-notifications": ["NOTIFICATIONS", "MODULE", "ONLINE"],

  "organizer-dashboard": ["DASHBOARD", "PAGE", "ONLINE"],
  "organizer-hackathons": ["HACKATHONS", "MODULE", "ONLINE"],
  "organizer-r1": ["ROUND 1", "REVIEW MODULE", "ONLINE"],
  "organizer-r2": ["ROUND 2", "REVIEW MODULE", "ONLINE"],
  "organizer-r3": ["ROUND 3", "MANUAL REVIEW", "ONLINE"],
  "organizer-results": ["RESULTS", "MODULE", "ONLINE"],
  "organizer-notifications": ["NOTIFICATIONS", "MODULE", "ONLINE"],

  "admin-dashboard": ["DASHBOARD", "PAGE", "ONLINE"],
  "admin-users": ["USERS", "MODULE", "ONLINE"],
  "admin-hackathons": ["HACKATHONS", "MODULE", "ONLINE"],
  "admin-teams": ["TEAMS", "MODULE", "ONLINE"],
  "admin-submissions": ["SUBMISSIONS", "MODULE", "ONLINE"],
  "admin-results": ["RESULT APPROVAL", "MODULE", "ONLINE"],
  "admin-notifications": ["NOTIFICATIONS", "MODULE", "ONLINE"],

  "superadmin-overview": ["COMMAND CENTER", "VIEW", "ONLINE"],
  "superadmin-blueprint": ["3D BLUEPRINT", "VIEW", "ONLINE"],
  "superadmin-live": ["LIVE REQUESTS", "VIEW", "ONLINE"],
  "superadmin-errors": ["ERROR MONITOR", "VIEW", "ONLINE"],
  "superadmin-activity": ["SYSTEM ACTIVITY", "VIEW", "ONLINE"],

  "backend-auth": ["AUTH", "API MODULE", "ONLINE"],
  "backend-users": ["USERS", "API MODULE", "ONLINE"],
  "backend-hackathons": ["HACKATHONS", "API MODULE", "ONLINE"],
  "backend-teams": ["TEAMS", "API MODULE", "ONLINE"],
  "backend-r1": ["ROUND 1", "API MODULE", "ONLINE"],
  "backend-r2": ["ROUND 2", "API MODULE", "ONLINE"],
  "backend-r3": ["ROUND 3", "API MODULE", "ONLINE"],
  "backend-ideacheck": ["IDEACHECK", "API MODULE", "ONLINE"],
  "backend-rulebot": ["RULEBOT", "API MODULE", "ONLINE"],
  "backend-notifications": ["NOTIFICATIONS", "API MODULE", "ONLINE"],
  "backend-leaderboard": ["LEADERBOARD", "API MODULE", "ONLINE"],

  "db-users": ["USERS", "TABLE GROUP", "ONLINE"],
  "db-hackathons": ["HACKATHONS", "TABLE GROUP", "ONLINE"],
  "db-participants": ["PARTICIPANTS", "TABLE GROUP", "ONLINE"],
  "db-teams": ["TEAMS", "TABLE GROUP", "ONLINE"],
  "db-submissions": ["SUBMISSIONS", "TABLE GROUP", "ONLINE"],
  "db-ai": ["AI ANALYSIS", "TABLE GROUP", "ONLINE"],
  "db-notifications": ["NOTIFICATIONS", "TABLE GROUP", "ONLINE"],

  "ai-r1": ["R1 ANALYSIS", "AI FLOW", "ONLINE"],
  "ai-r2": ["R2 ANALYSIS", "AI FLOW", "ONLINE"],
  "ai-ideacheck": ["IDEACHECK", "AI FLOW", "ONLINE"],
  "ai-rulebot": ["RULEBOT", "AI FLOW", "ONLINE"],

  "monitoring-requests": ["REQUEST TELEMETRY", "TELEMETRY", "ONLINE"],
  "monitoring-errors": ["ERROR TELEMETRY", "TELEMETRY", "ONLINE"],
  "monitoring-health": ["HEALTH CHECKS", "TELEMETRY", "ONLINE"],
};

function getToken() {
  return localStorage.getItem("token") || "";
}

function CCMark({ small = false }) {
  return (
    <span className={`sa-cc-mark ${small ? "small" : ""}`} aria-label="CampusCode logo">
      <span />
      <span />
      <span />
    </span>
  );
}

function Brand() {
  return (
    <div className="sa-brand">
      <CCMark />
      <div>
        <strong>CAMPUSCODE</strong>
        <span>HACKATHON ARENA</span>
      </div>
    </div>
  );
}

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(
      data?.message || data?.error || `Request failed: ${response.status}`
    );
  }

  return data;
}

function unwrap(data, keys = []) {
  if (!data) return null;
  for (const key of keys) {
    if (data?.[key] !== undefined) return data[key];
  }
  return data;
}

function formatTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString() : "0";
}

function normalizeNode(id) {
  if (BLUEPRINT[id]) return BLUEPRINT[id];

  const item = EXTRA_NODES[id];
  if (item) {
    return {
      id,
      name: item[0],
      type: item[1],
      status: item[2],
      description: `${item[0]} ${item[1].toLowerCase()} inside CampusCode.`,
      children: [],
    };
  }

  return {
    id,
    name: String(id || "UNKNOWN").replaceAll("-", " ").toUpperCase(),
    type: "SERVICE",
    status: "ONLINE",
    description: "CampusCode system component.",
    children: [],
  };
}

function iconForType(type) {
  const normalized = String(type || "").toLowerCase();

  if (normalized.includes("database") || normalized.includes("table")) {
    return Database;
  }
  if (normalized.includes("ai")) return BrainCircuit;
  if (normalized.includes("backend") || normalized.includes("api")) {
    return Server;
  }
  if (normalized.includes("monitor")) return Activity;
  if (normalized.includes("control")) return Shield;
  if (normalized.includes("portal") || normalized.includes("page")) {
    return Globe2;
  }
  return Boxes;
}

function statusClass(status) {
  const normalized = String(status || "").toLowerCase();

  if (
    normalized.includes("online") ||
    normalized.includes("healthy") ||
    normalized.includes("active") ||
    normalized.includes("connected") ||
    normalized.includes("running") ||
    normalized.includes("ok")
  ) {
    return "good";
  }

  if (
    normalized.includes("down") ||
    normalized.includes("failed") ||
    normalized.includes("error") ||
    normalized.includes("critical")
  ) {
    return "bad";
  }

  return "neutral";
}

function StatusDot({ status = "ONLINE" }) {
  return <i className={`sa-status-dot ${statusClass(status)}`} />;
}

function LoadingState() {
  return (
    <div className="sa-loading">
      <div className="sa-loading-core">
        <div className="sa-loading-orbit orbit-1" />
        <div className="sa-loading-orbit orbit-2" />
        <div className="sa-loading-cube">C</div>
        <strong>INITIALIZING CONTROL CENTER</strong>
        <span>CONNECTING TO CAMPUSCODE</span>
      </div>
    </div>
  );
}

function SystemNode({ node, x, y, selected, onClick }) {
  const Icon = iconForType(node.type);

  return (
    <button
      type="button"
      className={`sa-3d-node ${selected ? "selected" : ""}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={() => onClick(node)}
    >
      <span className="sa-node-shadow" />
      <span className="sa-node-face">
        <span className="sa-node-top">
          <Icon size={17} />
          <StatusDot status={node.status} />
        </span>
        <strong>{node.name}</strong>
        <small>{node.type}</small>
      </span>
      <span className="sa-node-side" />
      <span className="sa-node-pulse" />
    </button>
  );
}

function ArchitectureScene({ rootId, onNodeClick, selectedId }) {
  const root = normalizeNode(rootId);
  const children = root.children.map(normalizeNode);

  const positions = [
    [22, 50],
    [40, 25],
    [40, 75],
    [62, 25],
    [62, 75],
    [80, 50],
  ];

  const visibleChildren = children.slice(0, 6);

  return (
    <div className="sa-3d-scene">
      <div className="sa-scene-stars" />
      <div className="sa-scene-grid" />

      <div className="sa-scene-floor">
        <div />
        <div />
        <div />
      </div>

      <div className="sa-scene-title">
        <span>SYSTEM BLUEPRINT / LIVE TOPOLOGY</span>
        <strong>{root.name}</strong>
      </div>

      <div className="sa-scene-center">
        <div className="sa-hologram-ring ring-a" />
        <div className="sa-hologram-ring ring-b" />
        <div className="sa-hologram-ring ring-c" />
        <div className="sa-core-platform">
          <div className="sa-core-glow" />
          <Network size={27} />
          <strong>{root.name}</strong>
          <small>{root.type}</small>
          <span>
            <StatusDot status={root.status} />
            {root.status}
          </span>
        </div>
      </div>

      <svg className="sa-scene-connections" viewBox="0 0 100 100">
        {visibleChildren.map((child, index) => {
          const [x, y] = positions[index];
          const lineX = x;
          const lineY = y;
          return (
            <g key={child.id}>
              <line
                x1="50"
                y1="50"
                x2={lineX}
                y2={lineY}
                className="sa-connection"
              />
              <circle r="0.8" className="sa-packet">
                <animate
                  attributeName="cx"
                  values={`50;${lineX};50`}
                  dur={`${2.8 + index * 0.35}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="cy"
                  values={`50;${lineY};50`}
                  dur={`${2.8 + index * 0.35}s`}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          );
        })}
      </svg>

      {visibleChildren.map((child, index) => {
        const [x, y] = positions[index];
        return (
          <SystemNode
            key={child.id}
            node={child}
            x={x}
            y={y}
            selected={selectedId === child.id}
            onClick={onNodeClick}
          />
        );
      })}

      <div className="sa-scene-legend">
        <span><i className="legend-live" /> LIVE</span>
        <span><i className="legend-flow" /> REQUEST FLOW</span>
        <span><i className="legend-node" /> CLICK NODE</span>
      </div>

      <div className="sa-scene-corner top-left">CC / 3D-01</div>
      <div className="sa-scene-corner top-right">LIVE MAP</div>
      <div className="sa-scene-corner bottom-left">NODE DEPTH: {children.length}</div>
      <div className="sa-scene-corner bottom-right">CONTROL CENTER</div>
    </div>
  );
}

function Stat({ label, value, detail, icon: Icon }) {
  return (
    <div className="sa-stat">
      <div className="sa-stat-head">
        <span>{label}</span>
        <Icon size={16} />
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function RequestTable({ requests, onRequestClick }) {
  const rows = Array.isArray(requests) ? requests : [];

  return (
    <div className="sa-table-wrap">
      <div className="sa-table-head">
        <span>TIME</span>
        <span>METHOD</span>
        <span>ENDPOINT</span>
        <span>ROLE</span>
        <span>STATUS</span>
        <span>LATENCY</span>
      </div>

      {rows.length ? (
        rows.slice(0, 30).map((request, index) => {
          const method = request.method || request.http_method || "GET";
          const endpoint =
            request.endpoint || request.path || request.url || "/";
          const status =
            request.status ?? request.statusCode ?? request.response_status ?? 200;
          const latency =
            request.duration_ms ?? request.response_time ?? request.latency ?? "—";

          return (
            <button
              type="button"
              className="sa-table-row"
              key={request.id || request.request_id || `${endpoint}-${index}`}
              onClick={() => onRequestClick(request)}
            >
              <span>{formatTime(request.timestamp || request.created_at)}</span>
              <span className="mono method">{method}</span>
              <span className="mono endpoint">{endpoint}</span>
              <span>{request.role || request.user_role || "SYSTEM"}</span>
              <span>
                <b className={`sa-http ${Number(status) >= 500 ? "bad" : Number(status) >= 400 ? "warn" : "good"}`}>
                  {status}
                </b>
              </span>
              <span className="mono">{latency}{latency !== "—" ? " ms" : ""}</span>
            </button>
          );
        })
      ) : (
        <div className="sa-empty">
          <Terminal size={18} />
          <strong>WAITING FOR TELEMETRY</strong>
          <span>Live request events will appear here when monitoring is connected.</span>
        </div>
      )}
    </div>
  );
}

export default function SuperAdminPanel() {
  const [view, setView] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [overview, setOverview] = useState({});
  const [health, setHealth] = useState({});
  const [requests, setRequests] = useState([]);
  const [errors, setErrors] = useState([]);
  const [activity, setActivity] = useState([]);
  const [responseTime, setResponseTime] = useState({});
  const [maintenance, setMaintenance] = useState({});

  const [blueprintRoot, setBlueprintRoot] = useState("campuscode");
  const [selectedNode, setSelectedNode] = useState(null);
  const [requestDetails, setRequestDetails] = useState(null);
  const [journeyDetails, setJourneyDetails] = useState(null);
  const [testFilter, setTestFilter] = useState("ALL");

  const load = async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    setError("");

    const endpoints = [
      ["/superadmin/overview", setOverview],
      ["/superadmin/health", setHealth],
      ["/superadmin/requests", (data) => setRequests(unwrap(data, ["requests", "logs", "items", "data"]) || [])],
      ["/superadmin/errors", (data) => setErrors(unwrap(data, ["errors", "logs", "items", "data"]) || [])],
      ["/superadmin/activity", (data) => setActivity(unwrap(data, ["activity", "logs", "items", "data"]) || [])],
      ["/superadmin/response-time", setResponseTime],
      ["/superadmin/maintenance", setMaintenance],
    ];

    const results = await Promise.allSettled(
      endpoints.map(async ([path, setter]) => {
        const data = await apiFetch(path);
        setter(data);
      })
    );

    const failed = results
      .filter((item) => item.status === "rejected")
      .map((item) => item.reason?.message)
      .filter(Boolean);

    if (failed.length) {
      setError(failed.slice(0, 2).join(" · "));
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    load(false);

    const timer = setInterval(() => {
      load(true);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const overviewData = overview?.data || overview?.overview || overview || {};
  const usersObject =
    typeof overviewData.users === "object" && overviewData.users
      ? overviewData.users
      : {};

  const platformObject =
    typeof overviewData.platform === "object" && overviewData.platform
      ? overviewData.platform
      : {};

  const totalUsers =
    usersObject.total ??
    overviewData.total_users ??
    0;

  const students = usersObject.students ?? 0;
  const organizers = usersObject.organizers ?? 0;
  const admins = usersObject.admins ?? 0;

  const hackathons =
    platformObject.hackathons ??
    overviewData.total_hackathons ??
    overviewData.hackathons ??
    0;

  const teams =
    platformObject.teams ??
    overviewData.total_teams ??
    overviewData.teams ??
    0;

  const submissions =
    platformObject.submissions ??
    overviewData.total_submissions ??
    overviewData.submissions ??
    0;

  const telemetry =
    overviewData.telemetry || overview?.telemetry || {};

  const requestCount =
    telemetry.total_requests ??
    overviewData.total_requests ??
    requests.length ??
    0;

  const errorCount =
    telemetry.total_errors ??
    overviewData.total_errors ??
    errors.length ??
    0;

  const avgLatency =
    responseTime?.average_ms ??
    responseTime?.avg_ms ??
    telemetry.average_response_time ??
    0;

  const systemStatus =
    String(health?.status || health?.overall || "ONLINE").toUpperCase();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  const navGroups = [
    { label: "CONTROL CENTER", items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "health", label: "System Health", icon: Zap },
      { id: "live", label: "Runtime", icon: Activity },
    ]},
    { label: "PLATFORM", items: [
      { id: "platform", label: "Platform Overview", icon: Globe2 },
      { id: "flow", label: "Hackathon Flow", icon: Workflow },
      { id: "security", label: "Security", icon: LockKeyhole },
    ]},
    { label: "INTELLIGENCE", items: [
      { id: "ai", label: "AI Engine", icon: BrainCircuit },
      { id: "algorithms", label: "Algorithms", icon: Code2 },
      { id: "tests", label: "Test Center", icon: FlaskConical },
    ]},
    { label: "ARCHITECTURE", items: [
      { id: "blueprint", label: "3D Blueprint", icon: Network },
    ]},
    { label: "JOURNEY", items: [
      { id: "journey", label: "CampusCode Evolution", icon: Map },
      { id: "roadmap", label: "Roadmap", icon: CalendarDays },
    ]},
    { label: "MONITORING", items: [
      { id: "errors", label: "Error Monitor", icon: AlertTriangle },
      { id: "activity", label: "System Activity", icon: Terminal },
    ]},
    { label: "ABOUT", items: [
      { id: "about", label: "About CampusCode", icon: Info },
    ]},
  ];

  const openNode = (node) => {
    setSelectedNode(node);
  };

  const openRequest = async (request) => {
    setRequestDetails(request);

    const id = request?.id || request?.request_id;
    if (!id) return;

    try {
      const result = await apiFetch(
        `/superadmin/requests/${encodeURIComponent(id)}`
      );
      setRequestDetails(unwrap(result, ["request", "data"]) || result);
    } catch {
      // The current backend does not need request detail support yet.
    }
  };

  const goToBlueprint = () => setView("blueprint");

  if (loading) return <LoadingState />;

  return (
    <div className="sa-shell">
      <aside className={`sa-sidebar ${mobileOpen ? "open" : ""}`}>
        <Brand />
        <div className="sa-brand-subtitle">SUPER ADMIN CONTROL</div>

        <nav className="sa-nav sa-nav-grouped">
          {navGroups.map((group) => (
            <div className="sa-nav-group" key={group.label}>
              <div className="sa-sidebar-label">{group.label}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    type="button"
                    key={item.id}
                    className={`sa-nav-item ${view === item.id ? "active" : ""}`}
                    onClick={() => {
                      setView(item.id);
                      setMobileOpen(false);
                    }}
                  >
                    <Icon size={15} />
                    <span>{item.label}</span>
                    {view === item.id && <ChevronRight size={14} />}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sa-sidebar-label">SYSTEM STATUS</div>

        <div className="sa-side-status">
          <div><StatusDot status={systemStatus} /><span>API</span><b>{systemStatus}</b></div>
          <div><StatusDot status={health?.database || "ONLINE"} /><span>DATABASE</span><b>{String(health?.database || "ONLINE").toUpperCase()}</b></div>
          <div><StatusDot status={health?.gemini || "ONLINE"} /><span>GEMINI</span><b>{String(health?.gemini || "ONLINE").toUpperCase()}</b></div>
        </div>

        <div className="sa-sidebar-footer">
          <div className="sa-admin-chip">
            <Shield size={15} />
            <div>
              <strong>SUPER ADMIN</strong>
              <span>FULL PLATFORM ACCESS</span>
            </div>
          </div>

          <CampusCodeRefresh onRefresh={() => load(true)} />

          <button type="button" className="sa-logout" onClick={logout}>
            <ArrowLeft size={14} />
            SIGN OUT
          </button>
        </div>
      </aside>

      <button
        type="button"
        className="sa-mobile-menu"
        onClick={() => setMobileOpen((value) => !value)}
      >
        <Menu size={19} />
      </button>

      <main className="sa-main">
        <header className="sa-header">
          <div>
            <span>CAMPUSCODE / SUPER ADMIN</span>
            <h1>
              {view === "overview" && "CONTROL CENTER."}
              {view === "platform" && "PLATFORM OVERVIEW."}
              {view === "flow" && "HACKATHON LIFECYCLE."}
              {view === "security" && "SECURITY CENTER."}
              {view === "ai" && "AI ENGINE."}
              {view === "algorithms" && "ALGORITHMS."}
              {view === "tests" && "TEST CENTER."}
              {view === "blueprint" && "3D SYSTEM BLUEPRINT."}
              {view === "journey" && "CAMPUSCODE EVOLUTION."}
              {view === "roadmap" && "PRODUCT ROADMAP."}
              {view === "live" && "RUNTIME."}
              {view === "health" && "SYSTEM HEALTH."}
              {view === "errors" && "ERROR MONITOR."}
              {view === "activity" && "SYSTEM ACTIVITY."}
              {view === "about" && "ABOUT CAMPUSCODE."}
            </h1>
          </div>

          <div className="sa-header-actions">
            <div className={`sa-global-status ${statusClass(systemStatus)}`}>
              <StatusDot status={systemStatus} />
              {systemStatus === "ONLINE" || systemStatus === "HEALTHY"
                ? "ALL SYSTEMS OPERATIONAL"
                : "SYSTEM DEGRADED"}
            </div>

            <CampusCodeRefresh onRefresh={() => load(true)} />
          </div>
        </header>

        <div className="sa-content">
          {refreshing && (
            <div className="sa-sync-banner"><RefreshCw size={14} className="spin" /><span>SYNCING CAMPUSCODE SYSTEM DATA...</span></div>
          )}

          {error && (
            <div className="sa-alert">
              <AlertCircle size={15} />
              <span>{error}</span>
              <button type="button" onClick={() => setError("")}><X size={14} /></button>
            </div>
          )}

          {view === "overview" && (
            <>
              <section className="sa-hero">
                <div className="sa-hero-copy">
                  <span>PRODUCTION PLATFORM / DIGITAL TWIN</span>
                  <h2>
                    SEE WHAT
                    <br />
                    <em>CAMPUSCODE</em>
                    <br />
                    IS DOING.
                  </h2>
                  <p>
                    One control surface for platform state, module health,
                    request traffic, architecture and system activity.
                  </p>

                  <div className="sa-hero-actions">
                    <button type="button" onClick={goToBlueprint}>
                      OPEN 3D BLUEPRINT <Network size={14} />
                    </button>
                    <button type="button" className="ghost" onClick={() => setView("live")}>
                      WATCH LIVE TRAFFIC <Activity size={14} />
                    </button>
                  </div>
                </div>

                <div className="sa-hero-visual">
                  <div className="hero-orbit orbit-a" />
                  <div className="hero-orbit orbit-b" />
                  <div className="hero-orbit orbit-c" />
                  <div className="hero-core">
                    <Network size={30} />
                    <strong>CC</strong>
                    <span>LIVE</span>
                  </div>
                  <i className="hero-particle p1" />
                  <i className="hero-particle p2" />
                  <i className="hero-particle p3" />
                </div>
              </section>

              <section className="sa-stat-grid">
                <Stat label="TOTAL USERS" value={formatNumber(totalUsers)} detail={`${students} students · ${organizers} organizers · ${admins} admins`} icon={Users} />
                <Stat label="HACKATHONS" value={formatNumber(hackathons)} detail="Active platform events" icon={Globe2} />
                <Stat label="TEAMS" value={formatNumber(teams)} detail="Registered platform teams" icon={Boxes} />
                <Stat label="SUBMISSIONS" value={formatNumber(submissions)} detail="Round submissions tracked" icon={Terminal} />
              </section>

              <section className="sa-overview-grid">
                <div className="sa-panel">
                  <div className="sa-panel-head">
                    <div>
                      <span>SYSTEM TOPOLOGY</span>
                      <h3>Live architecture</h3>
                    </div>
                    <button type="button" onClick={goToBlueprint}>OPEN <ChevronRight size={13} /></button>
                  </div>
                  <ArchitectureScene
                    rootId="campuscode"
                    selectedId={selectedNode?.id}
                    onNodeClick={openNode}
                  />
                </div>

                <div className="sa-panel">
                  <div className="sa-panel-head">
                    <div>
                      <span>RUNTIME</span>
                      <h3>What is happening</h3>
                    </div>
                    <Activity size={17} />
                  </div>

                  <div className="sa-runtime">
                    <div><small>REQUESTS</small><strong>{formatNumber(requestCount)}</strong><span>captured</span></div>
                    <div><small>ERRORS</small><strong>{formatNumber(errorCount)}</strong><span>recorded</span></div>
                    <div><small>AVG LATENCY</small><strong>{avgLatency || 0}<small> ms</small></strong><span>response time</span></div>
                    <div><small>LIVE FEED</small><strong className="runtime-live"><i /> ON</strong><span>5 second sync</span></div>
                  </div>

                  <div className="sa-panel-note">
                    <CheckCircle2 size={15} />
                    <span>Telemetry layer is ready for live backend integration.</span>
                  </div>
                </div>
              </section>
            </>
          )}

          {view === "platform" && (
            <section className="sa-full-panel showcase-page">
              <div className="sa-page-title"><div><span>PLATFORM SURFACE</span><h2>Everything CampusCode manages</h2></div></div>
              <div className="sa-showcase-grid four">
                <div className="sa-showcase-card"><Users size={20}/><span>STUDENT</span><strong>Student Portal</strong><p>Registration, teams, projects, rounds, IdeaCheck, RuleBot, leaderboard and results.</p></div>
                <div className="sa-showcase-card"><Globe2 size={20}/><span>ORGANIZER</span><strong>Organizer Portal</strong><p>Hackathon setup, participant review, AI analysis, decisions and feedback.</p></div>
                <div className="sa-showcase-card"><Shield size={20}/><span>ADMIN</span><strong>Admin Portal</strong><p>Platform governance, users, hackathons, results approval and notifications.</p></div>
                <div className="sa-showcase-card"><Network size={20}/><span>SUPER ADMIN</span><strong>Control Center</strong><p>Architecture, health, telemetry, system activity, testing and product evolution.</p></div>
              </div>
              <div className="sa-section-divider"><span>CORE CAPABILITIES</span></div>
              <div className="sa-chip-grid">{["Authentication","Hackathon Management","Team Management","R1 / R2 / R3","AI Evaluation","IdeaCheck","RuleBot","Notifications","Leaderboard","Result Approval"].map((item)=><span key={item}><CheckCircle2 size={13}/>{item}</span>)}</div>
            </section>
          )}

          {view === "flow" && (
            <section className="sa-full-panel showcase-page">
              <div className="sa-page-title"><div><span>END-TO-END PLATFORM FLOW</span><h2>Hackathon lifecycle</h2></div></div>
              <div className="sa-flow-timeline">
                {["CREATE HACKATHON","STUDENT REGISTRATION","TEAM FORMATION","ROUND 1","AI EVALUATION","ORGANIZER DECISION","ROUND 2","AI EVALUATION","ORGANIZER DECISION","ROUND 3","MANUAL REVIEW","ADMIN RESULT APPROVAL","LEADERBOARD","WINNER"].map((step,index)=><div className="sa-flow-step" key={`${step}-${index}`}><div className="flow-index">{String(index+1).padStart(2,"0")}</div><strong>{step}</strong>{index < 13 && <ChevronDown size={15}/>}</div>)}
              </div>
              <div className="sa-note-card"><Workflow size={18}/><div><strong>R3 is fully manual.</strong><p>Organizer reviews the repository/demo, enters the score and feedback, and the Admin result-approval layer handles final publishing.</p></div></div>
            </section>
          )}

          {view === "security" && (
            <section className="sa-full-panel showcase-page">
              <div className="sa-page-title"><div><span>ACCESS CONTROL / API PROTECTION</span><h2>Security center</h2></div></div>
              <div className="sa-security-hero"><LockKeyhole size={24}/><div><strong>Role-based and ownership-aware access</strong><p>CampusCode protects platform operations through authenticated routes, role checks and resource ownership checks.</p></div></div>
              <div className="sa-showcase-grid four">
                {[["STUDENT","Register · Join · Submit · View own results"],["ORGANIZER","Manage own hackathons · Review submissions"],["ADMIN","Govern platform · Approve results"],["SUPER ADMIN","Monitor and control platform systems"]].map(([role,text])=><div className="sa-role-card" key={role}><LockKeyhole size={17}/><span>{role}</span><p>{text}</p></div>)}
              </div>
              <div className="sa-security-flow"><div>STUDENT TOKEN</div><ChevronRight/><div>ROLE CHECK</div><ChevronRight/><div>OWNERSHIP CHECK</div><ChevronRight/><div className="allow">AUTHORIZED ACTION</div><div className="deny">UNAUTHORIZED → 403</div></div>
            </section>
          )}

          {view === "ai" && (
            <section className="sa-full-panel showcase-page">
              <div className="sa-page-title"><div><span>AI + INTELLIGENCE LAYER</span><h2>What CampusCode uses AI for</h2></div></div>
              <div className="sa-showcase-grid three">{AI_MODULES.map(({title,type,icon:Icon,items})=><div className="sa-ai-card" key={title}><div className="sa-ai-icon"><Icon size={21}/></div><span>{type}</span><h3>{title}</h3><ul>{items.map(item=><li key={item}><CheckCircle2 size={13}/>{item}</li>)}</ul></div>)}</div>
              <div className="sa-ai-boundary"><Shield size={18}/><div><strong>AI does not replace the organizer decision.</strong><p>R1 and R2 AI analysis is advisory. R3 remains a completely manual organizer review flow.</p></div></div>
            </section>
          )}

          {view === "algorithms" && (
            <section className="sa-full-panel showcase-page">
              <div className="sa-page-title"><div><span>ENGINEERING / DETERMINISTIC INTELLIGENCE</span><h2>Algorithms</h2></div></div>
              <div className="sa-algorithm-hero"><Code2 size={24}/><div><strong>IdeaCheck similarity algorithm</strong><p>Student project descriptions are compared against the CampusCode IdeaCheck dataset to identify similar projects and generate a grounded similarity result.</p></div><div className="sa-formula">COSINE × 70% + KEYWORD OVERLAP × 30%</div></div>
              <div className="sa-algorithm-list">{ALGORITHM_STEPS.map(([n,title,text])=><div className="sa-algorithm-step" key={n}><b>{n}</b><div><strong>{title}</strong><p>{text}</p></div></div>)}</div>
              <div className="sa-threshold-row"><span>DATASET</span><strong>12,000 PROJECTS</strong><span>SIMILARITY THRESHOLD</span><strong>70 / 100</strong></div>
            </section>
          )}

          {view === "tests" && (
            <section className="sa-full-panel showcase-page">
              <div className="sa-page-title"><div><span>VALIDATION / QUALITY ASSURANCE</span><h2>Test center</h2></div><div className="sa-test-summary"><strong>{TEST_CASES.length}</strong><span>DOCUMENTED CASES</span></div></div>
              <div className="sa-test-tabs">{["ALL","Authentication","Security","Hackathon","Team","Rounds","AI","Results","Platform"].map(filter=><button key={filter} className={testFilter===filter?"active":""} onClick={()=>setTestFilter(filter)}>{filter}</button>)}</div>
              <div className="sa-test-list">{TEST_CASES.filter(([,,category])=>testFilter==="ALL"||category===testFilter).map(([id,name,category,status])=><div className="sa-test-row" key={id}><span className="test-id">{id}</span><div><strong>{name}</strong><small>{category}</small></div><b className="test-pass"><CheckCircle size={14}/> {status}</b></div>)}</div>
              <div className="sa-test-note"><FlaskConical size={17}/><span>These are the documented platform test cases currently tracked in the showcase. Connect them to an automated test runner later if you want real execution history rather than documentation.</span></div>
            </section>
          )}

          {view === "journey" && (
            <section className="sa-full-panel showcase-page">
              <div className="sa-page-title"><div><span>PRODUCT HISTORY / BUILD EVOLUTION</span><h2>CampusCode journey</h2></div></div>
              <div className="sa-journey-track">{JOURNEY.map((item,index)=><button type="button" className={`sa-version-card ${item.status === "CURRENT" ? "current" : ""}`} key={item.id} onClick={()=>setJourneyDetails(item)}><div className="version-top"><b>{item.version}</b><span>{item.status}</span></div><div className="version-dot"/><span>{item.year}</span><h3>{item.title}</h3><p>{item.summary}</p><div className="version-open">VIEW DETAILS <ChevronRight size={13}/></div>{index < JOURNEY.length-1 && <i className="version-connector"/>}</button>)}</div>
              <div className="sa-journey-note"><Map size={18}/><div><strong>From foundation to V5.</strong><p>Each version represents a major product-building milestone, not a separate product.</p></div></div>
            </section>
          )}

          {view === "roadmap" && (
            <section className="sa-full-panel showcase-page">
              <div className="sa-page-title"><div><span>WHAT COMES NEXT</span><h2>CampusCode roadmap</h2></div></div>
              <div className="sa-roadmap-list">{ROADMAP.map((item,index)=><div className={`sa-roadmap-row ${item.status.toLowerCase()}`} key={`${item.title}-${index}`}><div className="roadmap-status">{item.status}</div><div><strong>{item.title}</strong><p>{item.text}</p></div><span>{String(index+1).padStart(2,"0")}</span></div>)}</div>
            </section>
          )}

          {view === "about" && (
            <section className="sa-full-panel showcase-page">
              <div className="sa-about-hero"><div className="about-mark"><CCMark/></div><span>AI-POWERED HACKATHON MANAGEMENT PLATFORM</span><h2>CAMPUSCODE</h2><p>One platform for students, organizers and administrators to build, manage, evaluate and complete hackathons.</p></div>
              <div className="sa-section-divider"><span>TECH STACK</span></div>
              <div className="sa-tech-grid">{TECH_STACK.map(([name,value,Icon])=><div className="sa-tech-card" key={name}><Icon size={17}/><span>{name}</span><strong>{value}</strong></div>)}</div>
              <div className="sa-about-footer"><div><span>CURRENT VERSION</span><strong>V5</strong></div><div><span>PLATFORM</span><strong>CampusCode</strong></div><div><span>STATUS</span><strong><i/> ACTIVE DEVELOPMENT</strong></div></div>
            </section>
          )}

          {view === "blueprint" && (
            <section className="sa-full-panel">
              <div className="sa-blueprint-toolbar">
                <div>
                  <span>INTERACTIVE DIGITAL TWIN</span>
                  <h2>{normalizeNode(blueprintRoot).name}</h2>
                </div>
                <div className="sa-blueprint-toolbar-actions">
                  {blueprintRoot !== "campuscode" && (
                    <button
                      type="button"
                      className="sa-back-blueprint"
                      onClick={() => {
                        setBlueprintRoot("campuscode");
                        setSelectedNode(null);
                      }}
                    >
                      <ArrowLeft size={13} />
                      BACK TO MAIN BLUEPRINT
                    </button>
                  )}
                  <div className="sa-breadcrumb">
                    <button type="button" onClick={() => setBlueprintRoot("campuscode")}>CAMPUSCODE</button>
                    {blueprintRoot !== "campuscode" && (
                      <>
                        <ChevronRight size={13} />
                        <span>{normalizeNode(blueprintRoot).name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <ArchitectureScene
                rootId={blueprintRoot}
                selectedId={selectedNode?.id}
                onNodeClick={(node) => {
                  setSelectedNode(node);
                  if (node.children?.length) setBlueprintRoot(node.id);
                }}
              />

              <div className="sa-blueprint-help">
                <span><Network size={14} /> Click a node to enter its architecture.</span>
                <span><Zap size={14} /> Animated particles represent future request flow.</span>
                <span><Terminal size={14} /> Backend telemetry will populate real status.</span>
              </div>
            </section>
          )}

          {view === "live" && (
            <section className="sa-full-panel">
              <div className="sa-page-title">
                <div>
                  <span>NETWORK TRAFFIC / 5 SECOND REFRESH</span>
                  <h2>Live request stream</h2>
                </div>
                <div className="sa-live-pill"><i /> LIVE</div>
              </div>

              <div className="sa-live-metrics">
                <div><small>REQUESTS</small><strong>{formatNumber(requestCount)}</strong></div>
                <div><small>ERRORS</small><strong>{formatNumber(errorCount)}</strong></div>
                <div><small>AVG RESPONSE</small><strong>{avgLatency || 0} ms</strong></div>
                <div><small>STREAM</small><strong className="green">CONNECTED</strong></div>
              </div>

              <RequestTable requests={requests} onRequestClick={openRequest} />
            </section>
          )}

          {view === "health" && (
            <section className="sa-full-panel">
              <div className="sa-page-title">
                <div>
                  <span>SERVICE OBSERVABILITY</span>
                  <h2>Module health</h2>
                </div>
              </div>

              <div className="sa-health-grid">
                {[
                  ["Frontend", "APPLICATION", health?.frontend || "ONLINE", Globe2],
                  ["Backend API", "EXPRESS", health?.status || "ONLINE", Server],
                  ["PostgreSQL", "DATABASE", health?.database || "ONLINE", Database],
                  ["Gemini AI", "AI ENGINE", health?.gemini || "ONLINE", BrainCircuit],
                  ["IdeaCheck", "AI MODULE", "ONLINE", BrainCircuit],
                  ["RuleBot", "AI MODULE", "ONLINE", BrainCircuit],
                  ["Notifications", "MODULE", "ONLINE", Activity],
                  ["Monitoring", "OBSERVABILITY", "ONLINE", Activity],
                ].map(([name, type, status, Icon]) => (
                  <div className="sa-health-card" key={name}>
                    <div className="sa-health-icon"><Icon size={18} /></div>
                    <div>
                      <span>{type}</span>
                      <strong>{name}</strong>
                    </div>
                    <div className={`sa-health-status ${statusClass(status)}`}>
                      <StatusDot status={status} />
                      {String(status).toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {view === "errors" && (
            <section className="sa-full-panel">
              <div className="sa-page-title">
                <div>
                  <span>FAILURE TELEMETRY</span>
                  <h2>Error monitor</h2>
                </div>
                <div className="sa-error-count">{errors.length} EVENTS</div>
              </div>

              <div className="sa-error-list">
                {errors.length ? errors.slice(0, 50).map((item, index) => (
                  <div className="sa-error-row" key={item.id || item.error_id || index}>
                    <div className="error-mark"><AlertTriangle size={15} /></div>
                    <div className="error-main">
                      <strong>{item.message || item.error || "Unknown system error"}</strong>
                      <span>{item.endpoint || item.path || "SYSTEM"} · {formatTime(item.timestamp || item.created_at)}</span>
                    </div>
                    <b>{item.status || item.statusCode || "ERROR"}</b>
                  </div>
                )) : (
                  <div className="sa-empty large">
                    <CheckCircle2 size={22} />
                    <strong>NO RECORDED ERRORS</strong>
                    <span>The error monitor is clear.</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {view === "activity" && (
            <section className="sa-full-panel">
              <div className="sa-page-title">
                <div>
                  <span>PLATFORM EVENT STREAM</span>
                  <h2>System activity</h2>
                </div>
              </div>

              <div className="sa-activity-list">
                {activity.length ? activity.slice(0, 80).map((item, index) => (
                  <div className="sa-activity-row" key={item.id || index}>
                    <div className="activity-time">{formatTime(item.timestamp || item.created_at)}</div>
                    <div className="activity-line"><i /></div>
                    <div className="activity-copy">
                      <strong>{item.action || item.event || item.message || "Platform activity"}</strong>
                      <span>{item.actor || item.user_role || "SYSTEM"} · {item.module || item.source || "CampusCode"}</span>
                    </div>
                  </div>
                )) : (
                  <div className="sa-empty large">
                    <Terminal size={22} />
                    <strong>WAITING FOR ACTIVITY</strong>
                    <span>Platform events will appear here when telemetry is connected.</span>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      {selectedNode && (
        <div className="sa-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedNode(null);
        }}>
          <div className="sa-node-modal">
            <button type="button" className="sa-modal-close" onClick={() => setSelectedNode(null)}>
              <X size={18} />
            </button>

            <div className="sa-modal-visual">
              <div className="modal-orbit orbit-a" />
              <div className="modal-orbit orbit-b" />
              {React.createElement(iconForType(selectedNode.type), { size: 28 })}
            </div>

            <div className="sa-modal-kicker">BLUEPRINT NODE</div>
            <h2>{selectedNode.name}</h2>
            <p>{selectedNode.description}</p>

            <div className="sa-modal-status">
              <StatusDot status={selectedNode.status} />
              <strong>{selectedNode.status}</strong>
              <span>{selectedNode.type}</span>
            </div>

            <div className="sa-modal-grid">
              <div><small>NODE ID</small><strong>{selectedNode.id}</strong></div>
              <div><small>STATUS</small><strong>{selectedNode.status}</strong></div>
              <div><small>CHILD MODULES</small><strong>{selectedNode.children?.length || 0}</strong></div>
              <div><small>MONITORING</small><strong>ENABLED</strong></div>
            </div>

            <div className="sa-modal-flow">
              <span><CheckCircle2 size={14} /> STATUS TELEMETRY READY</span>
              <span><Activity size={14} /> LIVE TRAFFIC LINK READY</span>
            </div>

            {selectedNode.children?.length > 0 && (
              <button
                type="button"
                className="sa-enter-node"
                onClick={() => {
                  setBlueprintRoot(selectedNode.id);
                  setView("blueprint");
                  setSelectedNode(null);
                }}
              >
                ENTER {selectedNode.name} BLUEPRINT <ExternalLink size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {journeyDetails && (
        <div className="sa-modal-backdrop" onMouseDown={(event)=>{if(event.target===event.currentTarget)setJourneyDetails(null);}}>
          <div className="sa-journey-modal">
            <button type="button" className="sa-modal-close" onClick={()=>setJourneyDetails(null)}><X size={18}/></button>
            <div className="journey-modal-kicker"><span>{journeyDetails.version}</span><b>{journeyDetails.status}</b></div>
            <div className="journey-modal-title"><div className="journey-modal-number">{journeyDetails.version}</div><div><span>{journeyDetails.year}</span><h2>{journeyDetails.title}</h2></div></div>
            <p className="journey-modal-summary">{journeyDetails.summary}</p>
            <div className="journey-modal-section"><span>WHAT WE BUILT</span><div>{journeyDetails.details.map(item=><div key={item}><CheckCircle2 size={14}/><strong>{item}</strong></div>)}</div></div>
            <div className="journey-modal-milestone"><CircleDot size={16}/><div><span>MAJOR MILESTONE</span><strong>{journeyDetails.milestone}</strong></div></div>
            <button type="button" className="sa-back-journey" onClick={()=>setJourneyDetails(null)}><ArrowLeft size={14}/> BACK TO JOURNEY</button>
          </div>
        </div>
      )}

      {requestDetails && (
        <div className="sa-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setRequestDetails(null);
        }}>
          <div className="sa-request-modal">
            <button type="button" className="sa-modal-close" onClick={() => setRequestDetails(null)}>
              <X size={18} />
            </button>

            <div className="sa-modal-kicker">REQUEST TRACE</div>
            <h2>{requestDetails.method || "GET"} {requestDetails.endpoint || requestDetails.path || requestDetails.url || "/"}</h2>

            <div className="request-status-line">
              <span className={`sa-http ${Number(requestDetails.status || requestDetails.statusCode || 200) >= 500 ? "bad" : "good"}`}>
                {requestDetails.status || requestDetails.statusCode || 200}
              </span>
              <span>{requestDetails.role || requestDetails.user_role || "SYSTEM"}</span>
              <span>{requestDetails.duration_ms || requestDetails.latency || "—"} ms</span>
            </div>

            <div className="request-trace">
              <div className="trace-step"><i /> FRONTEND <small>REQUEST</small></div>
              <div className="trace-line" />
              <div className="trace-step"><i /> BACKEND API <small>ROUTER</small></div>
              <div className="trace-line" />
              <div className="trace-step"><i /> SERVICE <small>CONTROLLER</small></div>
              <div className="trace-line" />
              <div className="trace-step"><i /> DATABASE / AI <small>DEPENDENCY</small></div>
            </div>

            <div className="sa-modal-grid">
              <div><small>REQUEST ID</small><strong>{requestDetails.id || requestDetails.request_id || "PENDING"}</strong></div>
              <div><small>TIME</small><strong>{formatTime(requestDetails.timestamp || requestDetails.created_at)}</strong></div>
              <div><small>METHOD</small><strong>{requestDetails.method || "GET"}</strong></div>
              <div><small>LATENCY</small><strong>{requestDetails.duration_ms || requestDetails.latency || "—"} ms</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
