import React, { useState, useEffect } from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { Settings, Plus, Trash2, Save, X, Shield, Lock, Clock, AlertCircle } from "lucide-react";
import { getUserFromToken, isAdmin } from "../../utils/userUtils";

const API_BASE = "http://localhost:5002";

export default function AdminResourceEditor({ resources, onUpdate }) {
  const token = localStorage.getItem("token");
  const user = getUserFromToken(token);
  const isUserAdmin = isAdmin(user);

  const [editingResource, setEditingResource] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!isUserAdmin) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <Shield className="text-gray-400 mb-2" size={32} />
          <h2 className="text-lg font-semibold mb-2">Resource Policy Editor</h2>
          <p className="text-sm text-center">
            Admin access required to edit resource policies.
          </p>
        </div>
      </Card>
    );
  }

  const handleEdit = (resource) => {
    setEditingResource({ ...resource });
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setEditingResource(null);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!editingResource) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE}/api/policy/admin/resource-policies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resource: editingResource.name,
          updates: {
            sensitivity: editingResource.sensitivity,
            require_mfa: editingResource.require_mfa,
            require_low_risk: editingResource.require_low_risk,
            session_timeout_minutes: parseInt(editingResource.session_timeout_minutes) || 30,
            audit_all_access: editingResource.audit_all_access,
            time_restricted: editingResource.time_restricted,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update resource");
      }

      setSuccess("Resource policy updated successfully!");
      setEditingResource(null);
      setTimeout(() => {
        setSuccess(null);
        onUpdate?.();
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to update resource policy");
    } finally {
      setLoading(false);
    }
  };

  const handleAddResource = async () => {
    const name = prompt("Enter resource name:");
    if (!name) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/policy/admin/add-resource`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          policy: {
            sensitivity: "medium",
            require_mfa: false,
            require_low_risk: true,
            session_timeout_minutes: 30,
            audit_all_access: false,
            time_restricted: false,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add resource");
      }

      setSuccess("Resource added successfully!");
      setTimeout(() => {
        setSuccess(null);
        onUpdate?.();
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to add resource");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveResource = async (resourceName) => {
    if (!window.confirm(`Are you sure you want to remove "${resourceName}"?`)) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/policy/admin/remove-resource`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: resourceName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove resource");
      }

      setSuccess("Resource removed successfully!");
      setTimeout(() => {
        setSuccess(null);
        onUpdate?.();
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to remove resource");
    } finally {
      setLoading(false);
    }
  };

  const getSensitivityColor = (sensitivity) => {
    switch (sensitivity?.toLowerCase()) {
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

  const resourcesList = resources?.resources || [];

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="text-orange-500" /> Resource Policy Editor
        </h2>
        <button
          onClick={handleAddResource}
          disabled={loading}
          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
        >
          <Plus size={14} /> Add Resource
        </button>
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

      {resourcesList.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No resources configured</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resourcesList.map((resource, index) => {
            const isEditing = editingResource?.name === resource.name;

            return (
              <div
                key={index}
                className="p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{resource.name}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          disabled={loading}
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                        >
                          <Save size={12} /> Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-2 py-1 text-xs bg-gray-300 rounded hover:bg-gray-400 flex items-center gap-1"
                        >
                          <X size={12} /> Cancel
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium">Sensitivity</label>
                        <select
                          value={editingResource.sensitivity}
                          onChange={(e) =>
                            setEditingResource({
                              ...editingResource,
                              sensitivity: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 text-sm border rounded"
                        >
                          <option value="critical">Critical</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-medium">Session Timeout (min)</label>
                        <input
                          type="number"
                          value={editingResource.session_timeout_minutes}
                          onChange={(e) =>
                            setEditingResource({
                              ...editingResource,
                              session_timeout_minutes: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 text-sm border rounded"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingResource.require_mfa}
                          onChange={(e) =>
                            setEditingResource({
                              ...editingResource,
                              require_mfa: e.target.checked,
                            })
                          }
                          className="rounded"
                        />
                        <label className="text-xs">Require MFA</label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingResource.require_low_risk}
                          onChange={(e) =>
                            setEditingResource({
                              ...editingResource,
                              require_low_risk: e.target.checked,
                            })
                          }
                          className="rounded"
                        />
                        <label className="text-xs">Require Low Risk</label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingResource.audit_all_access}
                          onChange={(e) =>
                            setEditingResource({
                              ...editingResource,
                              audit_all_access: e.target.checked,
                            })
                          }
                          className="rounded"
                        />
                        <label className="text-xs">Audit All Access</label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingResource.time_restricted}
                          onChange={(e) =>
                            setEditingResource({
                              ...editingResource,
                              time_restricted: e.target.checked,
                            })
                          }
                          className="rounded"
                        />
                        <label className="text-xs">Time Restricted</label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Shield className="text-blue-500" size={16} />
                        <span className="font-semibold text-sm">{resource.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge color={getSensitivityColor(resource.sensitivity)}>
                          {resource.sensitivity || "medium"}
                        </Badge>
                        <button
                          onClick={() => handleEdit(resource)}
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        {resource.sensitivity !== "critical" && (
                          <button
                            onClick={() => handleRemoveResource(resource.name)}
                            disabled={loading}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <Lock size={12} className="text-gray-400" />
                        <span className="text-gray-600">MFA:</span>
                        <Badge color={resource.require_mfa ? "green" : "gray"} className="text-[10px]">
                          {resource.require_mfa ? "Required" : "Not Required"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-gray-400" />
                        <span className="text-gray-600">Timeout:</span>
                        <span className="font-medium">{resource.session_timeout_minutes || 30} min</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <AlertCircle size={12} className="text-gray-400" />
                        <span className="text-gray-600">Audit:</span>
                        <Badge color={resource.audit_all_access ? "blue" : "gray"} className="text-[10px]">
                          {resource.audit_all_access ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1">
                        <Shield size={12} className="text-gray-400" />
                        <span className="text-gray-600">Low Risk:</span>
                        <Badge color={resource.require_low_risk ? "green" : "gray"} className="text-[10px]">
                          {resource.require_low_risk ? "Required" : "Not Required"}
                        </Badge>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

