/* ============================================================
   🌐 POLICY API — CLEAN & UPDATED (FINAL VERSION)
   ============================================================ */

const API_BASE = "http://localhost:5002";

/* ------------------------------------------------------------
   🔐 Extract email from JWT (safe decode)
------------------------------------------------------------- */
function getEmailFromToken(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.email || payload.user || null;
  } catch (err) {
    console.error("JWT decode failed:", err);
    return null;
  }
}

/* ------------------------------------------------------------
   📡 POST helper with token support
------------------------------------------------------------- */
async function post(url, body = {}, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (err) {
    console.error("POST request failed:", err);
    return { ok: false, status: 500, data: null };
  }
}

/* ------------------------------------------------------------
   1️⃣ PUBLIC IP + GEO LOCATION DETECTION
------------------------------------------------------------- */
export async function fetchLocation() {
  try {
    const ipResponse = await fetch("https://api64.ipify.org?format=json");
    const { ip } = await ipResponse.json();

    const locRes = await post(`${API_BASE}/api/policy/location-detect`, { ip });

    return {
      ip,
      location: locRes.data?.location || {},
    };
  } catch (err) {
    console.error("Location fetch failed:", err);
    return { ip: null, location: {} };
  }
}

/* ------------------------------------------------------------
   2️⃣ RESOURCE EVALUATION (Zero Trust Decision)
------------------------------------------------------------- */
export async function evaluateResource(resource, client) {
  const token = localStorage.getItem("token");
  const email = getEmailFromToken(token);

  const fallbackDevice = {
    os_type: "Android",
    os_version: "10",
    encrypted: false,
  };

  const payload = {
    user: { email },
    resource,
    device: client.device || fallbackDevice,
    location: client.location || {},
    client_ip: client.ip,
    context: { mfa_verified: true },
  };

  const res = await post(`${API_BASE}/api/policy/evaluate`, payload, token);
  return res.data;
}

/* ------------------------------------------------------------
   3️⃣ DATABASE PROD RISK CHECK
------------------------------------------------------------- */
export async function fetchRiskData(client) {
  return evaluateResource("database-prod", client);
}

/* ------------------------------------------------------------
   4️⃣ FETCH USER ANOMALIES
------------------------------------------------------------- */
export async function fetchAnomalies() {
  const token = localStorage.getItem("token");
  const email = getEmailFromToken(token);

  const res = await post(
    `${API_BASE}/api/policy/anomaly-detect`,
    { email },
    token
  );

  console.log("📥 fetchAnomalies() response:", res);
  return res.data;
}

/* ------------------------------------------------------------
   5️⃣ CONTINUOUS SESSION STATUS
------------------------------------------------------------- */
export async function fetchSessionStatus() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const res = await fetch(`${API_BASE}/api/policy/session-status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

/* ------------------------------------------------------------
   6️⃣ POLICY DEFINITIONS
------------------------------------------------------------- */
export async function fetchPolicies() {
  const res = await fetch(`${API_BASE}/api/policy/policies`);
  return res.json();
}

/* ------------------------------------------------------------
   7️⃣ HEALTH CHECK
------------------------------------------------------------- */
export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

/* ------------------------------------------------------------
   8️⃣ SIMULATE RISK (Attack Builder + Scenarios)
------------------------------------------------------------- */
export async function simulateRisk(payload) {
  const token = localStorage.getItem("token");
  const email = getEmailFromToken(token);

  const body = {
    user: { email },
    resource: payload.resource || "database-prod",
    ...payload,
  };

  const res = await post(
    `${API_BASE}/api/policy/test-risk`,
    body,
    token
  );

  return res.data;
}
