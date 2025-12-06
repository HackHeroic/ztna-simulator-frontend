// Dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Shield,
  LogOut,
  RefreshCcw,
  MapPin,
  AlertTriangle,
  Smartphone,
  Activity,
  Globe,
  Wifi,
  Server,
  Info,
  ShieldCheck,
  ShieldX,
  Cpu,
  Clock,
  Radio,
} from "lucide-react";

// ✅ Reuse your existing components
import VpnPanel from "./VpnPanel";
import PolicyCard from "./PolicyCard";

/* ================================================================
   🌐 BACKEND BASE URL
   - Point this to your Flask backend
================================================================ */
const API_BASE = "http://localhost:5002";

/* ================================================================
   🧠 SMALL UTILITIES
================================================================ */

/** Map a numeric risk score to a label + color */
function getRiskMeta(score) {
  if (score < 25) return { label: "Low", color: "text-green-600", badge: "green" };
  if (score < 50) return { label: "Moderate", color: "text-yellow-500", badge: "yellow" };
  if (score < 75) return { label: "High", color: "text-orange-500", badge: "red" };
  return { label: "Critical", color: "text-red-600", badge: "red" };
}

/** Simple Tailwind badge */
const Badge = ({ children, color = "gray" }) => {
  const map = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-100 text-blue-700",
    orange: "bg-orange-100 text-orange-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[color]}`}>
      {children}
    </span>
  );
};

/** Generic card wrapper */
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow p-6 ${className}`}>{children}</div>
);

/** Small stat block */
const Stat = ({ icon: Icon, label, value, color }) => (
  <div className="bg-gray-50 border rounded-xl p-4 text-center shadow-sm flex flex-col items-center justify-center">
    <Icon className={`mb-2 ${color}`} size={20} />
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-lg font-semibold break-all">{value}</p>
  </div>
);

/* ================================================================
   🔌 BACKEND API HELPERS (ALL ENDPOINTS)
================================================================ */

/** 1️⃣ Evaluate a specific resource using /api/policy/evaluate */
async function evaluateResource(resource) {
  try {
    // Get real IP + location first
    const client = await fetchLocation();

    const payload = {
      user: { email: "test@example.com" },
      resource,
      device: {
        os_type: navigator.userAgent.includes("Mac") ? "macOS" : "Windows",
        os_version: navigator.appVersion,
        rooted: false,
        encrypted: true,
      },
      location: client.location,
      client_ip: client.ip,     // 🔥 IMPORTANT
      context: { mfa_verified: true },
    };

    const res = await fetch(`${API_BASE}/api/policy/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return { status: res.status, ...data };
  } catch (err) {
    console.error("evaluateResource error:", err);
    return {
      status: 500,
      decision: "ERROR",
      reason: "Backend offline",
      risk_score: 0,
      risk_factors: ["Backend unreachable"],
    };
  }
}


/** 2️⃣ Risk data using database-prod policy */
async function fetchRiskData() {
  const data = await evaluateResource("database-prod");
  return {
    score: data.risk_score || 0,
    factors: data.risk_factors || [],
  };
}

/** 3️⃣ Anomaly detection using /api/policy/anomaly-detect */
async function fetchAnomalies() {
  try {
    const res = await fetch(`${API_BASE}/api/policy/anomaly-detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    });
    return await res.json();
  } catch (err) {
    console.error("fetchAnomalies error:", err);
    return {
      anomalies: 0,
      recent_anomalies: 0,
      risk_level: "low",
      details: [],
    };
  }
}

/** 4️⃣ Location + IP using /api/policy/location-detect */
/** 4️⃣ Location + IP using client IP → backend detection */
async function fetchLocation() {
  try {
    // Get real public IP
    const ipRes = await fetch("https://api64.ipify.org?format=json");
    const ipData = await ipRes.json();

    // Ask backend to detect location from client IP
    const res = await fetch(`${API_BASE}/api/policy/location-detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip: ipData.ip }),
    });

    const locData = await res.json();

    return {
      ip: ipData.ip,
      location: locData.location || { city: "Unknown", country: "Unknown", isp: "Unknown" }
    };
  } catch (err) {
    console.error("fetchLocation error:", err);
    return {
      ip: "127.0.0.1",
      location: { city: "Unknown", country: "Unknown", isp: "Unknown" },
    };
  }
}


