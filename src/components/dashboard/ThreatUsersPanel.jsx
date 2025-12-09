import React, { useState, useEffect } from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Modal from "../ui/Modal";
import {
  Shield,
  AlertTriangle,
  UserX,
  MapPin,
  Clock,
  Activity,
  TrendingUp,
  Lock,
} from "lucide-react";
import { getUserFromToken, hasClearance } from "../../utils/userUtils";

const API_BASE = "http://localhost:5002";

export default function ThreatUsersPanel() {
  const token = localStorage.getItem("token");
  const user = getUserFromToken(token);
  const canView = hasClearance(user, 3);

  const [threatUsers, setThreatUsers] = useState([]);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (canView) {
      loadThreatUsers();
    }
  }, [canView]);

  const loadThreatUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/policy/threat-users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.threat_users) {
        setThreatUsers(data.threat_users);
      }
    } catch (err) {
      console.error("Error loading threat users:", err);
    }
    setLoading(false);
  };

  const getThreatLevelColor = (level) => {
    switch (level) {
      case "critical":
        return "red";
      case "high":
        return "orange";
      case "medium":
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

  if (!canView) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <Lock className="text-gray-400 mb-2" size={32} />
          <h2 className="text-lg font-semibold mb-2">Threat Users</h2>
          <p className="text-sm text-center">
            Clearance level 3+ required to view threat intelligence.
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
              <Shield className="text-red-500" /> Threat Users
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Monitored users with suspicious activity patterns
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge color="red">{threatUsers.length} threats</Badge>
            <button
              onClick={loadThreatUsers}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {loading && threatUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="mx-auto mb-2 animate-spin" size={32} />
            <p className="text-sm">Loading threat data...</p>
          </div>
        ) : threatUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-sm">No threat users detected</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {threatUsers.map((threat, index) => (
              <div
                key={index}
                onClick={() => setSelectedThreat(threat)}
                className="p-4 rounded-lg border bg-gradient-to-r from-red-50 to-orange-50 hover:shadow-md transition-all cursor-pointer border-red-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <UserX className="text-red-600" size={20} />
                    <div>
                      <div className="font-semibold text-sm text-gray-800">
                        {threat.user_email}
                      </div>
                      <div className="text-xs text-gray-600 flex items-center gap-2 mt-1">
                        <Clock size={12} />
                        Last seen: {formatDate(threat.last_seen)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={getThreatLevelColor(threat.threat_level)}>
                      {threat.threat_level?.toUpperCase()}
                    </Badge>
                    <Badge color={threat.risk_score >= 80 ? "red" : "orange"}>
                      Risk: {threat.risk_score}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <Activity size={12} />
                    <span>{threat.attempts || 0} attempts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertTriangle size={12} />
                    <span>{threat.blocked_attempts || 0} blocked</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    <span>{threat.locations?.length || 0} locations</span>
                  </div>
                </div>

                <div className="mt-2">
                  <span className="text-xs font-medium text-gray-700">
                    Threat Type:
                  </span>
                  <span className="text-xs text-gray-600 ml-2">
                    {threat.threat_type || "Unknown"}
                  </span>
                </div>

                {threat.activities && threat.activities.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {threat.activities.slice(0, 2).map((activity, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px]"
                      >
                        {activity.action}
                      </span>
                    ))}
                    {threat.activities.length > 2 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">
                        +{threat.activities.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Threat Detail Modal */}
      <Modal
        isOpen={!!selectedThreat}
        onClose={() => setSelectedThreat(null)}
        title="Threat User Details"
        size="lg"
      >
        {selectedThreat && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="text-xs text-gray-500 mb-1">User Email</div>
                <div className="font-semibold">{selectedThreat.user_email}</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="text-xs text-gray-500 mb-1">Threat Level</div>
                <Badge color={getThreatLevelColor(selectedThreat.threat_level)}>
                  {selectedThreat.threat_level?.toUpperCase()}
                </Badge>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Risk Score</div>
                <div className="font-semibold text-lg">{selectedThreat.risk_score}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Threat Type</div>
                <div className="font-semibold">{selectedThreat.threat_type}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">First Seen</div>
                <div className="font-semibold text-sm">
                  {formatDate(selectedThreat.first_seen)}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Last Seen</div>
                <div className="font-semibold text-sm">
                  {formatDate(selectedThreat.last_seen)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs text-gray-500 mb-1">Total Attempts</div>
                <div className="font-semibold text-lg">{selectedThreat.attempts || 0}</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="text-xs text-gray-500 mb-1">Blocked Attempts</div>
                <div className="font-semibold text-lg">
                  {selectedThreat.blocked_attempts || 0}
                </div>
              </div>
            </div>

            {selectedThreat.locations && selectedThreat.locations.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Locations</div>
                <div className="flex flex-wrap gap-2">
                  {selectedThreat.locations.map((loc, i) => (
                    <Badge key={i} color="blue">
                      {loc}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {selectedThreat.activities && selectedThreat.activities.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Recent Activities</div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedThreat.activities.map((activity, i) => (
                    <div
                      key={i}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{activity.action}</span>
                        <Badge color={activity.blocked ? "red" : "yellow"}>
                          {activity.blocked ? "Blocked" : "Allowed"}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 grid grid-cols-2 gap-2">
                        <div>
                          <span className="font-medium">Resource:</span> {activity.resource}
                        </div>
                        <div>
                          <span className="font-medium">IP:</span> {activity.ip}
                        </div>
                        <div>
                          <span className="font-medium">Location:</span> {activity.location}
                        </div>
                        <div>
                          <span className="font-medium">Risk:</span> {activity.risk_score}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(activity.timestamp)}
                      </div>
                      {activity.reason && (
                        <div className="text-xs text-red-600 mt-1">
                          Reason: {activity.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

