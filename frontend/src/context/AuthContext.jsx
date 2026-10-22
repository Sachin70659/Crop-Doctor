/**
 * AuthContext.jsx
 *
 * Provides Firebase authentication state and helpers to the entire app.
 * On every auth-state change the Firebase ID token is exchanged with
 * the backend to get a session JWT (so MongoDB user data is always in sync).
 */

import { createContext, useContext, useEffect, useState } from "react";
import { onFirebaseAuthStateChanged, firebaseLogout } from "../firebase";
import { API_URL } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(undefined); // undefined = loading
  const [user, setUser] = useState(null);       // MongoDB user object
  const [token, setToken] = useState(null);     // backend JWT
  const [loading, setLoading] = useState(true);

  // ── Sync Firebase user → backend JWT + MongoDB user ───────────
  async function syncWithBackend(fbUser) {
    if (!fbUser) {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-changed"));
      return;
    }

    try {
      const idToken = await fbUser.getIdToken();

      const res = await fetch(`${API_URL}/api/auth/firebase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          name: fbUser.displayName || fbUser.email.split("@")[0]
        })
      });

      if (!res.ok) throw new Error("Backend sync failed");

      const data = await res.json();
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("auth-changed"));
    } catch (err) {
      console.error("[Auth] Backend sync error:", err.message);
      // Keep Firebase user but clear backend session
      setToken(null);
      setUser(null);
    }
  }

  // ── Listen to Firebase auth changes ───────────────────────────
  useEffect(() => {
    const unsubscribe = onFirebaseAuthStateChanged(async (fbUser) => {
      setFirebaseUser(fbUser);
      await syncWithBackend(fbUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // ── Logout helper ──────────────────────────────────────────────
  async function logout() {
    await firebaseLogout();
    // syncWithBackend(null) is called automatically via onAuthStateChanged
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