/** 5️⃣ Session status (/api/policy/session-status) - JWT required */
async function fetchSessionStatus(token) {
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/api/policy/session-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return await res.json();
  } catch (err) {
    console.error("fetchSessionStatus error:", err);
    return { status: "offline" };
  }
}

/** 6️⃣ Raw policy configuration (/api/policy/policies) */
async function fetchPolicies() {
  try {
    const res = await fetch(`${API_BASE}/api/policy/policies`);
    return await res.json();
  } catch (err) {
    console.error("fetchPolicies error:", err);
    return null;
  }
}

/** 7️⃣ Health endpoint (/health) */
async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  } catch (err) {
    console.error("fetchHealth error:", err);
    return null;
  }
}

/* ================================================================
   🧱 MAIN DASHBOARD COMPONENT
================================================================ */

export default function Dashboard({ token, onLogout }) {
  /* -----------------------
     🧠 STATE VARIABLES
  ------------------------ */

  // VPN connection state (driven from VpnPanel)
  const [connected, setConnected] = useState(false);

  // Risk engine
  const [riskScore, setRiskScore] = useState(0);
  const [riskFactors, setRiskFactors] = useState([]);

  // Location + IP
  const [ip, setIp] = useState("--");
  const [location, setLocation] = useState({
    city: "",
    country: "",
    isp: "",
  });

  // Anomalies
  const [anomalyCount, setAnomalyCount] = useState(0);
  const [recentAnomalyCount, setRecentAnomalyCount] = useState(0);
  const [anomalyDetails, setAnomalyDetails] = useState([]);
  const [anomalyRiskLevel, setAnomalyRiskLevel] = useState("low");

  // Session
  const [sessionStatus, setSessionStatus] = useState(null);

  // Policies + health
  const [policies, setPolicies] = useState(null);
  const [health, setHealth] = useState(null);

  // Resource decision table: database-prod, admin-panel, file-server, vpn-gateway
  const resources = ["database-prod", "admin-panel", "file-server", "vpn-gateway"];
  const [resourceResults, setResourceResults] = useState({});

  // UI helpers
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================================================================
     🔁 MASTER REFRESH FUNCTION
     - This hits EVERY backend endpoint once
  ================================================================= */

  const refreshAll = async () => {
    try {
      setLoading(true);

      // 1️⃣ Risk engine
      const riskData = await fetchRiskData();
      setRiskScore(riskData.score);
      setRiskFactors(riskData.factors);

      // 2️⃣ Location
      const loc = await fetchLocation();
      setIp(loc.ip);
      setLocation({
        city: loc.location?.city || "Unknown",
        country: loc.location?.country || "Unknown",
        isp: loc.location?.isp || "Unknown",
      });

      // 3️⃣ Anomalies
      const an = await fetchAnomalies();
      setAnomalyCount(an.anomalies);
      setRecentAnomalyCount(an.recent_anomalies);
      setAnomalyDetails(an.details || []);
      setAnomalyRiskLevel(an.risk_level || "low");

      // 4️⃣ Session
      const sess = await fetchSessionStatus(token);
      setSessionStatus(sess);

      // 5️⃣ Policies
      const pol = await fetchPolicies();
      setPolicies(pol);

      // 6️⃣ Health
      const h = await fetchHealth();
      setHealth(h);

      // 7️⃣ Resource decisions
      const newResults = {};
      for (const r of resources) {
        newResults[r] = await evaluateResource(r);
      }
      setResourceResults(newResults);

      setLastRefreshed(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  /* ================================================================
     ⏱ AUTO-REFRESH (every 20 seconds) + initial load
  ================================================================= */

  useEffect(() => {
    // initial load
    refreshAll();

    // auto refresh interval
    const id = setInterval(() => {
      refreshAll();
    }, 20000); // 20s

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /* ================================================================
     🎨 DERIVED VIEW HELPERS
  ================================================================= */

  const riskMeta = getRiskMeta(riskScore);
  const riskBarClass =
    riskScore < 35 ? "bg-green-500" : riskScore < 70 ? "bg-yellow-400" : "bg-red-500";

  const anomalyBadgeColor =
    anomalyRiskLevel === "high" || anomalyRiskLevel === "critical"
      ? "red"
      : anomalyRiskLevel === "medium"
      ? "yellow"
      : "green";

  const sessionColor =
    sessionStatus?.status === "active"
      ? "green"
      : sessionStatus?.status === "no_session"
      ? "yellow"
      : "red";

  /* ================================================================
     🧩 RENDER
  ================================================================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-yellow-50 font-sans">

      {/* =======================
          HEADER
      ======================== */}
      <header className="bg-white py-6 px-6 md:px-10 rounded-b-[2rem] border-b-4 border-orange-500 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-inner">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">
              ZTNA Security Console
            </h1>
            <p className="text-xs md:text-sm text-gray-500">
              Zero Trust • Continuous Risk • Context-Aware Policies
            </p>
          </div>
        </div>

        {/* Right: Status + Actions */}
        <div className="flex flex-col items-end gap-2">
          {/* Last refresh */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock size={14} />
            <span>
              Last sync:{" "}
              <span className="font-medium text-gray-700">
                {lastRefreshed || "Syncing..."}
              </span>
            </span>
            {loading && (
              <span className="text-[10px] px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full animate-pulse">
                Refreshing
              </span>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={refreshAll}
              className="flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-xs md:text-sm shadow-sm hover:bg-orange-200"
            >
              <RefreshCcw size={14} />
              Refresh All
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full text-xs md:text-sm shadow hover:bg-orange-600"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* =======================
          MAIN LAYOUT
      ======================== */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col gap-10">

        {/* VPN CARD */}
        <Card>
          <VpnPanel connected={connected} setConnected={setConnected} />
        </Card>

        {/* TOP GRID: SECURITY OVERVIEW + RESOURCE TABLE */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* LEFT: SECURITY OVERVIEW */}
          <Card className="xl:col-span-2">
            {/* Title Row */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
              <div className="flex items-center gap-2">
                <Shield className="text-orange-500" />
                <div>
                  <h2 className="text-lg md:text-xl font-semibold">Security Overview</h2>
                  <p className="text-xs text-gray-500">
                    Live risk score, anomalies, location & session.
                  </p>
                </div>
              </div>

              <Badge color={riskMeta.badge}>
                Overall Risk: <span className="ml-1 font-semibold">{riskMeta.label}</span>
              </Badge>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <Stat
                icon={AlertTriangle}
                label="Risk Score"
                value={riskScore}
                color="text-red-500"
              />
              <Stat
                icon={MapPin}
                label="Location"
                value={`${location.city || "--"}, ${location.country || "--"}`}
                color="text-orange-500"
              />
              <Stat
                icon={Activity}
                label="Total Anomalies"
                value={anomalyCount}
                color="text-yellow-500"
              />
            </div>

            {/* Risk Meter + IP / ISP Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Risk Meter */}
              <div className="md:col-span-2">
                <p className="font-medium text-gray-700 mb-1">Risk Meter</p>
                <p className={`text-xs mb-2 ${riskMeta.color}`}>
                  Current status: <span className="font-semibold">{riskMeta.label}</span>
                </p>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-4 ${riskBarClass} transition-all`}
                    style={{ width: `${Math.min(riskScore, 100)}%` }}
                  />
                </div>
              </div>

              {/* IP + ISP */}
              <div className="flex flex-col gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-blue-500" />
                  <div>
                    <p className="font-semibold text-gray-700">External IP</p>
                    <p>{ip}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Wifi size={14} className="text-green-500" />
                  <div>
                    <p className="font-semibold text-gray-700">Network / ISP</p>
                    <p>{location.isp || "Unknown"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Factors */}
            <div className="mb-8">
              <p className="font-medium text-gray-700 mb-2">Risk Factors</p>
              {riskFactors.length === 0 ? (
                <p className="text-sm text-gray-400">No active risk factors detected.</p>
              ) : (
                <ul className="list-disc ml-5 text-sm space-y-1 text-gray-700">
                  {riskFactors.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Anomalies Section */}
            <div className="border-t pt-4 mt-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-red-500" size={18} />
                  <p className="font-semibold text-gray-800">User Anomaly Profile</p>
                </div>
                <Badge color={anomalyBadgeColor}>
                  {anomalyRiskLevel?.toUpperCase() || "LOW"}
                </Badge>
              </div>

              <p className="text-xs text-gray-500 mb-2">
                Total anomalies: <strong>{anomalyCount}</strong> • Last hour:{" "}
                <strong>{recentAnomalyCount}</strong>
              </p>

              {anomalyDetails.length === 0 ? (
                <p className="text-sm text-gray-400">No anomalies recorded in this session.</p>
              ) : (
                <ul className="list-disc ml-5 text-xs md:text-sm space-y-1 text-gray-700 max-h-40 overflow-auto pr-2">
                  {anomalyDetails.map((a, i) => (
                    <li key={i}>
                      <span className="font-semibold">{a.resource}</span> — Risk{" "}
                      <span className="font-semibold">{a.risk}</span> —{" "}
                      <span>{a.location?.country || "Unknown Country"}</span> •{" "}
                      <span className="text-gray-500">
                        {new Date(a.time).toLocaleString() || "Unknown time"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Session Status */}
            {sessionStatus && (
              <div className="mt-6 bg-gray-50 p-4 rounded-xl border">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold flex items-center gap-2 text-gray-800">
                    <Radio className="text-green-500" size={18} />
                    Session Status
                  </p>
                  <Badge color={sessionColor}>
                    {sessionStatus.status ? sessionStatus.status.toUpperCase() : "UNKNOWN"}
                  </Badge>
                </div>

                <div className="text-xs md:text-sm text-gray-700 space-y-1">
                  {sessionStatus.last_verified && (
                    <p>Last verified: {sessionStatus.last_verified}</p>
                  )}
                  {typeof sessionStatus.minutes_since_verify === "number" && (
                    <p>Minutes since last verify: {sessionStatus.minutes_since_verify}</p>
                  )}
                  {typeof sessionStatus.risk_score === "number" && (
                    <p>Last continuous risk score: {sessionStatus.risk_score}</p>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* RIGHT: RESOURCE DECISION TABLE */}
          <Card>
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Server className="text-teal-500" /> Resource Access Decisions
            </h2>
            <p className="text-xs text-gray-500 mb-3">
              Live view of decisions from <code>/api/policy/evaluate</code>.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs md:text-sm">
                <thead>
                  <tr className="text-[11px] uppercase text-gray-500">
                    <th className="text-left pb-2">Resource</th>
                    <th className="text-left pb-2">Decision</th>
                    <th className="text-left pb-2">Risk</th>
                    <th className="text-left pb-2">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((r) => {
                    const res = resourceResults[r] || {};
                    const meta = getRiskMeta(res.risk_score || 0);

                    return (
                      <tr key={r} className="border-t border-gray-100 align-top">
                        {/* Resource */}
                        <td className="py-2 font-medium text-gray-800 pr-2">
                          <span className="inline-flex items-center gap-1">
                            <Shield size={12} className="text-orange-500" />
                            {r}
                          </span>
                        </td>

                        {/* Decision */}
                        <td className="py-2 pr-2">
                          {res.decision === "ALLOW" ? (
                            <Badge color="green">
                              <ShieldCheck size={12} className="mr-1" />
                              ALLOW
                            </Badge>
                          ) : res.decision === "MFA_REQUIRED" ? (
                            <Badge color="yellow">MFA REQUIRED</Badge>
                          ) : res.decision === "DENY" ? (
                            <Badge color="red">
                              <ShieldX size={12} className="mr-1" />
                              DENY
                            </Badge>
                          ) : res.decision === "ERROR" ? (
                            <Badge color="red">ERROR</Badge>
                          ) : (
                            <Badge color="gray">PENDING</Badge>
                          )}
                        </td>

                        {/* Risk score */}
                        <td className="py-2 pr-2 whitespace-nowrap">
                          {res.risk_score !== undefined ? (
                            <span className={meta.color + " font-semibold"}>
                              {res.risk_score}
                            </span>
                          ) : (
                            "--"
                          )}
                        </td>

                        {/* Details / Risk factors */}
                        <td className="py-2 text-blue-600">
                          <details>
                            <summary className="cursor-pointer flex items-center gap-1">
                              <Info size={12} /> View
                            </summary>
                            <div className="ml-4 mt-1 text-gray-700 space-y-1">
                              <p className="text-xs">
                                <span className="font-semibold">Reason:</span>{" "}
                                {res.reason || "None"}
                              </p>
                              <p className="text-xs font-semibold mt-1">Risk Factors:</p>
                              <ul className="list-disc ml-4 text-[11px] space-y-0.5">
                                {res.risk_factors?.length ? (
                                  res.risk_factors.map((f, i) => <li key={i}>{f}</li>)
                                ) : (
                                  <li>None</li>
                                )}
                              </ul>
                            </div>
                          </details>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* BOTTOM GRID: POLICIES + HEALTH / DEVICE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Policy JSON Inspector + Device Fingerprint */}
          <Card>
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Smartphone className="text-green-500" /> Policy & Device Context
            </h2>

            {/* Device fingerprint */}
            <div className="mb-5">
              <p className="font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Cpu size={16} className="text-purple-500" /> Device Fingerprint
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-700">
                <div>
                  <p className="font-semibold text-gray-600 mb-1">OS</p>
                  <p>{navigator.userAgent.includes("Mac") ? "macOS" : "Windows / Other"}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600 mb-1">Browser</p>
                  <p>{navigator.userAgent}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600 mb-1">Security Flags</p>
                  <p>Encrypted: Yes</p>
                  <p>Rooted: No</p>
                </div>
              </div>
            </div>

            {/* Policy inspector */}
            <div className="border-t pt-4 mt-3">
              <p className="font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Info size={16} className="text-blue-500" /> Policy Configuration
              </p>

              {policies ? (
                <details className="text-xs text-gray-700">
                  <summary className="cursor-pointer flex items-center gap-1">
                    <span className="underline">View raw JSON</span>
                  </summary>
                  <pre className="bg-gray-900 text-gray-100 text-[11px] p-4 rounded-xl max-h-64 overflow-auto mt-3">
                    {JSON.stringify(policies, null, 2)}
                  </pre>
                </details>
              ) : (
                <p className="text-xs text-gray-400">Could not load policies from backend.</p>
              )}
            </div>
          </Card>

          {/* RIGHT: Health + Inline PolicyCard (Per-resource view) */}
          <div className="flex flex-col gap-6">
            {/* Health */}
            <Card>
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Server className="text-teal-500" /> Backend Health
              </h2>

              {health ? (
                <div className="text-xs md:text-sm space-y-2 text-gray-700">
                  <p>
                    Status:{" "}
                    <Badge color={health.status === "healthy" ? "green" : "red"}>
                      {health.status}
                    </Badge>
                  </p>
                  <p>Active sessions: {health.active_sessions}</p>
                  <p>Anomalies logged: {health.anomalies_count}</p>
                  <p>Timestamp: {health.timestamp}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400">
                  Cannot reach <code>/health</code> endpoint.
                </p>
              )}
            </Card>

            {/* Reuse your existing PolicyCard to show per-resource evaluation */}
            <Card>
              <PolicyCard title="Per-Resource Policy Evaluation" />
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
