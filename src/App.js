import React, { useState, useEffect } from "react";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // Persist token in localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // Optional: verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://127.0.0.1:5000/api/auth/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          console.warn("Token invalid or expired");
          setToken(null);
        }
      } catch (err) {
        console.error("Token verification failed:", err);
        setToken(null);
      }
    };
    verifyToken();
  }, []); // runs once

  return (
    <div className="min-h-screen w-full bg-transparent text-gray-900 relative overflow-hidden font-sans">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,165,0,0.12)_2px,transparent_2px),linear-gradient(to_bottom,rgba(255,165,0,0.12)_2px,transparent_2px)] bg-[length:40px_40px] pointer-events-none"></div>

      <main className="relative z-10 flex flex-col items-center justify-center px-6 py-5 w-full">
        {!token ? (
          <div className="animate-fadeIn w-full max-w-md bg-white/80 rounded-lg shadow-lg p-6 backdrop-blur-md">
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
      <footer className="relative z-10 text-center py-6 text-gray-500 text-sm border-t border-gray-100 bg-white/20 backdrop-blur-md">
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
