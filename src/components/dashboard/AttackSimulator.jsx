import React from "react";
import {
  Bug,
  AlertTriangle,
  Globe,
  ShieldOff,
  WifiOff,
  Timer,
  Flame,
} from "lucide-react";
import { post } from "../../api/policyApiInternal";

export default function AttackSimulator({ refresh }) {
  const runAttack = async (payload) => {
    try {
      const token = localStorage.getItem("token");

      const finalPayload = {
        ...payload,
        force_anomaly: true, // <-- tell backend to store anomaly
      };

      await post("http://localhost:5002/api/policy/test-risk", finalPayload, token);

      refresh(); // refresh UI instantly
    } catch (err) {
      console.error("Attack simulation error:", err);
    }
  };

  const attacks = [
    {
      name: "Unusual Location",
      icon: Globe,
      color: "text-blue-600",
      payload: {
        location: { country: "CN", city: "Beijing" },
        context: { mfa_verified: false },
      },
    },
    {
      name: "Rooted Device",
      icon: ShieldOff,
      color: "text-red-600",
      payload: {
        device: {
          os_type: "Android",
          os_version: "10",
          encrypted: false,
          rooted: true,
        },
      },
    },
    {
      name: "Public WiFi",
      icon: WifiOff,
      color: "text-orange-600",
      payload: {
        location: { country: "US", city: "Dallas", isp: "Public WiFi" },
      },
    },
    {
      name: "Velocity Attack",
      icon: Timer,
      color: "text-purple-600",
      payload: {
        location: { country: "RU", city: "Moscow" },
      },
    },
    {
      name: "Malicious IP",
      icon: Bug,
      color: "text-red-700",
      payload: {
        test_risk_score: 85,
        test_risk_factors: ["Malicious IP reputation"],
      },
    },
    {
      name: "MFA Bypass",
      icon: AlertTriangle,
      color: "text-amber-600",
      payload: {
        resource: "admin-panel",
        context: { mfa_verified: false },
      },
    },
  ];

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <Flame className="text-red-500" />
        Attack Simulator (Generate Risk & Anomalies)
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {attacks.map((atk, idx) => (
          <button
            key={idx}
            onClick={() => runAttack(atk.payload)}
            className="p-4 border bg-gray-50 hover:bg-gray-100 rounded-xl
              flex flex-col items-center justify-center shadow-sm transition-all"
          >
            <atk.icon className={`${atk.color} mb-2`} size={28} />
            <p className="text-xs font-medium text-gray-700 text-center">
              {atk.name}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
