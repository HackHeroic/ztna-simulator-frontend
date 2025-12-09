import React, { useState, useEffect } from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { Settings, Save, X, Shield } from "lucide-react";
import { getUserFromToken, isAdmin } from "../../utils/userUtils";

const API_BASE = "http://localhost:5002";

export default function AdminRiskFactorsEditor({ policies, onUpdate }) {
  const token = localStorage.getItem("token");
  const user = getUserFromToken(token);
  const isUserAdmin = isAdmin(user);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [localRiskFactors, setLocalRiskFactors] = useState({});

  useEffect(() => {
    if (policies?.risk_factors) {
      setLocalRiskFactors(policies.risk_factors);
    }
  }, [policies]);

  if (!isUserAdmin) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <Shield className="text-gray-400 mb-2" size={32} />
          <h2 className="text-lg font-semibold mb-2">Risk Factors Editor</h2>
          <p className="text-sm text-center">
            Admin access required to edit risk factors.
          </p>
        </div>
      </Card>
    );
  }

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE}/api/policy/admin/risk-factors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(localRiskFactors),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update risk factors");
      }

      setSuccess("Risk factors updated successfully!");
      setEditing(false);
      setTimeout(() => {
        setSuccess(null);
        onUpdate?.();
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to update risk factors");
    } finally {
      setLoading(false);
    }
  };

  const riskFactors = localRiskFactors || {};

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="text-orange-500" /> Risk Factors Editor
        </h2>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
              >
                <Save size={14} /> Save
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setLocalRiskFactors(policies?.risk_factors || {});
                  setError(null);
                }}
                className="px-3 py-1 text-sm bg-gray-300 rounded hover:bg-gray-400 flex items-center gap-1"
              >
                <X size={14} /> Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          {success}
        </div>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {Object.entries(riskFactors).map(([factor, value]) => (
          <div
            key={factor}
            className="p-3 bg-gray-50 rounded-lg border flex items-center justify-between"
          >
            <div className="flex-1">
              <span className="font-medium text-sm">{factor.replace(/_/g, " ")}</span>
            </div>
            {editing ? (
              <input
                type="number"
                min="0"
                max="100"
                value={value}
                onChange={(e) =>
                  setLocalRiskFactors({
                    ...localRiskFactors,
                    [factor]: parseInt(e.target.value) || 0,
                  })
                }
                className="w-20 px-2 py-1 border rounded text-sm"
              />
            ) : (
              <Badge color={value >= 30 ? "red" : value >= 15 ? "orange" : "yellow"}>
                {value}
              </Badge>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

