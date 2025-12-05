import React, { useState } from "react";
import { Lock, Mail, Shield } from "lucide-react";

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("alice@company.com");
  const [password, setPassword] = useState("password123");
  const [message, setMessage] = useState("");

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

      <div className="mb-4 relative">
        <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Email"
          className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg pl-10 p-2.5"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
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
