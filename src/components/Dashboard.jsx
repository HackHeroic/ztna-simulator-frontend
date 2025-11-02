import React, { useState, useEffect } from "react";
import { Shield, LogOut, RefreshCcw, Activity } from "lucide-react";
import PolicyCard from "./PolicyCard";
import VpnPanel from "./VpnPanel";

export default function Dashboard({ token, onLogout }) {
  const [connected, setConnected] = useState(false);
  const [risk, setRisk] = useState(0);
  const [logs, setLogs] = useState([]);

  // Auto heartbeat
  useEffect(() => {
    const interval = setInterval(() => {
      if (connected) {
        setLogs((prev) => [
          { time: new Date().toLocaleTimeString(), event: "🔐 Heartbeat: VPN active" },
          ...prev.slice(0, 4),
        ]);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [connected]);

  const addLog = (event) => {
    setLogs((prev) => [
      { time: new Date().toLocaleTimeString(), event },
      ...prev.slice(0, 9),
    ]);
  };

  const handleRecalcRisk = () => {
    const newRisk = Math.floor(Math.random() * 100);
    setRisk(newRisk);
    addLog(`⚙️ Risk recalculated: ${newRisk}`);
  };

  const handleConnectChange = (status) => {
    setConnected(status);
    addLog(status ? "🟠 VPN connected" : "🔴 VPN disconnected");
  };

  const riskColor =
    risk < 40 ? "text-green-500" : risk < 70 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-yellow-50 text-gray-900 relative font-sans transition-all duration-500 overflow-hidden">
      {/* Orange Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,140,0,0.08)_2px,transparent_2px),linear-gradient(to_bottom,rgba(255,140,0,0.08)_2px,transparent_2px)] bg-[length:40px_40px] pointer-events-none"></div>

      {/* Header */}
      <div className="relative bg-white text-gray-900 py-6 px-10 rounded-b-[2rem] border-b-[6px] border-orange-500 shadow-[0_4px_12px_rgba(255,140,0,0.15)]">
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-inner">
              <Shield size={22} />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight font-display">
              ZTNA Access Portal
            </h1>
          </div>

          {/* Center Tagline */}
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center hidden md:block">
            <p className="text-sm font-medium text-gray-600 tracking-wide">
              Secure • Seamless • Zero Trust
            </p>
          </div>

          {/* Right: User + Logout */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-right leading-tight">
              <p className="font-medium text-gray-900">demo@ztna.com</p>
              <p className="text-xs text-gray-500">Authenticated User</p>
            </div>
            <button
              onClick={onLogout}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-orange-300/50"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* VPN Panel */}
            <div className="bg-white/90 border border-orange-100 rounded-2xl shadow-sm hover:shadow-md p-6 transition-all">
              <VpnPanel connected={connected} setConnected={handleConnectChange} />
            </div>

            {/* Security Overview */}
            <div className="bg-white/90 border border-orange-100 rounded-2xl shadow-sm hover:shadow-md p-6 transition-all">
              <h3 className="font-semibold mb-4 text-gray-900 text-lg border-b border-orange-100 pb-2 flex items-center gap-2">
                <Shield className="text-orange-500 w-5 h-5" /> Security Overview
              </h3>
              <div className="grid grid-cols-3 text-center">
                <div>
                  <p className="text-gray-500 text-sm">Risk Score</p>
                  <p className={`text-3xl font-bold ${riskColor}`}>{risk}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Latency</p>
                  <p className="text-xl font-semibold">
                    {connected ? "45 ms" : "--"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Uptime</p>
                  <p className="text-xl font-semibold">
                    {connected ? "99.8%" : "0%"}
                  </p>
                </div>
              </div>
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleRecalcRisk}
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-amber-500 text-white font-medium px-5 py-2 rounded-full text-sm hover:shadow-md hover:scale-105 transition"
                >
                  <RefreshCcw size={16} /> Recalculate Risk
                </button>
              </div>
            </div>

            {/* Policies */}
            <div className="bg-white/90 border border-orange-100 rounded-2xl shadow-sm hover:shadow-md p-6 transition-all">
              <PolicyCard title="Access Policies" />
            </div>
          </div>

          {/* Right: Logs */}
          <div className="bg-white/90 border border-orange-100 rounded-2xl shadow-sm hover:shadow-md p-6 transition-all relative overflow-hidden">
            {/* Orange grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,140,0,0.08)_2px,transparent_2px),linear-gradient(to_bottom,rgba(255,140,0,0.08)_2px,transparent_2px)] bg-[length:40px_40px] opacity-70 pointer-events-none"></div>

            <div className="flex items-center justify-between mb-4 border-b border-orange-100 pb-2 relative z-10">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Activity size={18} className="text-orange-500" /> Activity Log
              </h3>
            </div>

            <div className="h-72 overflow-y-auto space-y-2 text-sm scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-orange-50 relative z-10">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 select-none">
                  <div className="bg-gradient-to-br from-orange-100 to-orange-50 p-6 rounded-full shadow-inner mb-3">
                    <Activity size={40} className="text-orange-400" />
                  </div>
                  <p className="italic">No activity yet...</p>
                  <p className="text-xs text-gray-400 mt-1 text-center px-2">
                    Actions like VPN connections or risk recalculations will appear here.
                  </p>
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div
                    key={idx}
                    className="border-l-4 border-orange-400 pl-3 text-gray-700 bg-orange-50 rounded-r-md py-2 hover:bg-orange-100 transition"
                  >
                    <p className="font-medium">{log.event}</p>
                    <p className="text-xs text-gray-400">{log.time}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
