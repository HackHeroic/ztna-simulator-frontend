import React, { useState, useEffect } from "react";

export default function VpnDashboard() {
  const [token, setToken] = useState(localStorage.getItem("vpn_token") || "");
  const [connectionId, setConnectionId] = useState("");
  const [clientIp, setClientIp] = useState("127.0.0.1");

  const [device, setDevice] = useState({
    os_type: "Unknown",
    os_version: "Unknown",
    encrypted: true,
  });

  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activityLog, setActivityLog] = useState([]);

  const addLog = (event) => {
    setActivityLog((prev) => [
      { time: new Date().toLocaleTimeString(), event },
      ...prev.slice(0, 19),
    ]);
  };

  // ----------------------------------------------------
  // Fetch public IP
  // ----------------------------------------------------
  useEffect(() => {
    fetch("https://api64.ipify.org?format=json")
      .then((res) => res.json())
      .then((d) => {
        setClientIp(d.ip);
        addLog(`🌐 Client IP: ${d.ip}`);
      })
      .catch(() => addLog("⚠️ Failed to fetch IP"));
  }, []);

  // ----------------------------------------------------
  // Load active VPN connections (ALWAYS USE data.connections)
  // ----------------------------------------------------
  const loadActiveConnections = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/vpn/connections");
      const data = await res.json();

      console.log("Active connections API:", data);

      // backend returns: { connections: [...], count: 1 }
      setConnections(Array.isArray(data.connections) ? data.connections : []);

    } catch (err) {
      addLog("❌ Failed to load active connections");
    }
  };

  // Load as soon as the dashboard opens
  useEffect(() => {
    loadActiveConnections();
  }, []);

  // ----------------------------------------------------
  // CONNECT
  // ----------------------------------------------------
  const handleConnect = async () => {
    if (!token) return setMessage("Please set token first");

    setLoading(true);
    addLog("🔌 Connecting...");

    try {
      const res = await fetch("http://localhost:5001/api/vpn/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vpn_token: token, client_ip: clientIp, device }),
      });

      const data = await res.json();
      setMessage(JSON.stringify(data, null, 2));

      if (data.existing_connection) {
        setConnectionId(data.existing_connection.connection_id);
        addLog(`🟡 Using existing connection: ${data.existing_connection.connection_id}`);
      } else if (data.connection_id) {
        setConnectionId(data.connection_id);
        addLog(`🟢 Connected: ${data.connection_id}`);
      }

      // refresh active list
      await loadActiveConnections();

    } catch (err) {
      addLog("❌ Connect error: " + err.message);
    }

    setLoading(false);
  };

  // ----------------------------------------------------
  // DISCONNECT
  // ----------------------------------------------------
  const handleDisconnect = async () => {
    if (!connectionId) return addLog("⚠️ No active connection to disconnect");

    setLoading(true);
    addLog("🔴 Disconnecting...");

    try {
      const res = await fetch("http://localhost:5001/api/vpn/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connection_id: connectionId }),
      });

      const data = await res.json();
      addLog("🛑 Disconnected");
      setMessage(JSON.stringify(data, null, 2));

      setConnectionId("");

      // refresh list
      await loadActiveConnections();

    } catch (err) {
      addLog("❌ Disconnect error: " + err.message);
    }

    setLoading(false);
  };

  // ----------------------------------------------------
  // STATUS
  // ----------------------------------------------------
  const handleStatus = async () => {
    if (!connectionId) return;

    setLoading(true);
    addLog("🔍 Checking status...");

    try {
      const res = await fetch("http://localhost:5001/api/vpn/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connection_id: connectionId }),
      });

      const data = await res.json();
      setMessage(JSON.stringify(data, null, 2));
      addLog("📊 Status received");

    } catch (err) {
      addLog("❌ Status error: " + err.message);
    }

    setLoading(false);
  };

  // ----------------------------------------------------
  // ROUTES
  // ----------------------------------------------------
  const handleRoutes = async () => {
    if (!connectionId) return;

    setLoading(true);
    addLog("📍 Fetching routes...");

    try {
      const res = await fetch("http://localhost:5001/api/vpn/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connection_id: connectionId }),
      });

      const data = await res.json();
      setMessage(JSON.stringify(data, null, 2));
      addLog("🗺 Routes loaded");

    } catch (err) {
      addLog("❌ Route error: " + err.message);
    }

    setLoading(false);
  };

  // ----------------------------------------------------
  // HEALTH
  // ----------------------------------------------------
  const handleHealth = async () => {
    setLoading(true);
    addLog("❤️ Checking health...");

    try {
      const res = await fetch("http://localhost:5001/health");
      const data = await res.json();

      setMessage(JSON.stringify(data, null, 2));
      addLog("💚 Health OK");

    } catch (err) {
      addLog("❌ Health error: " + err.message);
    }

    setLoading(false);
  };

  // ----------------------------------------------------
  // UI
  // ----------------------------------------------------
  return (
    <div className="min-h-screen p-6 bg-gray-100 font-sans">

      <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">
        🛡 VPN Backend Dashboard
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">

        {/* LEFT PANEL */}
        <div className="space-y-8">

          {/* TOKEN INPUT */}
          <div className="bg-white rounded-2xl p-6 shadow border">
            <label className="text-sm font-semibold text-gray-700">VPN Token</label>
            <input
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                localStorage.setItem("vpn_token", e.target.value);
              }}
              className="mt-2 w-full px-4 py-2 rounded-xl border"
              placeholder="Enter JWT token..."
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-3 gap-3 bg-white p-6 rounded-2xl shadow border">
            <button onClick={handleConnect} disabled={loading} className="btn-primary">
              {loading ? "Connecting..." : "Connect"}
            </button>

            <button onClick={handleDisconnect} className="btn-danger">Disconnect</button>

            <button onClick={handleStatus} className="btn-secondary">Status</button>
            <button onClick={loadActiveConnections} className="btn-neutral">List</button>
            <button onClick={handleRoutes} className="btn-secondary">Routes</button>
            <button onClick={handleHealth} className="btn-info">Health</button>
          </div>

          {/* OUTPUT BOX */}
          <div className="bg-white rounded-2xl p-5 border shadow h-72 overflow-auto">
            <h2 className="font-semibold text-sm mb-2">Output</h2>
            <pre className="text-xs whitespace-pre-wrap text-gray-800">
              {message || "📤 Press a button to begin."}
            </pre>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-8">

          {/* ACTIVITY LOG */}
          <div className="bg-white rounded-2xl p-5 border shadow h-80 overflow-auto">
            <h2 className="text-sm font-semibold mb-2">Activity Log</h2>
            {activityLog.length ? (
              activityLog.map((log, i) => (
                <div key={i} className="p-3 mb-2 rounded-xl bg-gray-50 border">
                  <p className="text-xs font-medium">{log.event}</p>
                  <p className="text-[11px] text-gray-500">{log.time}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 italic">No activity yet.</p>
            )}
          </div>

          {/* ACTIVE CONNECTIONS PANEL */}
          <div className="bg-white rounded-2xl p-5 border shadow h-80 overflow-auto">
            <h2 className="text-sm font-semibold mb-3">Active Connections</h2>

            {connections.length ? (
              connections.map((c, i) => (
                <div key={i} className="p-3 mb-3 rounded-xl bg-gray-50 border">
                  <p><strong>User:</strong> {c.user}</p>
                  <p><strong>VPN IP:</strong> {c.vpn_ip}</p>
                  <p><strong>ID:</strong> {c.connection_id}</p>

                  <span
                    className={`mt-2 inline-block px-2 py-1 rounded-full text-[10px] ${
                      c.status === "connected"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {c.status.toUpperCase()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 italic">No active connections.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
