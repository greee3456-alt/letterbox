// assets/auth.js  (pure JS file — no <script> tags)

window.API_BASE = "https://letterbox-backend-ammp.onrender.com";

window.apiFetch = async function (path, options = {}) {
  const res = await fetch(`${window.API_BASE}${path}`, {
    credentials: "include", // send/receive cookie
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
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
    // Not logged in → go to login
    window.location.href = "login.html";
    throw e;
  }
};

window.handleLogout = async function () {
  try {
    await window.apiFetch("/api/logout", { method: "POST" });
  } finally {
    window.location.href = "login.html";
  }
};