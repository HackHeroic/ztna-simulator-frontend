import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Stat from "../ui/Stat";

import {
  AlertTriangle,
  MapPin,
  Activity,
  Globe,
  Wifi,
  Radio,
} from "lucide-react";

import { getRiskMeta } from "../../utils/riskUtils";

export default function SecurityOverview({
  loading,
  riskScore,
  riskFactors = [],
  ip,
  location = {},
  anomalyCount,
  recentAnomalyCount,
  anomalyDetails,
  anomalyRiskLevel,
  sessionStatus,
}) {
  /* ----------------------------------------------------
     FORCE LOADING IF ANY BACKEND FIELD IS MISSING
  ---------------------------------------------------- */
  const dataNotReady =
    loading ||
    riskScore === null ||
    riskScore === undefined ||
    !ip ||
    !location.city ||
    !location.country ||
    anomalyCount === null ||
    anomalyCount === undefined ||
    !sessionStatus ||
    riskFactors.length === 0;

  if (dataNotReady) {
    return (
      <Card>
        <div className="space-y-6">

          {/* Header skeleton */}
          <div className="flex justify-between items-center">
            <div className="h-5 w-44 bg-orange-200/40 rounded-md animate-pulse"></div>
            <div className="h-5 w-24 bg-orange-200/40 rounded-md animate-pulse"></div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="
                  h-16 rounded-xl 
                  bg-orange-100/40 
                  border border-orange-200/50
                  animate-pulse
                "
              ></div>
            ))}
          </div>

          {/* Network info + session box */}
          <div className="flex justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div className="h-4 w-32 bg-orange-200/50 rounded-md animate-pulse"></div>
              <div className="h-4 w-48 bg-orange-100/40 rounded-md animate-pulse"></div>

              <div className="h-4 w-28 bg-orange-200/50 rounded-md animate-pulse mt-2"></div>
              <div className="h-4 w-40 bg-orange-100/40 rounded-md animate-pulse"></div>
            </div>

            <div
              className="
              w-44 h-24 rounded-xl 
              bg-orange-100/40 
              border border-orange-200/60 
              animate-pulse
            "
            ></div>
          </div>

          {/* Risk factor skeleton */}
          <div className="space-y-3 mt-4">
            <div className="h-4 w-36 bg-orange-200/50 rounded-md animate-pulse"></div>

            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-3 w-full bg-orange-100/40 rounded-md animate-pulse"
              ></div>
            ))}
          </div>

        </div>
      </Card>
    );
  }

  /* ----------------------------------------------------
     ALL DATA READY — NORMAL VIEW
  ---------------------------------------------------- */
  const meta = getRiskMeta(riskScore);

  return (
    <Card>

      {/* Header */}
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <AlertTriangle className="text-orange-500" />
          Security Overview
        </h2>
        <Badge color={meta.badge}>Overall: {meta.label}</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Stat icon={AlertTriangle} label="Risk Score" value={riskScore} />

        <Stat
          icon={MapPin}
          label="Location"
          value={`${location.city}, ${location.country}`}
        />

        <Stat icon={Activity} label="Anomalies" value={anomalyCount} />
      </div>

      {/* IP + ISP + Session */}
      <div className="flex justify-between gap-6">
        <div className="flex-1 space-y-3">
          <div>
            <p className="font-medium">External IP</p>
            <p className="flex items-center gap-1">
              <Globe size={14} /> {ip}
            </p>
          </div>

          <div>
            <p className="font-medium">ISP</p>
            <p className="flex items-center gap-1">
              <Wifi size={14} /> {location.isp}
            </p>
          </div>
        </div>

        <div className="p-4 w-48 border rounded-xl bg-orange-50 border-orange-200">
          <p className="font-semibold flex items-center gap-1 text-orange-600">
            <Radio className="text-orange-600" />{" "}
            Session: {sessionStatus.status?.toUpperCase()}
          </p>
          <p className="text-sm mt-1">
            Last verified: {sessionStatus.last_verified}
          </p>
          <p className="text-sm">Risk: {sessionStatus.risk_score}</p>
        </div>
      </div>

      {/* Risk Factors */}
      <div className="mt-6">
        <p className="font-medium mb-2">Risk Factors</p>

        <ul className="list-disc ml-4 space-y-1">
          {riskFactors.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </div>

    </Card>
  );
}
