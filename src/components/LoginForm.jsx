import React, { useState } from "react";
import { Lock, Mail, Shield } from "lucide-react";

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("demo@ztna.com");
  const [password, setPassword] = useState("demo123");
  const [message, setMessage] = useState("");

  const handleLogin = () => {
    setMessage("⏳ Authenticating...");
    setTimeout(() => {
      if (email === "demo@ztna.com" && password === "demo123") {
        setMessage("✅ Login successful! Redirecting...");
        onLogin("fake-demo-token-12345");
      } else {
        setMessage("❌ Invalid credentials");
      }
    }, 800);
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-lg p-8 w-96 transition-all duration-500 hover:shadow-xl hover:scale-[1.02]">
      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white p-3 rounded-full shadow-md">
          <Shield size={28} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mt-4 tracking-tight">
          Login to ZTNA Demo
        </h2>
        <p className="text-sm text-gray-500 mt-1">(Demo credentials auto-filled)</p>
      </div>

      {/* Email Field */}
      <div className="mb-4 relative">
        <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Email"
          className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg pl-10 p-2.5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-400 transition-all"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Password Field */}
      <div className="mb-6 relative">
        <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="password"
          placeholder="Password"
          className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg pl-10 p-2.5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-400 transition-all"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {/* Login Button */}
      <button
        onClick={handleLogin}
        className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-purple-300/40"
      >
        Quick Login
      </button>

      {/* Status Message */}
      {message && (
        <p
          className={`mt-4 text-sm text-center font-medium transition-all ${
            message.includes("✅")
              ? "text-green-600"
              : message.includes("❌")
              ? "text-red-500"
              : "text-yellow-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
