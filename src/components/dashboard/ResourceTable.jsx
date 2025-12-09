import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { Info, Shield, ShieldCheck, ShieldX, ShieldAlert } from "lucide-react";
import { getRiskMeta } from "../../utils/riskUtils";

export default function ResourceTable({ resourceResults }) {
  const resources = Object.keys(resourceResults || {});

  // If backend didn't return any resources yet (initial load)
  const noData = !resourceResults || resources.length === 0;

  return (
    <Card>
      {/* Header */}
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Shield className="text-orange-500" /> Resource Access Decisions
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm table-auto">
          <thead className="uppercase text-gray-500 text-xs bg-gray-50">
            <tr>
              <th className="text-left py-2 px-3 w-44">Resource</th>
              <th className="text-left py-2 px-3 w-36">Decision</th>
              <th className="text-left py-2 px-3 w-20">Risk</th>
              <th className="text-left py-2 px-3 w-64">Details</th>
            </tr>
          </thead>

          <tbody>
            {/* SHOW EMPTY STATE */}
            {noData && (
              <tr>
                <td
                  colSpan="4"
                  className="py-6 px-3 text-center text-gray-500 italic"
                >
                  No resource data yet...
                </td>
              </tr>
            )}

            {/* NORMAL RESOURCE ROWS */}
            {resources.map((r) => {
              const res = resourceResults[r] || {};

              const score = res.risk_score ?? "--";
              const risk = getRiskMeta(res.risk_score || 0);

              return (
                <tr key={r} className="border-t align-top">
                  {/* RESOURCE NAME */}
                  <td className="py-3 px-3 font-medium text-gray-800 whitespace-nowrap">
                    {r}
                  </td>

                  {/* DECISION */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1">

                      {res.decision === "ALLOW" && (
                        <Badge color="green">
                          <ShieldCheck size={12} /> ALLOW
                        </Badge>
                      )}

                      {res.decision === "DENY" && (
                        <Badge color="red">
                          <ShieldX size={12} /> DENY
                        </Badge>
                      )}

                      {res.decision === "MFA_REQUIRED" && (
                        <Badge color="yellow">
                          <ShieldAlert size={12} /> MFA REQUIRED
                        </Badge>
                      )}

                      {/* DEFAULT / PENDING */}
                      {!res.decision && (
                        <Badge color="gray">
                          <Shield size={12} /> PENDING
                        </Badge>
                      )}
                    </div>
                  </td>

                  {/* RISK SCORE */}
                  <td className={"py-3 px-3 font-semibold " + risk.color}>
                    {score}
                  </td>

                  {/* DETAILS */}
                  <td className="py-3 px-3 text-blue-600">
                    <details className="group">
                      <summary className="cursor-pointer flex items-center gap-1 list-none hover:text-blue-800 transition">
                        <Info size={12} /> View
                      </summary>

                      <div className="ml-4 mt-2 p-2 bg-gray-50 border rounded-lg max-h-40 overflow-auto text-xs space-y-2 shadow-sm">

                        {/* Reason */}
                        <p>
                          <span className="font-semibold text-gray-700">
                            Reason:
                          </span>{" "}
                          {res.reason || "None"}
                        </p>

                        {/* Risk Factors */}
                        <div>
                          <p className="font-semibold text-gray-700 mb-1">
                            Risk Factors:
                          </p>
                          <ul className="list-disc ml-5 space-y-0.5">
                            {res.risk_factors?.length ? (
                              res.risk_factors.map((f, i) => (
                                <li key={i}>{f}</li>
                              ))
                            ) : (
                              <li className="text-gray-500">None</li>
                            )}
                          </ul>
                        </div>

                        {/* Threshold */}
                        {res.threshold !== undefined && (
                          <p className="text-gray-700">
                            <span className="font-semibold">Threshold:</span>{" "}
                            {res.threshold}
                          </p>
                        )}

                        {/* VPN Status */}
                        {res.vpn_connected !== undefined && (
                          <p className="text-gray-700">
                            <span className="font-semibold">VPN:</span>{" "}
                            {res.vpn_connected ? "Connected" : "Not used"}
                          </p>
                        )}
                      </div>
                    </details>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
