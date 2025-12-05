import React, { useEffect, useState } from "react";
import { ShieldCheck, ShieldX, Shield } from "lucide-react";

/* ============================================================
   🔥 API: Evaluate Policy
   ============================================================ */
async function evaluatePolicy(resource) {
  try {
    const payload = {
      user: { email: "test@example.com" },
      resource,
      device: {
        os_type: navigator.userAgent.toLowerCase().includes("mac")
          ? "macOS"
          : "Windows",
        os_version: "11",
        rooted: false,
        encrypted: true,
      },
      location: {},
      context: { mfa_verified: true },
    };

    const response = await fetch("http://localhost:5002/api/policy/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    return {
      decision: data.decision,
      risk_score: data.risk_score,
      threshold: data.threshold,
    };
  } catch (err) {
    console.error("Policy evaluation failed:", err);
    return {
      decision: "DENY",
      risk_score: 0,
      threshold: 0,
    };
  }
}

/* ============================================================
   🔥 UI Component
   ============================================================ */
export default function PolicyCard({ title }) {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  const resources = [
    { resource: "database-prod", desc: "Production DB Access" },
    { resource: "admin-panel", desc: "Admin Panel Root Access" },
    { resource: "file-server", desc: "Internal Document Server" },
    { resource: "vpn-gateway", desc: "Corporate VPN Gateway" },
  ];

  const loadPolicies = async () => {
    setLoading(true);

    const results = [];
    for (const r of resources) {
      const api = await evaluatePolicy(r.resource);

      results.push({
        resource: r.resource,
        desc: r.desc,
        decision: api.decision,
        risk_score: api.risk_score,
        threshold: api.threshold,
      });
    }

    setPolicies(results);
    setLoading(false);
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  return (
    <div className="relative bg-white/90 border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

      {/* Accent Line */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 via-pink-500 to-violet-600"></div>

      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Shield className="text-orange-500 w-5 h-5" />
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>

        <button
          onClick={loadPolicies}
          className="text-xs px-3 py-1 bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200"
        >
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="p-5">
        {loading ? (
          <div className="text-center text-gray-400 py-8 animate-pulse">
            Evaluating policies...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left pb-3">Resource</th>
                <th className="text-left pb-3">Description</th>
                <th className="text-left pb-3">Risk</th>
                <th className="text-left pb-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {policies.map((p, idx) => (
                <tr key={idx} className="border-t border-gray-100">
                  <td className="py-3 font-medium text-gray-800">{p.resource}</td>
                  <td className="py-3 text-gray-600">{p.desc}</td>

                  {/* Risk Score */}
                  <td className="py-3 text-gray-700">
                    <span className="font-semibold">{p.risk_score}</span>
                    {p.threshold ? (
                      <span className="text-gray-400"> / {p.threshold}</span>
                    ) : null}
                  </td>

                  {/* Decision Badge */}
                  <td className="py-3">
                    {p.decision === "ALLOW" ? (
                      <span className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                        GRANTED
                      </span>
                    ) : p.decision === "MFA_REQUIRED" ? (
                      <span className="inline-flex items-center px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                        MFA REQUIRED
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                        <ShieldX className="w-3.5 h-3.5 mr-1" />
                        DENIED
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
