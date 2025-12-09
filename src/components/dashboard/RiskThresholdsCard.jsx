import React, { useState } from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { Settings, RefreshCw, AlertTriangle } from "lucide-react";
import { setRiskThresholds, resetRiskThresholds } from "../../api/policyApi";

export default function RiskThresholdsCard({ riskThresholds, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localThresholds, setLocalThresholds] = useState(riskThresholds?.thresholds || {});

  React.useEffect(() => {
    if (riskThresholds?.thresholds) {
      setLocalThresholds(riskThresholds.thresholds);
    }
  }, [riskThresholds]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await setRiskThresholds(localThresholds);
      setEditing(false);
      onUpdate?.();
    } catch (err) {
      console.error("Failed to update thresholds:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset all thresholds to default values?")) return;
    setLoading(true);
    try {
      await resetRiskThresholds();
      onUpdate?.();
    } catch (err) {
      console.error("Failed to reset thresholds:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!riskThresholds) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-40 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const thresholds = riskThresholds.thresholds || {};
  const defaults = riskThresholds.resource_defaults || {};

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="text-orange-500" /> Risk Thresholds
        </h2>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setLocalThresholds(riskThresholds.thresholds || {});
                }}
                className="px-3 py-1 text-sm bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={handleReset}
                disabled={loading}
                className="px-3 py-1 text-sm bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 flex items-center gap-1"
              >
                <RefreshCw size={14} /> Reset
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-3 bg-gray-50 rounded-lg border">
          <div className="flex justify-between items-center">
            <span className="font-medium text-sm">Global Max Risk</span>
            {editing ? (
              <input
                type="number"
                min="0"
                max="100"
                value={localThresholds.global_max_risk || 75}
                onChange={(e) =>
                  setLocalThresholds({
                    ...localThresholds,
                    global_max_risk: parseInt(e.target.value) || 0,
                  })
                }
                className="w-20 px-2 py-1 border rounded text-sm"
              />
            ) : (
              <Badge color={thresholds.global_max_risk > 75 ? "red" : "green"}>
                {thresholds.global_max_risk || 75}
              </Badge>
            )}
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg border">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-sm flex items-center gap-1">
              <AlertTriangle size={14} /> Critical Resources
            </span>
            {editing ? (
              <input
                type="number"
                min="0"
                max="100"
                value={localThresholds.critical_resource_threshold || 20}
                onChange={(e) =>
                  setLocalThresholds({
                    ...localThresholds,
                    critical_resource_threshold: parseInt(e.target.value) || 0,
                  })
                }
                className="w-20 px-2 py-1 border rounded text-sm"
              />
            ) : (
              <Badge color="red">{thresholds.critical_resource_threshold || 20}</Badge>
            )}
          </div>
          <p className="text-xs text-gray-500">Default: {defaults.critical || 20}</p>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg border">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-sm">High Sensitivity</span>
            {editing ? (
              <input
                type="number"
                min="0"
                max="100"
                value={localThresholds.high_resource_threshold || 30}
                onChange={(e) =>
                  setLocalThresholds({
                    ...localThresholds,
                    high_resource_threshold: parseInt(e.target.value) || 0,
                  })
                }
                className="w-20 px-2 py-1 border rounded text-sm"
              />
            ) : (
              <Badge color="orange">{thresholds.high_resource_threshold || 30}</Badge>
            )}
          </div>
          <p className="text-xs text-gray-500">Default: {defaults.high || 30}</p>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg border">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-sm">Medium Sensitivity</span>
            {editing ? (
              <input
                type="number"
                min="0"
                max="100"
                value={localThresholds.medium_resource_threshold || 50}
                onChange={(e) =>
                  setLocalThresholds({
                    ...localThresholds,
                    medium_resource_threshold: parseInt(e.target.value) || 0,
                  })
                }
                className="w-20 px-2 py-1 border rounded text-sm"
              />
            ) : (
              <Badge color="yellow">{thresholds.medium_resource_threshold || 50}</Badge>
            )}
          </div>
          <p className="text-xs text-gray-500">Default: {defaults.medium || 50}</p>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg border">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-sm">Continuous Auth Max</span>
            {editing ? (
              <input
                type="number"
                min="0"
                max="100"
                value={localThresholds.continuous_auth_max_risk || 75}
                onChange={(e) =>
                  setLocalThresholds({
                    ...localThresholds,
                    continuous_auth_max_risk: parseInt(e.target.value) || 0,
                  })
                }
                className="w-20 px-2 py-1 border rounded text-sm"
              />
            ) : (
              <Badge color={thresholds.continuous_auth_max_risk > 75 ? "red" : "green"}>
                {thresholds.continuous_auth_max_risk || 75}
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Max risk for continuous authentication
          </p>
        </div>
      </div>
    </Card>
  );
}

