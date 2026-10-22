/**
 * AuthContext.jsx
 *
 * Provides Firebase & MongoDB authentication state and helpers.
 * Ensures the session token is synced between Firebase and MongoDB.
 */

import { createContext, useContext, useEffect, useState } from "react";
import { onFirebaseAuthStateChanged, firebaseLogout } from "../firebase";
import { API_URL } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(undefined); // undefined = loading
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // ── Sync Firebase user → backend JWT + MongoDB user ───────────
  async function syncWithBackend(fbUser) {
    if (!fbUser) {
      // Only clear if no backend token exists
      return;
    }

    try {
      const idToken = await fbUser.getIdToken();
      const cleanApiUrl = (API_URL || "").replace(/\/+$/, "");

      const res = await fetch(`${cleanApiUrl}/api/auth/firebase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          name: fbUser.displayName || fbUser.email?.split("@")[0] || "Farmer"
        })
      });

      if (!res.ok) {
        console.warn("[Auth] Backend /api/auth/firebase returned not-ok, using ID token directly");
        // Fallback: Use the Firebase ID token itself as bearer token
        const fallbackUser = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split("@")[0] || "Farmer",
          email: fbUser.email
        };
        setToken(idToken);
        setUser(fallbackUser);
        localStorage.setItem("token", idToken);
        localStorage.setItem("user", JSON.stringify(fallbackUser));
        window.dispatchEvent(new Event("auth-changed"));
        return;
      }

      const data = await res.json();
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("auth-changed"));
    } catch (err) {
      console.warn("[Auth] Backend sync error, falling back to direct Firebase session:", err.message);
      try {
        const idToken = await fbUser.getIdToken();
        const fallbackUser = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split("@")[0] || "Farmer",
          email: fbUser.email
        };
        setToken(idToken);
        setUser(fallbackUser);
        localStorage.setItem("token", idToken);
        localStorage.setItem("user", JSON.stringify(fallbackUser));
        window.dispatchEvent(new Event("auth-changed"));
      } catch (e) {
        console.error("[Auth] Could not retrieve ID token:", e.message);
      }
    }
  }

  // ── Listen to Firebase auth changes ───────────────────────────
  useEffect(() => {
    const unsubscribe = onFirebaseAuthStateChanged(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        await syncWithBackend(fbUser);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // ── Logout helper ──────────────────────────────────────────────
  async function logout() {
    try {
      await firebaseLogout();
    } catch (e) {
      console.warn("Firebase logout warning:", e.message);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-changed"));
  }

  const value = {
    firebaseUser,
    user,
    token,
    loading,
    isLoggedIn: Boolean(token && user),
    logout,
    syncWithBackend
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
