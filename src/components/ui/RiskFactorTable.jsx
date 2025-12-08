import Badge from "./Badge";
import { getRiskMeta } from "../../utils/riskUtils";
import { formatRiskKey } from "../../utils/formatUtils";

export default function RiskFactorTable({ riskFactors }) {
  if (!riskFactors) return <p>No risk factors loaded.</p>;

  return (
    <div className="mt-3 border rounded-xl max-h-48 overflow-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 uppercase">
            <th>Key</th><th>Description</th><th>Weight</th><th>Severity</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(riskFactors).map(([key, w]) => {
            const meta = getRiskMeta(w);

            return (
              <tr key={key} className="border-t">
                <td className="px-3 py-2 font-mono">{key}</td>
                <td className="px-3 py-2">{formatRiskKey(key)}</td>
                <td className="px-3 py-2">{w}</td>
                <td className="px-3 py-2"><Badge color={meta.badge}>{meta.label}</Badge></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
