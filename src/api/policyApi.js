/* ============================================================
   🌐 POLICY API — FINAL + DEVICE NORMALIZATION + FULLY STABLE
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
      🌐 Normalize Browser Device → Backend Device Format
   ------------------------------------------------------------- */
   function normalizeDevice(rawDevice) {
     if (!rawDevice) return {};
   
     const ua = rawDevice.userAgent || "";
     const platform = rawDevice.platform || "";
   
     let os_type = "Unknown";
     let os_version = "0";
   
     if (/Windows NT/.test(ua)) {
       os_type = "Windows";
       os_version = ua.match(/Windows NT ([0-9.]+)/)?.[1] || "10.0";
     } else if (/Mac OS X/.test(ua)) {
       os_type = "macOS";
       os_version = ua.match(/Mac OS X ([0-9_]+)/)?.[1]?.replace(/_/g, ".") || "12.0";
     } else if (/Android/.test(ua)) {
       os_type = "Android";
       os_version = ua.match(/Android ([0-9.]+)/)?.[1] || "10";
     } else if (/iPhone|iPad|iPod/.test(ua)) {
       os_type = "iOS";
       os_version = ua.match(/OS ([0-9_]+)/)?.[1]?.replace(/_/g, ".") || "14.0";
     } else if (/Linux/.test(platform)) {
       os_type = "Linux";
       os_version = "5.0";
     }
   
     // Browser-safe approximations
     const encrypted = window.isSecureContext;
   
     return {
       os_type,
       os_version,
       encrypted,
       rooted: false,
       mdm_enrolled: false,
   
       // Debug / metadata
       user_agent: rawDevice.userAgent,
       screen: rawDevice.screen,
       timezone: rawDevice.timezone,
       language: rawDevice.language,
       platform: rawDevice.platform,
     };
   }
   
   /* ------------------------------------------------------------
      📡 POST helper
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
      1️⃣ PUBLIC IP + GEO LOCATION + DEVICE NORMALIZATION
   ------------------------------------------------------------- */
   export async function fetchLocation() {
     try {
       // Get public IP
       const ipResponse = await fetch("https://api64.ipify.org?format=json");
       const { ip } = await ipResponse.json();
   
       // Get geo-location from backend
       const locRes = await post(`${API_BASE}/api/policy/location-detect`, { ip });
   
       // Browser device raw object
       const browserDevice = {
         userAgent: navigator.userAgent,
         platform: navigator.platform,
         language: navigator.language,
         screen: { width: window.screen.width, height: window.screen.height },
         timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
       };
   
       return {
         ip,
         location: locRes.data?.location || {},
         device: normalizeDevice(browserDevice),
       };
     } catch (err) {
       console.error("Location + Device fetch failed:", err);
       return { ip: null, location: {}, device: {} };
     }
   }
   
   /* ------------------------------------------------------------
      2️⃣ RESOURCE EVALUATION (Zero Trust)
   ------------------------------------------------------------- */
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
     return res.data || {};
   }
   
   /* ------------------------------------------------------------
      3️⃣ MAIN RISK CHECK (DB-PROD)
   ------------------------------------------------------------- */
   export async function fetchRiskData(client) {
     return evaluateResource("database-prod", client);
   }
   
   /* ------------------------------------------------------------
      4️⃣ USER ANOMALIES
   ------------------------------------------------------------- */
   export async function fetchAnomalies() {
     const token = localStorage.getItem("token");
     const email = getEmailFromToken(token);
   
     const res = await post(
       `${API_BASE}/api/policy/anomaly-detect`,
       { email },
       token
     );
   
     return res.data || {};
   }
   
   /* ------------------------------------------------------------
      5️⃣ SESSION STATUS (Continuous Auth)
   ------------------------------------------------------------- */
   export async function fetchSessionStatus() {
     const token = localStorage.getItem("token");
     if (!token) return null;
   
     try {
       const res = await fetch(`${API_BASE}/api/policy/session-status`, {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
         },
       });
   
       return res.json();
     } catch (err) {
       console.error("session-status failed:", err);
       return null;
     }
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
      8️⃣ SIMULATE RISK (Attack Simulator)
   ------------------------------------------------------------- */
   export async function simulateRisk(payload) {
     const token = localStorage.getItem("token");
     const email = getEmailFromToken(token);
   
     const body = {
       user: { email },
       resource: payload.resource || "database-prod",
       device: payload.device ? normalizeDevice(payload.device) : undefined,
       ...payload,
     };
   
     const res = await post(
       `${API_BASE}/api/policy/test-risk`,
       body,
       token
     );
   
     return res.data || {};
   }
   