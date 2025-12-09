import React, { useState, useEffect } from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Modal from "../ui/Modal";
import {
  Users,
  Filter,
  Download,
  Search,
  Clock,
  MapPin,
  Database,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { getUserFromToken, isAdmin } from "../../utils/userUtils";

const API_BASE = "http://localhost:5002";

export default function AdminUserLogs({ accessMetrics }) {
  const token = localStorage.getItem("token");
  const user = getUserFromToken(token);
  const isUserAdmin = isAdmin(user);

  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filterUser, setFilterUser] = useState("");
  const [filterResource, setFilterResource] = useState("");
  const [filterDecision, setFilterDecision] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isUserAdmin && accessMetrics?.recent_attempts) {
      setLogs(accessMetrics.recent_attempts);
      setFilteredLogs(accessMetrics.recent_attempts);
    }
  }, [accessMetrics, isUserAdmin]);

  useEffect(() => {
    let filtered = [...logs];

    if (filterUser) {
      filtered = filtered.filter((log) =>
        log.user?.toLowerCase().includes(filterUser.toLowerCase())
      );
    }

    if (filterResource) {
      filtered = filtered.filter((log) =>
        log.resource?.toLowerCase().includes(filterResource.toLowerCase())
      );
    }

    if (filterDecision !== "all") {
      filtered = filtered.filter((log) => log.decision === filterDecision);
    }

    setFilteredLogs(filtered);
  }, [logs, filterUser, filterResource, filterDecision]);

  if (!isUserAdmin) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <Shield className="text-gray-400 mb-2" size={32} />
          <h2 className="text-lg font-semibold mb-2">User Access Logs</h2>
          <p className="text-sm text-center">
            Admin access required to view all user logs.
          </p>
        </div>
      </Card>
    );
  }

  const getDecisionIcon = (decision) => {
    switch (decision) {
      case "ALLOW":
        return <CheckCircle2 className="text-green-500" size={16} />;
      case "DENY":
        return <XCircle className="text-red-500" size={16} />;
      case "MFA_REQUIRED":
        return <AlertTriangle className="text-yellow-500" size={16} />;
      default:
        return <Shield className="text-gray-500" size={16} />;
    }
  };

  const getDecisionColor = (decision) => {
    switch (decision) {
      case "ALLOW":
        return "green";
      case "DENY":
        return "red";
      case "MFA_REQUIRED":
        return "yellow";
      default:
        return "gray";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const exportLogs = () => {
    const csv = [
      ["Timestamp", "User", "Resource", "Decision", "Risk Score", "Location", "VPN"].join(","),
      ...filteredLogs.map((log) =>
        [
          log.timestamp || "",
          log.user || "",
          log.resource || "",
          log.decision || "",
          log.risk_score || 0,
          log.location || "",
          log.vpn_connected ? "Yes" : "No",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ztna-logs-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="text-orange-500" /> All User Access Logs
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              📝 Real-time logs persisted to disk. All access attempts are tracked and saved.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge color="blue">{filteredLogs.length} logs</Badge>
            <button
              onClick={exportLogs}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
            >
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Filter by user..."
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="relative">
            <Database className="absolute left-2 top-2.5 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Filter by resource..."
              value={filterResource}
              onChange={(e) => setFilterResource(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <select
            value={filterDecision}
            onChange={(e) => setFilterDecision(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Decisions</option>
            <option value="ALLOW">Allowed</option>
            <option value="DENY">Denied</option>
            <option value="MFA_REQUIRED">MFA Required</option>
          </select>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-sm">No logs found</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredLogs.map((log, index) => (
              <div
                key={index}
                onClick={() => setSelectedLog(log)}
                className="p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getDecisionIcon(log.decision)}
                    <div>
                      <div className="font-semibold text-sm">{log.user || "Unknown"}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <Clock size={12} />
                        {formatDate(log.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={getDecisionColor(log.decision)}>
                      {log.decision || "UNKNOWN"}
                    </Badge>
                    <Badge color={log.risk_score >= 50 ? "red" : "yellow"}>
                      Risk: {log.risk_score || 0}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Database size={12} />
                    <span className="truncate">{log.resource || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    <span>{log.location || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield size={12} />
                    <span>VPN: {log.vpn_connected ? "Yes" : "No"}</span>
                  </div>
                </div>

                {log.risk_factors && log.risk_factors.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {log.risk_factors.slice(0, 2).map((factor, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px]"
                      >
                        {factor}
                      </span>
                    ))}
                    {log.risk_factors.length > 2 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">
                        +{log.risk_factors.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Log Detail Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Access Log Details"
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">User</div>
                <div className="font-semibold">{selectedLog.user || "Unknown"}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Decision</div>
                <Badge color={getDecisionColor(selectedLog.decision)}>
                  {selectedLog.decision || "UNKNOWN"}
                </Badge>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Resource</div>
                <div className="font-semibold">{selectedLog.resource || "Unknown"}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Risk Score</div>
                <div className="font-semibold">{selectedLog.risk_score || 0}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Timestamp</div>
                <div className="font-semibold text-sm">
                  {formatDate(selectedLog.timestamp)}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">VPN Connected</div>
                <Badge color={selectedLog.vpn_connected ? "green" : "gray"}>
                  {selectedLog.vpn_connected ? "Yes" : "No"}
                </Badge>
              </div>
            </div>

            {selectedLog.risk_factors && selectedLog.risk_factors.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Risk Factors</div>
                <div className="space-y-1">
                  {selectedLog.risk_factors.map((factor, i) => (
                    <div
                      key={i}
                      className="p-2 bg-red-50 border border-red-200 rounded text-sm"
                    >
                      {factor}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedLog.device && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-xs font-medium text-purple-700 mb-2">Device Info</div>
                <div className="text-sm">
                  {JSON.stringify(selectedLog.device, null, 2)}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

