import React, { useEffect, useState } from "react";
import { ShieldCheck, ShieldX, Shield } from "lucide-react";
import { checkAccess } from "../api/api"; // ✅ uses real backend API calls

export default function PolicyCard({ title }) {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Define the resources to check
  const resources = [
    { resource: "database-prod", desc: "Production DB access" },
    { resource: "admin-panel", desc: "Restricted admin controls" },
    { resource: "file-server", desc: "Internal document server" },
    { resource: "vpn-gateway", desc: "Corporate VPN gateway" },
  ];

  useEffect(() => {
    const fetchPolicies = async () => {
      setLoading(true);
      const results = [];

      // ✅ Loop through each resource and call backend
      for (const r of resources) {
        try {
          const response = await checkAccess(r.resource);
          results.push({
            resource: r.resource,
            desc: r.desc,
            access: response.access || "DENIED",
          });
        } catch (err) {
          results.push({
            resource: r.resource,
            desc: r.desc,
            access: "DENIED",
          });
        }
      }

      setPolicies(results);
      setLoading(false);
    };

    fetchPolicies();
  }, []);

  return (
    <div className="relative bg-white/90 border border-gray-200 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* 🔥 Gradient Accent Bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 via-pink-500 to-violet-600"></div>

      {/* 🧡 Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,165,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,165,0,0.06)_1px,transparent_1px)] bg-[length:36px_36px] pointer-events-none rounded-2xl"></div>

      {/* Header */}
      <div className="relative flex items-center justify-between p-5 border-b border-gray-100 bg-white/70 backdrop-blur-sm rounded-t-2xl">
        <div className="flex items-center gap-2">
          <Shield className="text-orange-500 w-5 h-5" />
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <span className="text-xs text-gray-400 uppercase tracking-wide">
          {loading ? "Loading..." : `${policies.length} Policies`}
        </span>
      </div>

      {/* Table */}
      <div className="relative p-5 overflow-x-auto">
        {loading ? (
          <div className="text-center text-gray-400 py-8 text-sm animate-pulse">
            Checking policies from backend...
          </div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left pb-3">Resource</th>
                <th className="text-left pb-3">Description</th>
                <th className="text-left pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((p, idx) => (
                <tr
                  key={idx}
                  className="border-t border-gray-100 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 transition-all duration-300"
                >
                  <td className="py-3 font-medium text-gray-800">{p.resource}</td>
                  <td className="py-3 text-gray-600">{p.desc}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-semibold ${
                        p.access === "GRANTED"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {p.access === "GRANTED" ? (
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      ) : (
                        <ShieldX className="w-3.5 h-3.5 mr-1" />
                      )}
                      {p.access}
                    </span>
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
