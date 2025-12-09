import React, { useState, useEffect } from "react";
import Card from "../ui/Card";
import { RefreshCw, Network, MapPin } from "lucide-react";

export default function VpnRoutingTable() {
  const [routingTable, setRoutingTable] = useState([]);
  const [assignedIPs, setAssignedIPs] = useState({});
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const fetchRoutingData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch OpenVPN status (includes routing table and clients)
      const statusRes = await fetch("http://localhost:5001/api/vpn/openvpn-status");
      const statusData = await statusRes.json();

      if (statusRes.ok) {
        setRoutingTable(statusData.status_log?.routing_table || []);
        setClients(statusData.status_log?.clients || []);
      } else {
        setError("Failed to fetch OpenVPN status");
      }

      // Fetch IP assignments
      const ipRes = await fetch("http://localhost:5001/api/vpn/ip-assignments");
      const ipData = await ipRes.json();

      if (ipRes.ok) {
        setAssignedIPs(ipData.assigned_ips || {});
      } else {
        setError("Failed to fetch IP assignments");
      }

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error("Error fetching routing data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutingData();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchRoutingData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Network className="w-5 h-5 text-violet-600" />
          <h2 className="text-xl font-bold text-gray-800">VPN Routing & IP Assignments</h2>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-500">Updated: {lastUpdated}</span>
          )}
          <button
            onClick={fetchRoutingData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Routing Table */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-gray-600" />
            <h3 className="font-semibold text-gray-700">Routing Table</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {routingTable.length} routes
            </span>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {routingTable.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                        Virtual IP
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                        Common Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                        Real Address
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {routingTable.map((route, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2 font-mono text-xs text-violet-600">
                          {route.virtual_address || "-"}
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-700">
                          {route.common_name || "-"}
                        </td>
                        <td className="px-4 py-2 font-mono text-xs text-gray-600">
                          {route.real_address || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">
                <Network className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No routing entries found</p>
                <p className="text-xs mt-1">Connect a VPN client to see routing information</p>
              </div>
            )}
          </div>
        </div>

        {/* Assigned IPs */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Network className="w-4 h-4 text-gray-600" />
            <h3 className="font-semibold text-gray-700">Assigned IPs</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {Object.keys(assignedIPs).length} IPs
            </span>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {Object.keys(assignedIPs).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                        VPN IP
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                        Connection ID
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Object.entries(assignedIPs).map(([ip, connId]) => (
                      <tr key={ip} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2 font-mono text-xs text-violet-600 font-semibold">
                          {ip}
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-700 break-all">
                          {connId || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">
                <Network className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No IP assignments found</p>
                <p className="text-xs mt-1">IPs will appear when clients connect</p>
              </div>
            )}
          </div>

          {/* Active Clients Summary */}
          {clients.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Active Clients</h4>
              <div className="space-y-2">
                {clients.map((client, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-700">
                        {client.common_name || "UNDEF"}
                      </span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px]">
                        Active
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-gray-600">
                      <div>
                        <span className="text-gray-500">Virtual IP:</span>{" "}
                        <span className="font-mono text-violet-600">
                          {client.virtual_address || "Pending"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Real:</span>{" "}
                        <span className="font-mono">{client.real_address || "-"}</span>
                      </div>
                    </div>
                    {client.connected_since && (
                      <div className="mt-1 text-gray-500 text-[10px]">
                        Connected: {client.connected_since}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

