import { AlertTriangle, Flame, MapPin, Clock } from "lucide-react";

export default function AttackSummary({
  anomalyCount,
  recentAnomalyCount,
  anomalyDetails,
}) {
  if (!anomalyDetails || anomalyDetails.length === 0) return null;

  const latest = anomalyDetails[anomalyDetails.length - 1];

  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-2xl shadow-sm flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Flame className="text-red-600" size={28} />
        <h2 className="text-xl font-semibold text-red-700">
          Threat & Anomaly Summary
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl shadow border border-red-100">
          <p className="text-sm text-gray-500">Total Anomalies</p>
          <p className="text-2xl font-bold text-red-700">{anomalyCount}</p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow border border-red-100">
          <p className="text-sm text-gray-500">Recent (1 hr)</p>
          <p className="text-2xl font-bold text-orange-600">
            {recentAnomalyCount}
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow border border-red-100">
          <p className="text-sm text-gray-500">Highest Risk</p>
          <p className="text-2xl font-bold text-red-600">{latest.risk}</p>
        </div>
      </div>

      <div className="text-sm mt-2">
        <p className="font-medium flex items-center gap-2">
          <MapPin size={16} />
          Location:{" "}
          <span className="text-gray-700">
            {latest.location.city}, {latest.location.country}
          </span>
        </p>

        <p className="font-medium flex items-center gap-2 mt-2">
          <Clock size={16} />
          Time: <span className="text-gray-700">{latest.time}</span>
        </p>

        <div className="mt-3">
          <p className="font-semibold text-gray-700">Risk Factors:</p>
          <ul className="ml-5 list-disc text-gray-600 text-sm">
            {latest.risk_factors.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
