import React, { useState } from "react";
import { Lock, Mail, Shield, User, ChevronDown } from "lucide-react";

const AVAILABLE_USERS = [
  { email: "bob@company.com", password: "securepass", role: "Admin", clearance: 5, badgeColor: "bg-red-100 text-red-700" },
  { email: "diana@company.com", password: "security123", role: "Security", clearance: 4, badgeColor: "bg-orange-100 text-orange-700" },
  { email: "alice@company.com", password: "password123", role: "Developer", clearance: 3, badgeColor: "bg-blue-100 text-blue-700" },
  { email: "eve@company.com", password: "audit123", role: "Auditor", clearance: 3, badgeColor: "bg-purple-100 text-purple-700" },
  { email: "charlie@company.com", password: "userpass", role: "Analyst", clearance: 2, badgeColor: "bg-green-100 text-green-700" },
  { email: "frank@company.com", password: "manager123", role: "Manager", clearance: 2, badgeColor: "bg-yellow-100 text-yellow-700" },
  { email: "grace@company.com", password: "intern123", role: "Intern", clearance: 1, badgeColor: "bg-gray-100 text-gray-700" },
];

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("alice@company.com");
  const [password, setPassword] = useState("password123");
  const [message, setMessage] = useState("");
  const [showUsers, setShowUsers] = useState(false);

  const handleLogin = async () => {
    setMessage("⏳ Authenticating...");

    try {
      const response = await fetch("http://127.0.0.1:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {

        // Save auth token
        localStorage.setItem("token", data.token);

        // 🔥 Request VPN token from policy engine
        const vpnResponse = await fetch("http://127.0.0.1:5000/api/access/request-vpn", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`,
          },
        });

        const vpnData = await vpnResponse.json();

        if (vpnResponse.ok && vpnData.vpn_token) {
          localStorage.setItem("vpn_token", vpnData.vpn_token);

          setMessage("🟢 Login successful — VPN access granted.");
        } else {
          setMessage("⚠️ Login successful, but VPN permission denied.");
        }

        onLogin?.(data.token);

      } else {
        setMessage("❌ " + (data.error || "Invalid credentials"));
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage("❌ Unable to connect to server");
    }
  };

  const textColor = message.includes("🟢")
    ? "text-green-600"
    : message.includes("❌")
    ? "text-red-500"
    : "text-yellow-600";

  return (
    <div className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-lg p-8 w-96 transition-all duration-500 hover:shadow-xl hover:scale-[1.02]">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white p-3 rounded-full shadow-md">
          <Shield size={28} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mt-4 tracking-tight">
          Login to ZTNA Demo
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Use credentials from backend (e.g., alice@company.com)
        </p>
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Select User</label>
          <button
            onClick={() => setShowUsers(!showUsers)}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            {showUsers ? "Hide" : "Show"} Users <ChevronDown size={12} className={showUsers ? "rotate-180" : ""} />
          </button>
        </div>
        {showUsers && (
          <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
            {AVAILABLE_USERS.map((user) => (
              <button
                key={user.email}
                onClick={() => {
                  setEmail(user.email);
                  setPassword(user.password);
                  setShowUsers(false);
                }}
                className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm flex items-center justify-between mb-1"
              >
                <div>
                  <span className="font-medium">{user.email}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({user.role}, Clearance {user.clearance})
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs ${user.badgeColor}`}>
                  {user.role}
                </span>
              </button>
            ))}
          </div>
        )}
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Email"
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg pl-10 p-2.5"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-6 relative">
        <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="password"
          placeholder="Password"
          className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg pl-10 p-2.5"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button
        onClick={handleLogin}
        className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white rounded-lg font-medium transition-all shadow-md"
      >
        Login
      </button>

      {message && (
        <p className={`mt-4 text-sm text-center font-medium ${textColor}`}>
          {message}
        </p>
      )}
    </div>
  );
}
