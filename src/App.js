import React, { useState } from "react";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [token, setToken] = useState(null);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-gray-50 to-violet-50 text-gray-900 relative overflow-hidden font-sans">
      {/* Thicker orange grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,165,0,0.12)_2px,transparent_2px),linear-gradient(to_bottom,rgba(255,165,0,0.12)_2px,transparent_2px)] bg-[length:40px_40px] pointer-events-none"></div>

      {/* Main Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 py-5">
        {!token ? (
          <div className="animate-fadeIn w-full max-w-md">
            <h2 className="text-4xl font-display font-bold text-center mb-6">
              Secure. Simple.{" "}
              <span className="text-violet-600">Zero Trust</span>
            </h2>
            <p className="text-center text-gray-500 mb-8 leading-relaxed">
              Seamless access to your protected resources — built for clarity,
              security, and speed.
            </p>
            <LoginForm onLogin={setToken} />
          </div>
        ) : (
          <div className="w-full animate-fadeIn">
            <Dashboard token={token} onLogout={() => setToken(null)} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-gray-500 text-sm border-t border-gray-100 bg-white/60 backdrop-blur-md">
        © {new Date().getFullYear()} ZTNA Demo — Inspired by{" "}
        <a
          href="https://alice.aryankeluskar.com"
          target="_blank"
          rel="noreferrer"
          className="text-violet-600 hover:text-purple-500 font-medium transition"
        >
          Alice
        </a>
      </footer>
    </div>
  );
}

