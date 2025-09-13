// assets/auth.js — API helper with cookie session + JWT fallback (Safari)

window.API_BASE = "https://letterbox-backend-ammp.onrender.com";

// ---- Token storage (for Safari) ----
const TOKEN_KEY = "lb_token";
function setToken(t) { try { localStorage.setItem(TOKEN_KEY, t || ""); } catch {} }
function getToken() { try { return localStorage.getItem(TOKEN_KEY) || ""; } catch { return ""; } }
function clearToken() { try { localStorage.removeItem(TOKEN_KEY); } catch {} }

// ---- API helper ----
window.apiFetch = async function (path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const tok = getToken();
  if (tok) headers["Authorization"] = `Bearer ${tok}`; // JWT for Safari

  const res = await fetch(`${window.API_BASE}${path}`, {
    credentials: "include", // still send cookies (Chrome/others)
    headers,
    ...options,
  });

  // If response carries a token (e.g., /api/login), store it
  if (res.ok) {
    try {
      const clone = res.clone();
      const data = await clone.json();
      if (data && data.token) setToken(data.token);
    } catch {}
  }

  if (!res.ok) {
    let msg = "Request failed";
    try {
      const j = await res.json();
      if (j && j.error) msg = j.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
};

window.requireSessionOrRedirect = async function () {
  try {
    const data = await window.apiFetch("/api/session");
    return data.user;
  } catch (e) {
    window.location.href = "login.html"; // relative path for GH Pages project site
    throw e;
  }
};

window.handleLogout = async function () {
  try {
    clearToken(); // remove JWT
    await window.apiFetch("/api/logout", { method: "POST" }); // clear cookie session
  } catch {}
  window.location.href = "login.html";
};