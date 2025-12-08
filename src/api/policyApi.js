const API_BASE = "http://localhost:5002";

/* -------------------------------------------
   HELPERS
-------------------------------------------- */

/** Extract email from JWT */
function getEmailFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.email || payload.user || null;
  } catch {
    return null;
  }
}

/** Generic POST helper */
async function post(url, body = {}, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

/* -------------------------------------------
   1️⃣  LOCATION + IP DETECTION
-------------------------------------------- */
export async function fetchLocation() {
  const ipRes = await fetch("https://api64.ipify.org?format=json");
  const { ip } = await ipRes.json();

  const locRes = await post(`${API_BASE}/api/policy/location-detect`, { ip });

  return {
    ip,
    location: locRes.data.location || {},
  };
}

/* -------------------------------------------
   2️⃣  RESOURCE EVALUATION
-------------------------------------------- */
export async function evaluateResource(resource, client) {
  const token = localStorage.getItem("token");
  const email = getEmailFromToken(token);

  const payload = {
    user: { email },
    resource,
    device: client.device || {},
    location: client.location || {},
    client_ip: client.ip,
    context: { mfa_verified: true },
  };

  const res = await post(`${API_BASE}/api/policy/evaluate`, payload, token);
  return res.data;
}

/* -------------------------------------------
   3️⃣  FETCH RISK FOR DATABASE-PROD
-------------------------------------------- */
export async function fetchRiskData(client) {
  return evaluateResource("database-prod", client);
}

/* -------------------------------------------
   4️⃣  FETCH ANOMALIES FOR CURRENT USER
-------------------------------------------- */
export async function fetchAnomalies() {
  const token = localStorage.getItem("token");
  const email = getEmailFromToken(token);

  const res = await post(`${API_BASE}/api/policy/anomaly-detect`, { email }, token);
  return res.data;
}

/* -------------------------------------------
   5️⃣  SESSION STATUS
-------------------------------------------- */
export async function fetchSessionStatus() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const response = await fetch(`${API_BASE}/api/policy/session-status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

/* -------------------------------------------
   6️⃣  POLICY DEFINITIONS
-------------------------------------------- */
export async function fetchPolicies() {
  return (await fetch(`${API_BASE}/api/policy/policies`)).json();
}

/* -------------------------------------------
   7️⃣  HEALTH CHECK
-------------------------------------------- */
export async function fetchHealth() {
  return (await fetch(`${API_BASE}/health`)).json();
}
