import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { Server } from "lucide-react";

export default function HealthCard({ health }) {
  return (
    <Card>
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <Server className="text-teal-500" /> Backend Health
      </h2>

      {health ? (
        <div className="text-sm">
          <p>Status: <Badge color={health.status === "healthy" ? "green" : "red"}>{health.status}</Badge></p>
          <p>Active Sessions: {health.active_sessions}</p>
          <p>Anomalies Logged: {health.anomalies_count}</p>
          <p>Timestamp: {health.timestamp}</p>
        </div>
      ) : (
        <p className="text-gray-500 text-sm">Backend unavailable.</p>
      )}
    </Card>
  );
}
