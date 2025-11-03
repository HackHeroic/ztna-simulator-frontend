// src/api/api.js

const BASE_URL = "http://127.0.0.1:5000/api";
const HEALTH_URL = "http://127.0.0.1:5000/health";

// 🧠 Helpers
const getToken = () => localStorage.getItem("token");

const headers = (isJson = true) => {
  const h = {};
  if (isJson) h["Content-Type"] = "application/json";
  const token = getToken();
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
};

// 🧩 AUTH
export async function loginUser(email, password) {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    localStorage.setItem("token", data.token);
    return data;
  } catch (err) {
    return { error: err.message };
  }
}

export async function verifyToken() {
  try {
    const res = await fetch(`${BASE_URL}/auth/verify`, {
      headers: headers(),
    });
    const data = await res.json();
    return res.ok && data.valid;
  } catch {
    return false;
  }
}

export function logoutUser() {
  localStorage.removeItem("token");
  return { success: true };
}

// 🧩 ACCESS CHECK
export async function checkAccess(resource) {
  try {
    const res = await fetch(`${BASE_URL}/access/check`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ resource }),
    });
    return await res.json();
  } catch (err) {
    return { access: "DENIED", error: err.message };
  }
}

// 🧩 VPN
export async function requestVpnAccess() {
  const token = getToken();
  if (!token) {
    return { error: "No token found — please log in again." };
  }

  // Optional: verify before sending
  const isValid = await verifyToken();
  if (!isValid) {
    logoutUser();
    return { error: "Session expired — please log in again." };
  }

  try {
    const res = await fetch(`${BASE_URL}/access/request-vpn`, {
      method: "POST",
      headers: headers(),
    });
    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || "Unauthorized or token invalid" };
    }

    return data;
  } catch (err) {
    return { error: err.message };
  }
}

// 🧩 HEALTH
export async function checkHealth() {
  try {
    const res = await fetch(HEALTH_URL);
    return await res.json();
  } catch (err) {
    return { status: "offline", error: err.message };
  }
}
