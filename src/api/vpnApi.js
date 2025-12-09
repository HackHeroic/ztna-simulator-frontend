/* ============================================================
   🌐 VPN GATEWAY API — Frontend Integration
   ============================================================ */

const VPN_BASE = "http://localhost:5001";

/* ------------------------------------------------------------
   🔐 Get user email from JWT token
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
   1️⃣ CHECK EXISTING CONNECTION
------------------------------------------------------------- */
export async function checkExistingConnection() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const userEmail = getEmailFromToken(token);
  if (!userEmail) return null;

  try {
    const res = await fetch(`${VPN_BASE}/api/vpn/check-connection?user_email=${encodeURIComponent(userEmail)}`);
    const data = await res.json();

    if (data.connected) {
      return {
        connected: true,
        connection_id: data.connection_id,
        vpn_ip: data.vpn_ip,
        real_client_ip: data.real_client_ip,
        location: data.location,
        connected_at: data.connected_at,
        connection_mode: data.connection_mode || "unknown",
        last_continuous_auth: data.last_continuous_auth,
        last_risk_score: data.last_risk_score || 0,
      };
    }
    return { connected: false };
  } catch (err) {
    console.error("Error checking existing connection:", err);
    return null;
  }
}

/* ------------------------------------------------------------
   2️⃣ CONNECT VPN
------------------------------------------------------------- */
export async function connectVpn(device, location, clientIp) {
  const token = localStorage.getItem("token");
  if (!token) {
    return { error: "No authentication token found" };
  }

  try {
    const res = await fetch(`${VPN_BASE}/api/vpn/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vpn_token: token,
        device: device || {},
        location: location || {},
        client_ip: clientIp,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Handle existing connection (409 Conflict)
      if (res.status === 409 && data.existing_connection) {
        return {
          connected: true,
          connection_id: data.existing_connection.connection_id,
          vpn_ip: data.existing_connection.vpn_ip,
          real_client_ip: data.existing_connection.real_client_ip,
          location: data.existing_connection.location,
          connection_mode: data.existing_connection.connection_mode || "unknown",
          existing: true,
          message: data.message || "Using existing connection",
        };
      }
      // Handle policy denial (403)
      if (res.status === 403) {
        return {
          error: data.error || "Access denied by policy",
          reason: data.reason,
          risk_score: data.risk_score,
          status: res.status,
        };
      }
      return { error: data.error || "Connection failed", status: res.status };
    }

    // Store connection ID in localStorage for window close cleanup
    if (data.connection_id) {
      localStorage.setItem("vpn_connection_id", data.connection_id);
    }

    return {
      connected: true,
      connection_id: data.connection_id,
      vpn_ip: data.vpn_ip || data.ip,
      real_client_ip: data.real_client_ip,
      location: data.location,
      connection_mode: data.connection_mode || "unknown",
    };
  } catch (err) {
    console.error("VPN connect error:", err);
    return { error: err.message };
  }
}

/* ------------------------------------------------------------
   3️⃣ DISCONNECT VPN
------------------------------------------------------------- */
export async function disconnectVpn(connectionId = null) {
  // Get connection ID from parameter, localStorage, or check existing connection
  let connId = connectionId;

  if (!connId) {
    connId = localStorage.getItem("vpn_connection_id");
  }

  if (!connId) {
    // Try to find active connection
    const existing = await checkExistingConnection();
    if (existing && existing.connected) {
      connId = existing.connection_id;
    }
  }

  if (!connId) {
    console.warn("No connection ID found for disconnect");
    return { error: "No active connection found" };
  }

  try {
    const res = await fetch(`${VPN_BASE}/api/vpn/disconnect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connection_id: connId }),
    });

    const data = await res.json();

    // Clear stored connection ID
    localStorage.removeItem("vpn_connection_id");

    return { success: true, ...data };
  } catch (err) {
    console.error("VPN disconnect error:", err);
    return { error: err.message };
  }
}

/* ------------------------------------------------------------
   4️⃣ GET VPN STATUS
------------------------------------------------------------- */
export async function getVpnStatus(connectionId = null) {
  let connId = connectionId || localStorage.getItem("vpn_connection_id");

  if (!connId) {
    const existing = await checkExistingConnection();
    if (existing && existing.connected) {
      connId = existing.connection_id;
    }
  }

  if (!connId) {
    return { status: "inactive" };
  }

  try {
    const res = await fetch(`${VPN_BASE}/api/vpn/status?connection_id=${encodeURIComponent(connId)}`);
    const data = await res.json();
    
    // Handle terminated status (403)
    if (res.status === 403 && data.status === "terminated") {
      return {
        status: "terminated",
        reason: data.reason || "Connection terminated",
        termination_reason: data.reason,
        connected_at: data.connected_at,
        terminated_at: data.terminated_at,
      };
    }
    
    // Handle disconnected status
    if (data.status === "disconnected") {
      return {
        status: "disconnected",
        reason: data.reason || "Connection disconnected",
        disconnect_reason: data.reason,
        connected_at: data.connected_at,
        disconnected_at: data.disconnected_at,
      };
    }
    
    return data;
  } catch (err) {
    console.error("VPN status error:", err);
    return { status: "error", error: err.message };
  }
}

/* ------------------------------------------------------------
   5️⃣ LIST ALL CONNECTIONS
------------------------------------------------------------- */
export async function listConnections(userEmail = null) {
  try {
    let url = `${VPN_BASE}/api/vpn/connections`;
    if (userEmail) {
      url += `?user_email=${encodeURIComponent(userEmail)}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("List connections error:", err);
    return { connections: [], count: 0, error: err.message };
  }
}

