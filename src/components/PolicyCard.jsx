import React, { useEffect, useState } from "react";
import {
  Shield,
  AlertTriangle,
  Bug,
  Globe,
  Cpu,
  Rocket,
  Timer,
  Zap,
} from "lucide-react";

/* ============================================================
   🔥 API HELPERS
   ============================================================ */

async function testRisk(payload) {
  try {
    const res = await fetch("http://localhost:5002/api/policy/test-risk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log("test-risk",await res.json())
    return await res.json();
  } catch (e) {
    return { error: "Backend not reachable" };
  }
}

async function fetchRiskDictionary() {
  try {
    const res = await fetch("http://localhost:5002/api/policy/policies");
    const json = await res.json();
    return json.risk_factors || {};
  } catch {
    return {};
  }
}

/* ============================================================
   🟧 UTILITIES
============================================================ */
function getSeverity(weight) {
  if (weight < 15) return "text-green-600";
  if (weight < 30) return "text-yellow-600";
  if (weight < 50) return "text-orange-600";
  return "text-red-600";
}

function capitalize(str) {
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ============================================================
   🟣 MAIN COMPONENT - ADVANCED ATTACK LAB
============================================================ */
export default function AttackLab({ title = "Attack Simulation Lab" }) {
  const [riskDictionary, setRiskDictionary] = useState({});
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  /* =============================
     Attack Form State
  ============================== */

  const [vuln, setVuln] = useState({
    resource: "admin-panel",
    country: "US",
    os_type: "macOS",
    os_version: "12.0",
    rooted: false,
    encrypted: true,
    public_wifi: false,
    mfa_verified: true,
    malicious_ip: false,
    tor_node: false,
  });

  const countries = ["US", "IN", "UK", "CA", "CN", "RU", "PK", "BR", "FR"];

  useEffect(() => {
    fetchRiskDictionary().then(setRiskDictionary);
  }, []);

  /* ============================================================
     🔥 Build Payload for Simulation
============================================================ */
  const buildPayload = () => {
    const device = {
      os_type: vuln.os_type,
      os_version: vuln.os_version,
      rooted: vuln.rooted,
      encrypted: vuln.encrypted,
    };

    const location = {
      country: vuln.country,
      isp: vuln.public_wifi ? "Public WiFi Hotspot" : "Jio Fiber",
    };

    // Inject malicious properties your backend understands
    if (vuln.malicious_ip) {
      location.ip = "45.83.23.9"; // known malicious region
    }
    if (vuln.tor_node) {
      location.isp = "Tor Exit Relay";
    }

    return {
      user: { email: "test@example.com" },
      resource: vuln.resource,
      device,
      location,
      context: { mfa_verified: vuln.mfa_verified },
    };
  };

  /* ============================================================
     ⚡ Velocity Attack (Two Rapid Location Jumps)
============================================================ */
  const runVelocityAttack = async () => {
    setSimulating(true);
    setSimulationResult(null);

    const sequence = [
      { country: "US", note: "First normal request" },
      { country: "CN", note: "Immediate second request → velocity anomaly" },
    ];

    let results = [];

    for (const step of sequence) {
      const payload = buildPayload();
      payload.location.country = step.country;

      const result = await testRisk(payload);

      results.push({
        step: step.note,
        country: step.country,
        result,
      });
    }

    setSimulationResult({ velocity_attack: true, results });

    setSimulating(false);
  };

  /* ============================================================
     🔥 Normal Simulation
============================================================ */
  const runSimulation = async () => {
    setSimulating(true);
    setSimulationResult(null);

    const result = await testRisk(buildPayload());

    setSimulationResult(result);
    setSimulating(false);
  };

  /* ============================================================
     🎛️ Preset Attacks
============================================================ */
  const presets = {
    normal: {
      label: "Normal Traffic",
      apply: () =>
        setVuln({
          ...vuln,
          country: "US",
          os_type: "macOS",
          os_version: "14.0",
          encrypted: true,
          rooted: false,
          public_wifi: false,
          malicious_ip: false,
          tor_node: false,
          mfa_verified: true,
        }),
    },
    high_risk_rooted: {
      label: "Rooted Device Attack",
      apply: () =>
        setVuln({
          ...vuln,
          rooted: true,
          encrypted: false,
          country: "CN",
          os_version: "8.0",
        }),
    },
    tor_attack: {
      label: "TOR Exit Node Attack",
      apply: () =>
        setVuln({
          ...vuln,
          tor_node: true,
          malicious_ip: false,
          public_wifi: true,
          country: "RU",
        }),
    },
    malicious_ip: {
      label: "Malicious IP Attack",
      apply: () =>
        setVuln({
          ...vuln,
          malicious_ip: true,
          country: "PK",
        }),
    },
    critical_mfa_bypass: {
      label: "Critical Resource - No MFA",
      apply: () =>
        setVuln({
          ...vuln,
          resource: "admin-panel",
          mfa_verified: false,
        }),
    },
  };

  return (
    <div className="p-6 bg-white border rounded-xl shadow-sm space-y-6">
      {/* Title */}
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Shield className="text-orange-500" /> {title}
      </h2>

      {/* ============================================================
           🎛️ PRESETS
         ============================================================ */}
      <div className="p-4 bg-gray-50 border rounded-lg">
        <h3 className="font-semibold mb-3">Quick Attack Presets</h3>

        <div className="flex flex-wrap gap-2">
          {Object.entries(presets).map(([k, v]) => (
            <button
              key={k}
              onClick={v.apply}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
            >
              {v.label}
            </button>
          ))}

          <button
            onClick={runVelocityAttack}
            className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 flex items-center gap-1"
          >
            <Zap className="w-4" /> Velocity Attack
          </button>
        </div>
      </div>

      {/* ============================================================
           🧪 FORM
         ============================================================ */}
      <div className="p-5 border rounded-xl bg-gray-50">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Bug className="text-red-500" /> Configure Manual Attack
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* RESOURCE */}
          <div>
            <label className="text-sm font-medium">Resource</label>
            <select
              className="w-full p-2 border rounded-lg"
              value={vuln.resource}
              onChange={(e) => setVuln({ ...vuln, resource: e.target.value })}
            >
              <option value="admin-panel">Admin Panel</option>
              <option value="database-prod">Database Prod</option>
              <option value="file-server">File Server</option>
              <option value="vpn-gateway">VPN Gateway</option>
            </select>
          </div>

          {/* COUNTRY */}
          <div>
            <label className="text-sm font-medium">Country</label>
            <select
              className="w-full p-2 border rounded-lg"
              value={vuln.country}
              onChange={(e) => setVuln({ ...vuln, country: e.target.value })}
            >
              {countries.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* OS TYPE */}
          <div>
            <label className="text-sm font-medium">OS Type</label>
            <select
              className="w-full p-2 border rounded-lg"
              value={vuln.os_type}
              onChange={(e) => setVuln({ ...vuln, os_type: e.target.value })}
            >
              <option>macOS</option>
              <option>Windows</option>
              <option>Android</option>
              <option>iOS</option>
              <option>Linux</option>
            </select>
          </div>

          {/* OS VERSION */}
          <div>
            <label className="text-sm font-medium">OS Version</label>
            <input
              className="w-full p-2 border rounded-lg"
              value={vuln.os_version}
              onChange={(e) =>
                setVuln({ ...vuln, os_version: e.target.value })
              }
            />
          </div>

          {/* Checkboxes */}
          <div className="col-span-2 grid grid-cols-2 gap-2 mt-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={vuln.rooted}
                onChange={(e) =>
                  setVuln({ ...vuln, rooted: e.target.checked })
                }
              />
              Rooted / Jailbroken
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={vuln.encrypted}
                onChange={(e) =>
                  setVuln({ ...vuln, encrypted: e.target.checked })
                }
              />
              Device Encrypted
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={vuln.public_wifi}
                onChange={(e) =>
                  setVuln({ ...vuln, public_wifi: e.target.checked })
                }
              />
              Public WiFi
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={vuln.mfa_verified}
                onChange={(e) =>
                  setVuln({ ...vuln, mfa_verified: e.target.checked })
                }
              />
              MFA Verified
            </label>

            {/* Malicious IP */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={vuln.malicious_ip}
                onChange={(e) =>
                  setVuln({ ...vuln, malicious_ip: e.target.checked })
                }
              />
              Malicious IP
            </label>

            {/* TOR Node */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={vuln.tor_node}
                onChange={(e) =>
                  setVuln({ ...vuln, tor_node: e.target.checked })
                }
              />
              TOR Exit Node
            </label>
          </div>
        </div>

        {/* SIMULATE BUTTON */}
        <button
          onClick={runSimulation}
          className="mt-4 px-5 py-2 bg-red-200 hover:bg-red-300 text-red-800 font-semibold rounded-lg"
        >
          {simulating ? "Simulating..." : "Run Attack"}
        </button>

        {/* RESULTS */}
        {simulationResult && (
          <div className="mt-5 p-4 bg-white border rounded-lg">
            {!simulationResult.velocity_attack ? (
              <>
                <h4 className="font-semibold mb-2">Simulation Result:</h4>

                <p>
                  <strong>Decision:</strong>{" "}
                  <span
                    className={
                      simulationResult.decision === "ALLOW"
                        ? "text-green-600"
                        : simulationResult.decision === "DENY"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }
                  >
                    {simulationResult.decision}
                  </span>
                </p>

                <p>
                  <strong>Risk Score:</strong> {simulationResult.risk_score} /{" "}
                  {simulationResult.threshold}
                </p>

                <strong>Risk Factors:</strong>
                <ul className="list-disc ml-5 text-sm">
                  {simulationResult.risk_factors?.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <h4 className="font-semibold mb-2">
                  Velocity Attack Results:
                </h4>

                {simulationResult.results.map((step, i) => (
                  <div key={i} className="p-3 border rounded mb-2">
                    <p>
                      <strong>Step:</strong> {step.step}
                    </p>
                    <p>
                      <strong>Country:</strong> {step.country}
                    </p>
                    <p>
                      <strong>Decision:</strong>{" "}
                      {step.result.decision}
                    </p>
                    <p>
                      <strong>Risk Score:</strong>{" "}
                      {step.result.risk_score}
                    </p>
                    <ul className="list-disc ml-5 text-sm">
                      {step.result.risk_factors?.map((f, idx) => (
                        <li key={idx}>{f}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* ============================================================
         🔥 RISK DICTIONARY TABLE
      ============================================================ */}
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="text-red-500" />
          Risk Factor Dictionary
        </h3>

        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 uppercase text-[10px]">
              <th className="text-left p-1">Factor</th>
              <th className="text-left p-1">Weight</th>
              <th className="text-left p-1">Severity</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(riskDictionary).map(([key, weight], i) => (
              <tr key={i} className="border-t">
                <td className="py-1">{capitalize(key)}</td>
                <td className="py-1 font-semibold">{weight}</td>
                <td className={`py-1 font-semibold ${getSeverity(weight)}`}>
                  {weight < 15
                    ? "Low"
                    : weight < 30
                    ? "Medium"
                    : weight < 50
                    ? "High"
                    : "Critical"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
