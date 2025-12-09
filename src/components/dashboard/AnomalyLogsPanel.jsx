import React, { useState, useEffect } from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Modal from "../ui/Modal";
import {
  AlertTriangle,
  MapPin,
  Clock,
  Shield,
  User,
  Database,
  Filter,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { getUserFromToken, hasClearance } from "../../utils/userUtils";

const API_BASE = "http://localhost:5002";

export default function AnomalyLogsPanel() {
  const token = localStorage.getItem("token");
  const user = getUserFromToken(token);
  const canView = hasClearance(user, 2);

  const [anomalies, setAnomalies] = useState([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterRisk, setFilterRisk] = useState("all");
  const [filterUser, setFilterUser] = useState("");

  useEffect(() => {
    if (canView) {
      loadAnomalies();
      // Refresh every 30 seconds
      const interval = setInterval(loadAnomalies, 30000);
      return () => clearInterval(interval);
    }
  }, [canView]);

  const loadAnomalies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/policy/anomalies?limit=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.anomalies) {
        setAnomalies(data.anomalies);
      }
    } catch (err) {
      console.error("Error loading anomalies:", err);
    }
    setLoading(false);
  };

  const getRiskColor = (risk) => {
    if (risk >= 75) return "red";
    if (risk >= 50) return "orange";
    if (risk >= 30) return "yellow";
    return "green";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const filteredAnomalies = anomalies.filter((anomaly) => {
    if (filterRisk !== "all") {
      const risk = anomaly.risk || 0;
      if (filterRisk === "high" && risk < 75) return false;
      if (filterRisk === "medium" && (risk < 50 || risk >= 75)) return false;
      if (filterRisk === "low" && risk >= 50) return false;
    }
    if (filterUser) {
      if (!anomaly.user?.toLowerCase().includes(filterUser.toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  if (!canView) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <Shield className="text-gray-400 mb-2" size={32} />
          <h2 className="text-lg font-semibold mb-2">Anomaly Detection Logs</h2>
          <p className="text-sm text-center">
            Clearance level 2+ required to view anomaly logs.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Your clearance: {user?.clearance || 0}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="text-red-500" /> Anomaly Detection Logs
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Real-time security anomaly detection and logging
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge color="red">{filteredAnomalies.length} anomalies</Badge>
            <button
              onClick={loadAnomalies}
              disabled={loading}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-1"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="relative">
            <Filter className="absolute left-2 top-2.5 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Filter by user..."
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Risk Levels</option>
            <option value="high">High Risk (75+)</option>
            <option value="medium">Medium Risk (50-74)</option>
            <option value="low">Low Risk (&lt;50)</option>
          </select>
        </div>

        {loading && anomalies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <RefreshCw className="mx-auto mb-2 animate-spin" size={32} />
            <p className="text-sm">Loading anomalies...</p>
          </div>
        ) : filteredAnomalies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-sm">No anomalies found</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredAnomalies.map((anomaly, index) => (
              <div
                key={index}
                onClick={() => setSelectedAnomaly(anomaly)}
                className="p-4 rounded-lg border bg-gradient-to-r from-red-50 to-orange-50 hover:shadow-md transition-all cursor-pointer border-red-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="text-red-600" size={18} />
                    <div>
                      <div className="font-semibold text-sm text-gray-800">
                        {anomaly.user || "Unknown User"}
                      </div>
                      <div className="text-xs text-gray-600 flex items-center gap-2 mt-1">
                        <Clock size={12} />
                        {formatDate(anomaly.time)}
                      </div>
                    </div>
                  </div>
                  <Badge color={getRiskColor(anomaly.risk || 0)}>
                    Risk: {anomaly.risk || 0}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <Database size={12} />
                    <span className="truncate">{anomaly.resource || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    <span>
                      {anomaly.location?.country || 
                       (typeof anomaly.location === 'string' ? anomaly.location : 'Unknown')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield size={12} />
                    <span>VPN: {anomaly.vpn_connected ? "Yes" : "No"}</span>
                  </div>
                </div>

                {anomaly.risk_factors && anomaly.risk_factors.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {anomaly.risk_factors.slice(0, 3).map((factor, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-medium"
                      >
                        {factor}
                      </span>
                    ))}
                    {anomaly.risk_factors.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">
                        +{anomaly.risk_factors.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Anomaly Detail Modal */}
      <Modal
        isOpen={!!selectedAnomaly}
        onClose={() => setSelectedAnomaly(null)}
        title="Anomaly Details"
        size="lg"
      >
        {selectedAnomaly && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="text-xs text-gray-500 mb-1">User</div>
                <div className="font-semibold">{selectedAnomaly.user || "Unknown"}</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="text-xs text-gray-500 mb-1">Risk Score</div>
                <div className="font-semibold text-lg">{selectedAnomaly.risk || 0}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Resource</div>
                <div className="font-semibold">{selectedAnomaly.resource || "Unknown"}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Timestamp</div>
                <div className="font-semibold text-sm">
                  {formatDate(selectedAnomaly.time)}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Location</div>
                <div className="font-semibold">
                  {selectedAnomaly.location?.country || 
                   (typeof selectedAnomaly.location === 'string' ? selectedAnomaly.location : 'Unknown')}
                  {selectedAnomaly.location?.city && `, ${selectedAnomaly.location.city}`}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">VPN Connected</div>
                <Badge color={selectedAnomaly.vpn_connected ? "green" : "gray"}>
                  {selectedAnomaly.vpn_connected ? "Yes" : "No"}
                </Badge>
              </div>
            </div>

            {selectedAnomaly.risk_factors && selectedAnomaly.risk_factors.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Risk Factors</div>
                <div className="space-y-1">
                  {selectedAnomaly.risk_factors.map((factor, i) => (
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

            {selectedAnomaly.device && Object.keys(selectedAnomaly.device).length > 0 && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-xs font-medium text-purple-700 mb-2">Device Info</div>
                <div className="text-sm space-y-1">
                  {selectedAnomaly.device.os_type && (
                    <div>OS: {selectedAnomaly.device.os_type} {selectedAnomaly.device.os_version}</div>
                  )}
                  {selectedAnomaly.device.rooted !== undefined && (
                    <div>Rooted: {selectedAnomaly.device.rooted ? "Yes" : "No"}</div>
                  )}
                  {selectedAnomaly.device.encrypted !== undefined && (
                    <div>Encrypted: {selectedAnomaly.device.encrypted ? "Yes" : "No"}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

