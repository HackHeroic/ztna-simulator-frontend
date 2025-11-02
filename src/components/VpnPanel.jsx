import React, { useState } from "react";
import { Wifi, WifiOff, Loader2, Shield } from "lucide-react";

export default function VpnPanel({ connected, setConnected }) {
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    setLoading(true);
    setStatusMsg("⏳ Establishing secure VPN tunnel...");
    setTimeout(() => {
      setConnected(true);
      setLoading(false);
      setStatusMsg("✅ Connected • Throughput: 1 Gbps • Latency: 50 ms");
    }, 1200);
  };

  const handleDisconnect = () => {
    setConnected(false);
    setStatusMsg("🔴 VPN disconnected");
  };

  return (
    <div className="relative bg-white/90 border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition-all duration-500 p-8 font-sans overflow-hidden">
      {/* 🔶 Subtle orange grid background */}
      <div className="absolute inset-0 rounded-3xl bg-[linear-gradient(to_right,rgba(255,165,0,0.08)_1.5px,transparent_1.5px),linear-gradient(to_bottom,rgba(255,165,0,0.08)_1.5px,transparent_1.5px)] bg-[length:36px_36px] pointer-events-none"></div>

      {/* ✨ Gradient outline / glow border */}
      <div className="absolute inset-0 rounded-3xl border-[3px] border-transparent bg-[linear-gradient(120deg,rgba(255,140,0,0.3),rgba(236,72,153,0.25),rgba(79,70,229,0.3))] opacity-40 pointer-events-none"></div>

      {/* Header */}
      <div className="relative flex flex-col items-center mb-6">
        <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-violet-600 text-white shadow-md">
          <Shield className="w-6 h-6" />
        </div>
        <h3 className="mt-3 text-xl font-semibold tracking-tight text-gray-900 font-display">
          VPN Gateway
        </h3>
        <p className="text-sm text-gray-500 mt-1">ZTNA Secure Tunnel</p>
      </div>

      {/* Status Icon */}
      <div className="relative flex flex-col items-center">
        <div
          className={`relative w-24 h-24 flex items-center justify-center rounded-full mb-5 transition-all duration-700 ${
            connected
              ? "bg-gradient-to-br from-orange-50 to-pink-50 text-orange-600 ring-4 ring-orange-300/50 animate-pulse-soft"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          {loading ? (
            <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
          ) : connected ? (
            <Wifi className="w-10 h-10" />
          ) : (
            <WifiOff className="w-10 h-10" />
          )}
        </div>

        {/* Buttons */}
        {!connected ? (
          <button
            onClick={handleConnect}
            disabled={loading}
            className={`px-6 py-2.5 rounded-full font-medium text-white bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 transition-all shadow-md active:scale-95 hover:shadow-orange-300/40 ${
              loading && "opacity-70 cursor-not-allowed"
            }`}
          >
            {loading ? "Connecting..." : "Connect VPN"}
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            className="px-6 py-2.5 rounded-full font-medium text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 transition-all shadow-md active:scale-95 hover:shadow-red-300/40"
          >
            Disconnect
          </button>
        )}

        {/* Status Message */}
        {statusMsg && (
          <p
            className={`mt-5 text-sm font-medium px-4 py-2.5 rounded-xl border shadow-inner tracking-tight ${
              statusMsg.includes("✅")
                ? "text-green-700 bg-green-50 border-green-100"
                : statusMsg.includes("🔴")
                ? "text-red-700 bg-red-50 border-red-100"
                : "text-gray-700 bg-gray-50 border-gray-100"
            }`}
          >
            {statusMsg}
          </p>
        )}
      </div>

      {/* Pulse Animation */}
      <style>{`
        @keyframes pulse-soft {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,165,0,0.4); }
          50% { box-shadow: 0 0 25px 10px rgba(255,165,0,0.1); }
        }
        .animate-pulse-soft {
          animation: pulse-soft 2.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
