import React, { useState } from "react";
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
  Info,
  ChevronRight,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { getUserFromToken, hasClearance } from "../../utils/userUtils";

export default function AnomalyDetails({ anomalies, user }) {
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const currentUser = user || getUserFromToken(localStorage.getItem("token"));
  
  // Filter anomalies based on clearance level
  const canViewAll = currentUser?.clearance >= 4; // Security and above
  const filteredAnomalies = canViewAll
    ? anomalies?.details || []
    : (anomalies?.details || []).filter((a) => a.user === currentUser?.email);

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

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="text-red-500" /> Anomaly Detection Logs
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              📝 Real-time anomaly detection. All anomalies are logged and persisted.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge color={getRiskColor(anomalies?.anomalies || 0)}>
              {anomalies?.anomalies || 0} Total
            </Badge>
            {anomalies?.recent_anomalies > 0 && (
              <Badge color="red">
                {anomalies.recent_anomalies} Recent
              </Badge>
            )}
          </div>
        </div>

        {!canViewAll && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
            <Info size={14} className="inline mr-1" />
            Showing only your anomalies. Higher clearance required to view all.
          </div>
        )}

        {filteredAnomalies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle2 className="mx-auto mb-2 text-green-400" size={32} />
            <p className="text-sm">No anomalies detected</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredAnomalies.map((anomaly, index) => (
              <div
                key={index}
                onClick={() => setSelectedAnomaly(anomaly)}
                className="p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <XCircle className="text-red-500" size={18} />
                    <div>
                      <div className="font-semibold text-sm">
                        {canViewAll ? anomaly.user : "You"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(anomaly.time)}
                      </div>
                    </div>
                  </div>
                  <Badge color={getRiskColor(anomaly.risk || 0)}>
                    Risk: {anomaly.risk || 0}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <Database size={12} />
                    <span className="truncate">{anomaly.resource || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    <span>
                      {anomaly.location?.country || anomaly.location || "Unknown"}
                    </span>
                  </div>
                </div>

                {anomaly.risk_factors && anomaly.risk_factors.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs font-medium text-gray-700 mb-1">
                      Risk Factors:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {anomaly.risk_factors.slice(0, 3).map((factor, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px]"
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
                  </div>
                )}

                <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                  <ChevronRight size={12} />
                  Click for details
                </div>
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
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">User</div>
                <div className="font-semibold flex items-center gap-2">
                  <User size={14} />
                  {selectedAnomaly.user}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Risk Score</div>
                <div className="font-semibold">
                  <Badge color={getRiskColor(selectedAnomaly.risk || 0)}>
                    {selectedAnomaly.risk || 0}
                  </Badge>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Resource</div>
                <div className="font-semibold flex items-center gap-2">
                  <Database size={14} />
                  {selectedAnomaly.resource || "Unknown"}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Timestamp</div>
                <div className="font-semibold flex items-center gap-2">
                  <Clock size={14} />
                  {formatDate(selectedAnomaly.time)}
                </div>
              </div>
            </div>

            {selectedAnomaly.location && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs font-medium text-blue-700 mb-2 flex items-center gap-1">
                  <MapPin size={12} /> Location Information
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Country:</span>{" "}
                    <span className="font-medium">
                      {selectedAnomaly.location.country ||
                        selectedAnomaly.location ||
                        "Unknown"}
                    </span>
                  </div>
                  {selectedAnomaly.location.city && (
                    <div>
                      <span className="text-gray-600">City:</span>{" "}
                      <span className="font-medium">{selectedAnomaly.location.city}</span>
                    </div>
                  )}
                  {selectedAnomaly.location.isp && (
                    <div>
                      <span className="text-gray-600">ISP:</span>{" "}
                      <span className="font-medium">{selectedAnomaly.location.isp}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedAnomaly.device && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-xs font-medium text-purple-700 mb-2 flex items-center gap-1">
                  <Shield size={12} /> Device Information
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">OS:</span>{" "}
                    <span className="font-medium">
                      {selectedAnomaly.device.os_type || "Unknown"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Version:</span>{" "}
                    <span className="font-medium">
                      {selectedAnomaly.device.os_version || "Unknown"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Encrypted:</span>{" "}
                    <Badge color={selectedAnomaly.device.encrypted ? "green" : "red"}>
                      {selectedAnomaly.device.encrypted ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Rooted:</span>{" "}
                    <Badge color={selectedAnomaly.device.rooted ? "red" : "green"}>
                      {selectedAnomaly.device.rooted ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

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

            {selectedAnomaly.vpn_connected !== undefined && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">VPN Status</div>
                <Badge color={selectedAnomaly.vpn_connected ? "green" : "gray"}>
                  {selectedAnomaly.vpn_connected ? "Connected" : "Not Connected"}
                </Badge>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

