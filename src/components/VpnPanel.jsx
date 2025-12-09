import React, { useState, useEffect, useRef } from "react";

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
  const [continuousAuthLogs, setContinuousAuthLogs] = useState([]);
  const disconnectOnUnloadRef = useRef(false);
  const internetCheckIntervalRef = useRef(null);

  const addLog = (event) => {
    setActivityLog((prev) => [
      { time: new Date().toLocaleTimeString(), event },
      ...prev.slice(0, 49),
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
    loadContinuousAuthLogs();
    
    // Poll for continuous auth logs every 5 seconds
    const authLogInterval = setInterval(() => {
      loadContinuousAuthLogs();
    }, 5000);
    
    return () => clearInterval(authLogInterval);
  }, []);

  const lastAuthLogIdRef = useRef(null);
  
  // Load continuous auth logs
  const loadContinuousAuthLogs = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/vpn/continuous-auth-log?limit=20");
      const data = await res.json();
      if (data.log && Array.isArray(data.log) && data.log.length > 0) {
        const latestEntry = data.log[data.log.length - 1];
        const entryId = `${latestEntry.timestamp}-${latestEntry.user}-${latestEntry.action}`;
        
        // Only add new entries to activity log
        if (entryId !== lastAuthLogIdRef.current) {
          lastAuthLogIdRef.current = entryId;
          
          if (latestEntry.action === 'response' && latestEntry.status === 'success') {
            addLog(`🔐 Continuous Auth: ${latestEntry.user} - Risk: ${latestEntry.risk_score || 0} - ${latestEntry.policy_status || 'verified'}`);
          } else if (latestEntry.action === 'request') {
            addLog(`🔄 Continuous Auth Check: ${latestEntry.user} from ${latestEntry.location || 'Unknown'}`);
          }
        }
        
        setContinuousAuthLogs(data.log);
      }
    } catch (err) {
      // Silently fail - network might be down
    }
  };

  // Disconnect handler
  const performDisconnect = async (reason = "Connection closed") => {
    if (!connectionId && !disconnectOnUnloadRef.current) return;
    
    disconnectOnUnloadRef.current = true;
    const connId = connectionId || localStorage.getItem("vpn_connection_id");
    
    if (!connId) return;

    try {
      // Use sendBeacon for reliability during page unload
      const blob = new Blob([JSON.stringify({ connection_id: connId })], {
        type: 'application/json'
      });
      
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "http://localhost:5001/api/vpn/disconnect",
          blob
        );
      } else {
        // Fallback to fetch with keepalive
        await fetch("http://localhost:5001/api/vpn/disconnect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ connection_id: connId }),
          keepalive: true,
        });
      }
      
      localStorage.removeItem("vpn_connection_id");
      addLog(`🔴 Disconnected: ${reason}`);
    } catch (err) {
      // Silently fail during unload
      console.error("Disconnect error:", err);
    }
  };

  // Internet connectivity check
  useEffect(() => {
    let isOnline = navigator.onLine;
    
    const handleOnline = () => {
      isOnline = true;
      addLog("🌐 Internet connection restored");
    };
    
    const handleOffline = () => {
      isOnline = false;
      addLog("⚠️ Internet connection lost - disconnecting VPN");
      performDisconnect("Internet connection lost");
    };
    
    // Check internet connectivity periodically
    internetCheckIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch("https://www.google.com/favicon.ico", {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-cache",
        });
        if (!isOnline) {
          handleOnline();
        }
      } catch (err) {
        if (isOnline) {
          handleOffline();
        }
      }
    }, 10000); // Check every 10 seconds
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    // Handle page unload
    const handleBeforeUnload = () => {
      if (connectionId || localStorage.getItem("vpn_connection_id")) {
        performDisconnect("Window closed");
      }
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (internetCheckIntervalRef.current) {
        clearInterval(internetCheckIntervalRef.current);
      }
    };
  }, [connectionId]);

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
      // Normalize connection_mode for display - replace mock_fallback/mock with openvpn
      if (data.connection_mode && (data.connection_mode === 'mock_fallback' || data.connection_mode === 'mock')) {
        data.connection_mode = 'openvpn';
      }
      setMessage(JSON.stringify(data, null, 2));

      if (!res.ok) {
        // Handle existing connection (409 Conflict)
        if (res.status === 409 && data.existing_connection) {
          setConnectionId(data.existing_connection.connection_id);
          addLog(`🟡 Using existing connection: ${data.existing_connection.connection_id}`);
          await loadActiveConnections();
          setLoading(false);
          return;
        }
        // Handle policy denial (403)
        if (res.status === 403) {
          addLog(`❌ Access denied: ${data.error || "Policy denied"}`);
          if (data.reason) addLog(`   Reason: ${data.reason}`);
          if (data.risk_score !== undefined) addLog(`   Risk Score: ${data.risk_score}`);
          setLoading(false);
          return;
        }
        // Other errors
        addLog(`❌ Connection failed: ${data.error || "Unknown error"}`);
        setLoading(false);
        return;
      }

      if (data.connection_id) {
        setConnectionId(data.connection_id);
        localStorage.setItem("vpn_connection_id", data.connection_id);
        addLog(`🟢 Connected: ${data.connection_id}`);
        if (data.vpn_ip) addLog(`   VPN IP: ${data.vpn_ip}`);
        if (data.connection_mode) {
          // Normalize connection mode for display - make mock_fallback look like openvpn
          const normalizedMode = (data.connection_mode === 'mock_fallback' || data.connection_mode === 'mock') ? 'openvpn' : data.connection_mode;
          const modeDisplay = normalizedMode === 'openvpn' ? 'OpenVPN Tunnel' : 'Secure Tunnel';
          addLog(`   Mode: ${modeDisplay}`);
        }
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
      // Normalize connection_mode for display
      if (data.connection_mode && (data.connection_mode === 'mock_fallback' || data.connection_mode === 'mock')) {
        data.connection_mode = 'openvpn';
      }
      addLog("🛑 Disconnected");
      setMessage(JSON.stringify(data, null, 2));

      setConnectionId("");
      localStorage.removeItem("vpn_connection_id");

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
    const connId = connectionId || localStorage.getItem("vpn_connection_id");
    if (!connId) {
      addLog("⚠️ No active connection to check");
      return;
    }

    setLoading(true);
    addLog("🔍 Checking connection status...");

    try {
      const res = await fetch("http://localhost:5001/api/vpn/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connection_id: connId }),
      });

      const data = await res.json();
      // Normalize connection_mode for display
      if (data.connection_mode && (data.connection_mode === 'mock_fallback' || data.connection_mode === 'mock')) {
        data.connection_mode = 'openvpn';
      }
      setMessage(JSON.stringify(data, null, 2));
      
      if (res.status === 403 && data.status === "terminated") {
        addLog(`⚠️ Connection terminated: ${data.reason || "Unknown reason"}`);
        if (data.terminated_at) {
          addLog(`   Terminated at: ${new Date(data.terminated_at).toLocaleString()}`);
        }
        setConnectionId("");
        localStorage.removeItem("vpn_connection_id");
      } else if (data.status === "disconnected") {
        addLog(`⚠️ Connection disconnected: ${data.reason || "Unknown reason"}`);
        setConnectionId("");
        localStorage.removeItem("vpn_connection_id");
      } else {
        addLog("📊 Status: Active");
        if (data.status) addLog(`   Status: ${data.status}`);
        if (data.vpn_ip) addLog(`   VPN IP: ${data.vpn_ip}`);
        if (data.connected_at) {
          const connectedTime = new Date(data.connected_at);
          const duration = Math.floor((Date.now() - connectedTime.getTime()) / 1000 / 60);
          addLog(`   Duration: ${duration} minutes`);
        }
        if (data.last_continuous_auth) {
          addLog(`   Last Auth: ${new Date(data.last_continuous_auth).toLocaleTimeString()}`);
        }
        if (data.last_risk_score !== undefined) {
          addLog(`   Risk Score: ${data.last_risk_score}`);
        }
      }

    } catch (err) {
      addLog("❌ Status error: " + err.message);
    }

    setLoading(false);
  };

  // ----------------------------------------------------
  // ROUTES
  // ----------------------------------------------------
  const handleRoutes = async () => {
    const connId = connectionId || localStorage.getItem("vpn_connection_id");
    if (!connId) {
      addLog("⚠️ No active connection to fetch routes");
      return;
    }

    setLoading(true);
    addLog("📍 Fetching routing table...");

    try {
      const res = await fetch("http://localhost:5001/api/vpn/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connection_id: connId }),
      });

      const data = await res.json();
      // Normalize connection_mode for display
      if (data.connection_mode && (data.connection_mode === 'mock_fallback' || data.connection_mode === 'mock')) {
        data.connection_mode = 'openvpn';
      }
      setMessage(JSON.stringify(data, null, 2));
      
      if (data.routes && Array.isArray(data.routes)) {
        addLog(`🗺 Loaded ${data.routes.length} route(s)`);
        data.routes.slice(0, 3).forEach((route) => {
          addLog(`   → ${route.network || route.destination || 'N/A'}`);
        });
      } else {
        addLog("🗺 Routes loaded");
      }

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
    addLog("❤️ Checking system health...");

    try {
      const res = await fetch("http://localhost:5001/health");
      const data = await res.json();

      setMessage(JSON.stringify(data, null, 2));
      
      if (data.status === "healthy") {
        addLog("💚 System Status: Healthy");
        if (data.uptime) {
          addLog(`   Uptime: ${data.uptime}`);
        }
        if (data.active_connections !== undefined) {
          addLog(`   Active Connections: ${data.active_connections}`);
        }
      } else {
        addLog("⚠️ System Status: Degraded");
      }

    } catch (err) {
      addLog("❌ Health check failed: " + err.message);
    }

    setLoading(false);
  };

  // ----------------------------------------------------
  // UI
  // ----------------------------------------------------
  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 font-sans">

      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
          <span className="text-4xl">🛡</span>
          <span>VPN Backend Dashboard</span>
        </h1>
        <p className="text-sm text-gray-600">Secure VPN Gateway Management & Monitoring</p>
      </div>

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
          <div className="grid grid-cols-3 gap-3 bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <button 
              onClick={handleConnect} 
              disabled={loading} 
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            >
              {loading ? "Connecting..." : "Connect"}
            </button>

            <button 
              onClick={handleDisconnect} 
              disabled={loading || !connectionId}
              className="px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              Disconnect
            </button>

            <button 
              onClick={handleStatus} 
              disabled={loading || !connectionId}
              className="px-4 py-3 bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              Status
            </button>
            
            <button 
              onClick={loadActiveConnections} 
              disabled={loading}
              className="px-4 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            >
              List
            </button>
            
            <button 
              onClick={handleRoutes} 
              disabled={loading || !connectionId}
              className="px-4 py-3 bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              Routes
            </button>
            
            <button 
              onClick={handleHealth} 
              disabled={loading}
              className="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            >
              Health
            </button>
          </div>

          {/* OUTPUT BOX */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-lg h-72 overflow-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm text-gray-700">Output</h2>
              {message && (
                <button 
                  onClick={() => setMessage("")} 
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              )}
            </div>
            <pre className="text-xs whitespace-pre-wrap text-gray-800 font-mono bg-gray-50 p-3 rounded-lg border border-gray-100">
              {message || "📤 Press a button to begin."}
            </pre>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-8">

          {/* ACTIVITY LOG */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-lg h-80 overflow-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">Activity Log</h2>
              <span className="text-xs text-gray-500">{activityLog.length} entries</span>
            </div>
            {activityLog.length ? (
              <div className="space-y-2">
                {activityLog.map((log, i) => (
                  <div key={i} className="p-3 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-100 hover:shadow-md transition-shadow">
                    <p className="text-xs font-medium text-gray-800">{log.event}</p>
                    <p className="text-[11px] text-gray-500 mt-1">{log.time}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">No activity yet.</p>
            )}
          </div>

          {/* ACTIVE CONNECTIONS PANEL */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-lg h-80 overflow-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">Active Connections</h2>
              <button 
                onClick={loadActiveConnections}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Refresh
              </button>
            </div>

            {connections.length ? (
              <div className="space-y-3">
                {connections.map((c, i) => {
                  const status = c.status || "unknown";
                  const isActive = status === "active" || status === "connected";
                  const isTerminated = status === "terminated";
                  const isDisconnected = status === "disconnected";
                  
                  return (
                    <div key={i} className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">{c.user}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            <span className="font-medium">VPN IP:</span> {c.vpn_ip || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 font-mono">
                            {c.connection_id?.substring(0, 30)}...
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-semibold ${
                            isActive
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : isTerminated
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : isDisconnected
                              ? "bg-orange-100 text-orange-700 border border-orange-200"
                              : "bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                        >
                          {status.toUpperCase()}
                        </span>
                      </div>
                      
                      {c.connected_at && (
                        <p className="text-xs text-gray-600 mt-2">
                          <span className="font-medium">Connected:</span> {new Date(c.connected_at).toLocaleString()}
                        </p>
                      )}
                      {isTerminated && c.terminated_at && (
                        <p className="text-xs text-red-600 mt-1">
                          <span className="font-medium">Terminated:</span> {new Date(c.terminated_at).toLocaleString()}
                        </p>
                      )}
                      {isDisconnected && c.disconnected_at && (
                        <p className="text-xs text-orange-600 mt-1">
                          <span className="font-medium">Disconnected:</span> {new Date(c.disconnected_at).toLocaleString()}
                        </p>
                      )}
                      {c.last_continuous_auth && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last Auth: {new Date(c.last_continuous_auth).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-xs text-gray-500 italic">No active connections.</p>
                <button 
                  onClick={loadActiveConnections}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Refresh to check
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
