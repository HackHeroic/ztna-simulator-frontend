import React, { useState, useEffect } from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Modal from "../ui/Modal";
import { Settings, Plus, Trash2, Save, X, Shield, Edit } from "lucide-react";
import { getUserFromToken, isAdmin } from "../../utils/userUtils";

const API_BASE = "http://localhost:5002";

export default function AdminRiskFactorsEditor({ policies, onUpdate }) {
  const token = localStorage.getItem("token");
  const user = getUserFromToken(token);
  const isUserAdmin = isAdmin(user);

  const [editing, setEditing] = useState(false);
  const [editingFactor, setEditingFactor] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [localRiskFactors, setLocalRiskFactors] = useState({});
  const [newFactor, setNewFactor] = useState({ name: "", value: 0 });

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
      setEditingFactor(null);
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

  const handleAddFactor = async () => {
    if (!newFactor.name.trim()) {
      setError("Factor name is required");
      return;
    }

    const factorKey = newFactor.name.trim().toLowerCase().replace(/\s+/g, "_");
    
    if (localRiskFactors[factorKey]) {
      setError("Risk factor already exists");
      return;
    }

    setLocalRiskFactors({
      ...localRiskFactors,
      [factorKey]: parseInt(newFactor.value) || 0,
    });

    setNewFactor({ name: "", value: 0 });
    setShowAddModal(false);
    setError(null);
  };

  const handleDeleteFactor = (factorKey) => {
    if (!window.confirm(`Delete risk factor "${factorKey.replace(/_/g, " ")}"?`)) {
      return;
    }

    const updated = { ...localRiskFactors };
    delete updated[factorKey];
    setLocalRiskFactors(updated);
  };

  const handleEditFactor = (factorKey, value) => {
    setEditingFactor({ key: factorKey, value });
  };

  const handleSaveFactor = () => {
    if (editingFactor) {
      setLocalRiskFactors({
        ...localRiskFactors,
        [editingFactor.key]: parseInt(editingFactor.value) || 0,
      });
      setEditingFactor(null);
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
                <Save size={14} /> Save All
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setEditingFactor(null);
                  setLocalRiskFactors(policies?.risk_factors || {});
                  setError(null);
                }}
                className="px-3 py-1 text-sm bg-gray-300 rounded hover:bg-gray-400 flex items-center gap-1"
              >
                <X size={14} /> Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
              >
                <Plus size={14} /> Add
              </button>
              <button
                onClick={() => setEditing(true)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit
              </button>
            </>
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
        {Object.entries(riskFactors).map(([factor, value]) => {
          const isEditingThis = editingFactor?.key === factor;

          return (
            <div
              key={factor}
              className="p-3 bg-gray-50 rounded-lg border flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <span className="font-medium text-sm capitalize">
                  {factor.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isEditingThis ? (
                  <>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editingFactor.value}
                      onChange={(e) =>
                        setEditingFactor({
                          ...editingFactor,
                          value: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-20 px-2 py-1 border rounded text-sm"
                    />
                    <button
                      onClick={handleSaveFactor}
                      className="p-1 text-green-600 hover:bg-green-100 rounded"
                    >
                      <Save size={14} />
                    </button>
                    <button
                      onClick={() => setEditingFactor(null)}
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <Badge color={value >= 30 ? "red" : value >= 15 ? "orange" : "yellow"}>
                      {value}
                    </Badge>
                    {editing && (
                      <>
                        <button
                          onClick={() => handleEditFactor(factor, value)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteFactor(factor)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Factor Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewFactor({ name: "", value: 0 });
          setError(null);
        }}
        title="Add New Risk Factor"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Factor Name
            </label>
            <input
              type="text"
              value={newFactor.name}
              onChange={(e) => setNewFactor({ ...newFactor, name: e.target.value })}
              placeholder="e.g., suspicious_activity"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use underscores for spaces (e.g., suspicious_activity)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Risk Value (0-100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={newFactor.value}
              onChange={(e) =>
                setNewFactor({ ...newFactor, value: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleAddFactor}
              disabled={!newFactor.name.trim()}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add Factor
            </button>
            <button
              onClick={() => {
                setShowAddModal(false);
                setNewFactor({ name: "", value: 0 });
                setError(null);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
