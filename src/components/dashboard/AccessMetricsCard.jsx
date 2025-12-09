import React from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { BarChart3, Network, Shield, TrendingUp } from "lucide-react";

export default function AccessMetricsCard({ accessMetrics }) {
  if (!accessMetrics || accessMetrics.error) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-40 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const overall = accessMetrics.overall || {};
  const vpnStats = overall.vpn || {};
  const nonVpnStats = overall.non_vpn || {};

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="text-orange-500" />
        <h2 className="text-lg font-semibold">Access Metrics</h2>
      </div>

      <div className="space-y-4">
        {/* Overall Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Network className="text-blue-600" size={16} />
              <span className="font-semibold text-sm">VPN Access</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-semibold">{vpnStats.count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Allowed:</span>
                <Badge color="green" className="text-[10px]">
                  {vpnStats.allowed || 0}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Denied:</span>
                <Badge color="red" className="text-[10px]">
                  {vpnStats.denied || 0}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Avg Risk:</span>
                <span className="font-semibold">{vpnStats.avg_risk_score || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Allow Rate:</span>
                <span className="font-semibold">{vpnStats.allow_rate || 0}%</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="text-gray-600" size={16} />
              <span className="font-semibold text-sm">Non-VPN Access</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-semibold">{nonVpnStats.count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Allowed:</span>
                <Badge color="green" className="text-[10px]">
                  {nonVpnStats.allowed || 0}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Denied:</span>
                <Badge color="red" className="text-[10px]">
                  {nonVpnStats.denied || 0}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Avg Risk:</span>
                <span className="font-semibold">{nonVpnStats.avg_risk_score || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Allow Rate:</span>
                <span className="font-semibold">{nonVpnStats.allow_rate || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison */}
        {vpnStats.count > 0 && nonVpnStats.count > 0 && (
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-orange-600" size={14} />
              <span className="font-semibold text-sm">Comparison</span>
            </div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>VPN Allow Rate:</span>
                <span className="font-semibold text-green-600">
                  {vpnStats.allow_rate || 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Non-VPN Allow Rate:</span>
                <span className="font-semibold text-gray-600">
                  {nonVpnStats.allow_rate || 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Risk Difference:</span>
                <span className="font-semibold">
                  {((vpnStats.avg_risk_score || 0) - (nonVpnStats.avg_risk_score || 0)).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Total Attempts */}
        <div className="text-center p-2 bg-gray-50 rounded border">
          <span className="text-xs text-gray-600">
            Total Access Attempts:{" "}
            <span className="font-semibold">{accessMetrics.total_attempts || 0}</span>
          </span>
        </div>
      </div>
    </Card>
  );
}

