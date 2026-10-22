/**
 * AuthContext.jsx
 *
 * Provides Firebase & MongoDB authentication state, dual-mode login (Google & Email/Password),
 * and role-based access control (Admin vs Normal User).
 */

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onFirebaseAuthStateChanged, firebaseLogout } from "../firebase";
import { API_URL } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(undefined); // undefined = loading
  const [user, setUser] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user"));
      if (u) {
        return {
          ...u,
          role: u.role === "admin" ? "admin" : "user"
        };
      }
      return null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // Normalize clean API base URL
  const cleanApiUrl = (API_URL || "http://localhost:5000").replace(/\/+$/, "");

  // ── Sync session state ─────────────────────────────────────────
  const updateSession = useCallback((newToken, newUser) => {
    if (newToken && newUser) {
      const normalizedUser = {
        ...newUser,
        role: newUser.role === "admin" ? "admin" : "user"
      };
      setToken(newToken);
      setUser(normalizedUser);
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
    } else {
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    window.dispatchEvent(new Event("auth-changed"));
  }, []);

  // ── Sync Firebase user → backend JWT + MongoDB user ───────────
  const syncWithBackend = useCallback(async (fbUser) => {
    if (!fbUser) return;

    try {
      const idToken = await fbUser.getIdToken();
      const res = await fetch(`${cleanApiUrl}/api/auth/firebase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          name: fbUser.displayName || fbUser.email?.split("@")[0] || "Farmer"
        })
      });

      if (!res.ok) {
        console.warn("[Auth] Backend /api/auth/firebase returned not-ok, using fallback session");
        const fallbackUser = {
          id: fbUser.uid,
          _id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split("@")[0] || "Farmer",
          email: fbUser.email,
          role: fbUser.email?.toLowerCase().includes("admin") ? "admin" : "user"
        };
        updateSession(idToken, fallbackUser);
        return fallbackUser;
      }

      const data = await res.json();
      updateSession(data.token, data.user);
      return data.user;
    } catch (err) {
      console.warn("[Auth] Backend sync error, falling back to direct Firebase session:", err.message);
      try {
        const idToken = await fbUser.getIdToken();
        const fallbackUser = {
          id: fbUser.uid,
          _id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split("@")[0] || "Farmer",
          email: fbUser.email,
          role: fbUser.email?.toLowerCase().includes("admin") ? "admin" : "user"
        };
        updateSession(idToken, fallbackUser);
        return fallbackUser;
      } catch (e) {
        console.error("[Auth] Could not retrieve ID token:", e.message);
      }
    }
  }, [cleanApiUrl, updateSession]);

  // ── Direct Email/Password Login (Backend JWT) ───────────────────
  async function loginWithEmail(email, password) {
    const res = await fetch(`${cleanApiUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Login failed. Please check your credentials.");
    }

    updateSession(data.token, data.user);
    return data.user;
  }

  // ── Direct Email/Password Registration (Backend JWT) ────────────
  async function registerWithEmail(name, email, password) {
    const res = await fetch(`${cleanApiUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Registration failed.");
    }

    updateSession(data.token, data.user);
    return data.user;
  }

  // ── Fetch current user from /api/auth/me ────────────────────────
  const fetchMe = useCallback(async (activeToken) => {
    const t = activeToken || token || localStorage.getItem("token");
    if (!t) return;
    try {
      const res = await fetch(`${cleanApiUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${t}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          const normalized = {
            ...data.user,
            role: data.user.role === "admin" ? "admin" : "user"
          };
          setUser(normalized);
          localStorage.setItem("user", JSON.stringify(normalized));
        }
      }
    } catch {
      // Ignore network errors on background refresh
    }
  }, [cleanApiUrl, token]);

  // ── Listen to Firebase auth changes ───────────────────────────
  useEffect(() => {
    const unsubscribe = onFirebaseAuthStateChanged(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        await syncWithBackend(fbUser);
      } else {
        // If not logged in via Firebase, check if there is an active local JWT session
        const currentToken = localStorage.getItem("token");
        if (currentToken) {
          await fetchMe(currentToken);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [fetchMe, syncWithBackend]);

  // ── Logout helper ──────────────────────────────────────────────
  async function logout() {
    try {
      await firebaseLogout();
    } catch (e) {
      console.warn("Firebase logout warning:", e.message);
    }
    updateSession(null, null);
  }

  const isAdmin = Boolean(user && user.role === "admin");

  const value = {
    firebaseUser,
    user,
    token,
    loading,
    isLoggedIn: Boolean(token && user),
    isAdmin,
    loginWithEmail,
    registerWithEmail,
    logout,
    syncWithBackend,
    refreshUser: fetchMe
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
