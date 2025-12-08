import Card from "../ui/Card";
import { Cpu, AlertTriangle } from "lucide-react";
import RiskFactorTable from "../ui/RiskFactorTable";

export default function PolicyDeviceContext({ policies }) {
  return (
    <Card>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Cpu className="text-purple-500" /> Device & Policy Context
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
