import React from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { Database, Shield, Lock, Clock, AlertCircle } from "lucide-react";

export default function ResourcesList({ resources }) {
  if (!resources || resources.error) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-40 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const resourcesList = resources.resources || [];
  const count = resources.count || 0;

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

  const getSensitivityIcon = (sensitivity) => {
    switch (sensitivity?.toLowerCase()) {
      case "critical":
        return <AlertCircle className="text-red-500" size={16} />;
      case "high":
        return <Shield className="text-orange-500" size={16} />;
      default:
        return <Database className="text-blue-500" size={16} />;
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Database className="text-orange-500" />
        <h2 className="text-lg font-semibold">Resources & Policies</h2>
        <Badge color="blue" className="ml-auto">
          {count} resources
        </Badge>
      </div>

      {resourcesList.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Database className="mx-auto mb-2 text-gray-400" size={32} />
          <p className="text-sm">No resources configured</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resourcesList.map((resource, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getSensitivityIcon(resource.sensitivity)}
                  <span className="font-semibold text-sm">{resource.name}</span>
                </div>
                <Badge color={getSensitivityColor(resource.sensitivity)}>
                  {resource.sensitivity || "medium"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <Shield size={12} className="text-gray-400" />
                  <span className="text-gray-600">MFA:</span>
                  <Badge color={resource.require_mfa ? "green" : "gray"} className="text-[10px]">
                    {resource.require_mfa ? "Required" : "Not Required"}
                  </Badge>
                </div>

                <div className="flex items-center gap-1">
                  <Lock size={12} className="text-gray-400" />
                  <span className="text-gray-600">Low Risk:</span>
                  <Badge color={resource.require_low_risk ? "green" : "gray"} className="text-[10px]">
                    {resource.require_low_risk ? "Required" : "Not Required"}
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
              </div>

              {resource.time_restricted && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <span className="text-xs text-orange-600 font-medium">
                    ⏰ Time Restricted Access
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

