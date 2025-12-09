import React from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { Clock, Shield, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export default function ContinuousAuthHistory({ history }) {
  if (!history || history.error) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-40 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const historyList = history.history || [];
  const totalRequests = history.total_requests || 0;
  const filteredRequests = history.filtered_requests || 0;

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="text-orange-500" />
        <h2 className="text-lg font-semibold">Continuous Auth History</h2>
        <Badge color="blue" className="ml-auto">
          {filteredRequests} requests
        </Badge>
      </div>

      <div className="mb-3 text-sm text-gray-600">
        <span>Total: {totalRequests}</span>
        {filteredRequests !== totalRequests && (
          <span className="ml-2">Filtered: {filteredRequests}</span>
        )}
      </div>

      {historyList.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Shield className="mx-auto mb-2 text-gray-400" size={32} />
          <p className="text-sm">No continuous auth requests yet</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {historyList.slice().reverse().map((entry, index) => {
            const isSuccess = entry.success;
            const riskScore = entry.risk_score || 0;
            const status = entry.status || "unknown";
            const timestamp = entry.timestamp || entry.response_time || "Unknown";
            const location = entry.location || "Unknown";
            const clientIp = entry.client_ip || "Unknown";

            const getRiskColor = (score) => {
              if (score >= 75) return "red";
              if (score >= 50) return "orange";
              if (score >= 30) return "yellow";
              return "green";
            };

            return (
              <div
                key={index}
                className="p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isSuccess ? (
                      <CheckCircle2 className="text-green-500" size={16} />
                    ) : (
                      <XCircle className="text-red-500" size={16} />
                    )}
                    <span className="font-medium text-sm">{status.toUpperCase()}</span>
                  </div>
                  <Badge color={getRiskColor(riskScore)}>
                    Risk: {riskScore}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span className="truncate">{new Date(timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield size={12} />
                    <span className="truncate">{location}</span>
                  </div>
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  <span>IP: {clientIp}</span>
                </div>

                {!isSuccess && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                    <AlertTriangle size={12} />
                    <span>Authentication failed</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

