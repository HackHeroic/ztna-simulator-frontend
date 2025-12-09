import Card from "../ui/Card";
import { Cpu, AlertTriangle, Lock } from "lucide-react";
import RiskFactorTable from "../ui/RiskFactorTable";
import { getUserFromToken, canViewDevicePolicyContext } from "../../utils/userUtils";

export default function PolicyDeviceContext({ policies }) {
  const token = localStorage.getItem("token");
  const user = getUserFromToken(token);
  const canView = canViewDevicePolicyContext(user);

  if (!canView) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <Lock className="text-gray-400 mb-2" size={32} />
          <h2 className="text-lg font-semibold mb-2">Device & Policy Context</h2>
          <p className="text-sm text-center">
            This section is restricted to Security personnel, Administrators, and users with clearance level 3 or higher.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Your role: {user?.role || "Unknown"} | Clearance: {user?.clearance || 0}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Cpu className="text-purple-500" /> Device & Policy Context
        <span className="ml-auto text-xs text-gray-500">
          {user?.role} (Clearance {user?.clearance})
        </span>
      </h2>

      <p className="font-medium mb-2">Device Fingerprint</p>
      <ul className="text-sm text-gray-700 mb-6">
        <li>OS: {navigator.userAgent.includes("Mac") ? "macOS" : "Windows/Other"}</li>
        <li>Browser: {navigator.userAgent}</li>
        <li>Encrypted: Yes</li>
        <li>Rooted: No</li>
      </ul>

      <div className="border-t pt-4">
        <h3 className="font-medium flex items-center gap-2">
          <AlertTriangle className="text-red-500" /> Risk Factor Dictionary
        </h3>
        <RiskFactorTable riskFactors={policies?.risk_factors} />
      </div>

      <div className="border-t pt-4 mt-4">
        <details>
          <summary className="cursor-pointer text-sm underline">View raw policy JSON</summary>
          <pre className="bg-gray-900 text-white p-4 rounded-xl mt-2 text-xs max-h-64 overflow-auto">
            {JSON.stringify(policies, null, 2)}
          </pre>
        </details>
      </div>
    </Card>
  );
}
