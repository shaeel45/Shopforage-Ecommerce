import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import {
  fetchCurrentUser,
  loginUser,
  refreshAuthToken,
  registerUser,
} from "../api";

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  user: "shopforge_user",
  access: "shopforge_access_token",
  refresh: "shopforge_refresh_token",
};

/** First prompt after the storefront loads (let the page paint first). */
const FIRST_PROMPT_DELAY = 1500;
/** Re-prompt cadence after the customer cancels the modal. */
const REPROMPT_INTERVAL = 5 * 60 * 1000;
/** Access tokens live 15 minutes; rotate well before expiry. */
const TOKEN_REFRESH_INTERVAL = 12 * 60 * 1000;

/** Pages that already render their own auth forms — never prompt over them. */
const AUTH_PATHS = ["/login", "/signup"];

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage may be unavailable (private mode) — session stays in memory */
  }
}

function removeStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function readUser() {
  const raw = readStorage(STORAGE_KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Shape a backend user (login, /users/me, register) into what the UI expects. */
function normalizeUser(raw) {
  if (!raw) return null;

  const email = raw.email || "";
  const first = raw.firstName || raw.fullname || raw.first_name || "";
  const last = raw.lastName || raw.lastname || raw.last_name || "";
  const name =
    raw.name ||
    [first, last].filter(Boolean).join(" ").trim() ||
    (email ? email.split("@")[0] : "Valued Customer");

  return {
    id:
      raw.id !== undefined && raw.id !== null
        ? String(raw.id)
        : raw.sub !== undefined && raw.sub !== null
        ? String(raw.sub)
        : `usr-${Date.now()}`,
    name,
    email,
    role: raw.role || "CUSTOMER",
    avatar:
      raw.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        email || name
      )}`,
    joinedDate:
      raw.joinedDate ||
      new Date().toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
    address:
      raw.address || {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "United States",
      },
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readUser);
  const [accessToken, setAccessToken] = useState(() =>
    readStorage(STORAGE_KEYS.access)
  );
  const [refreshToken, setRefreshToken] = useState(() =>
    readStorage(STORAGE_KEYS.refresh)
  );
  const [isInitializing, setIsInitializing] = useState(
    () => Boolean(readStorage(STORAGE_KEYS.access))
  );
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [authModal, setAuthModal] = useState({ open: false, mode: "signin" });

  const location = useLocation();

  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const promptTimerRef = useRef(null);
  const firstPromptRef = useRef(false);

  const clearPromptTimer = useCallback(() => {
    if (promptTimerRef.current) {
      clearTimeout(promptTimerRef.current);
      promptTimerRef.current = null;
    }
  }, []);

  const saveSession = useCallback((nextUser, nextAccess, nextRefresh) => {
    const normalized = normalizeUser(nextUser);
    setUser(normalized);
    if (nextAccess) {
      setAccessToken(nextAccess);
      writeStorage(STORAGE_KEYS.access, nextAccess);
    }
    if (nextRefresh) {
      setRefreshToken(nextRefresh);
      writeStorage(STORAGE_KEYS.refresh, nextRefresh);
    }
    return normalized;
  }, []);

  const saveTokens = useCallback((nextAccess, nextRefresh) => {
    if (nextAccess) {
      setAccessToken(nextAccess);
      writeStorage(STORAGE_KEYS.access, nextAccess);
    }
    if (nextRefresh) {
      setRefreshToken(nextRefresh);
      writeStorage(STORAGE_KEYS.refresh, nextRefresh);
    }
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    removeStorage(STORAGE_KEYS.user);
    removeStorage(STORAGE_KEYS.access);
    removeStorage(STORAGE_KEYS.refresh);
  }, []);

  /** Persist profile edits (address etc.) made from the profile page. */
  useEffect(() => {
    if (user) {
      writeStorage(STORAGE_KEYS.user, JSON.stringify(user));
    } else {
      removeStorage(STORAGE_KEYS.user);
    }
  }, [user]);

  const schedulePrompt = useCallback(
    (delay = REPROMPT_INTERVAL) => {
      clearPromptTimer();
      promptTimerRef.current = setTimeout(() => {
        promptTimerRef.current = null;
        if (userRef.current) return;
        if (typeof window !== "undefined" && AUTH_PATHS.includes(window.location.pathname)) {
          return;
        }
        setAuthModal({ open: true, mode: "signin" });
      }, delay);
    },
    [clearPromptTimer]
  );

  const openAuthModal = useCallback(
    (mode = "signin") => {
      clearPromptTimer();
      setAuthModal({ open: true, mode: mode === "signup" ? "signup" : "signin" });
    },
    [clearPromptTimer]
  );

  /**
   * Cancel: hide the modal and re-open it every five minutes while the
   * visitor is still signed out, so sign-up / sign-in stays on their radar.
   */
  const closeAuthModal = useCallback(() => {
    setAuthModal((prev) => ({ ...prev, open: false }));
    if (!userRef.current) {
      schedulePrompt(REPROMPT_INTERVAL);
    }
  }, [schedulePrompt]);

  /** Verify a stored session on boot and rotate tokens when needed. */
  useEffect(() => {
    let cancelled = false;

    const storedAccess = readStorage(STORAGE_KEYS.access);
    const storedRefresh = readStorage(STORAGE_KEYS.refresh);

    if (!storedAccess) {
      setIsInitializing(false);
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      try {
        const me = await fetchCurrentUser(storedAccess);
        if (!cancelled) setUser(normalizeUser(me));
      } catch (error) {
        if (cancelled) return;

        const expired = error?.status === 401 || error?.status === 403;
        if (!expired) {
          // Network/server outage: keep the cached profile so offline
          // browsing and the local cart/wishlist keep working.
          return;
        }

        if (!storedRefresh) {
          clearSession();
          return;
        }

        try {
          const next = await refreshAuthToken(storedRefresh);
          if (cancelled) return;
          saveTokens(next.accessToken, next.refreshToken);
          const me = await fetchCurrentUser(next.accessToken);
          if (!cancelled) setUser(normalizeUser(me));
        } catch {
          if (!cancelled) clearSession();
        }
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Rotate the access token while the customer stays signed in. */
  useEffect(() => {
    if (!refreshToken || !user) return undefined;

    const interval = setInterval(async () => {
      try {
        const next = await refreshAuthToken(refreshToken);
        saveTokens(next.accessToken, next.refreshToken);
      } catch (error) {
        if (error?.status === 401 || error?.status === 403) {
          clearSession();
        }
      }
    }, TOKEN_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [refreshToken, user, saveTokens, clearSession]);

  /** First-visit prompt + cleanup when the customer signs in. */
  useEffect(() => {
    if (isInitializing) return;

    if (user) {
      clearPromptTimer();
      setAuthModal((prev) => (prev.open ? { ...prev, open: false } : prev));
      return;
    }

    if (AUTH_PATHS.includes(location.pathname)) return;

    if (!firstPromptRef.current) {
      firstPromptRef.current = true;
      schedulePrompt(FIRST_PROMPT_DELAY);
    }
  }, [isInitializing, user, location.pathname, clearPromptTimer, schedulePrompt]);

  useEffect(() => () => clearPromptTimer(), [clearPromptTimer]);

  const login = useCallback(
    async (email, password) => {
      const cleanEmail = String(email || "").trim();

      if (!cleanEmail || !password) {
        return {
          success: false,
          message: "Please provide your email and password.",
        };
      }

      setIsAuthenticating(true);
      try {
        const data = await loginUser({
          email: cleanEmail,
          password: String(password),
        });

        if (!data?.accessToken) {
          return {
            success: false,
            message: "Sign in failed. Please try again.",
          };
        }

        const normalized = saveSession(
          data.user,
          data.accessToken,
          data.refreshToken
        );
        clearPromptTimer();
        setAuthModal({ open: false, mode: "signin" });

        return { success: true, user: normalized };
      } catch (error) {
        return {
          success: false,
          message: error?.message || "Unable to sign in right now.",
        };
      } finally {
        setIsAuthenticating(false);
      }
    },
    [clearPromptTimer, saveSession]
  );

  const signup = useCallback(
    async ({ firstName, lastName, email, password }) => {
      const fullname = String(firstName || "").trim();
      const lastname = String(lastName || "").trim();
      const cleanEmail = String(email || "").trim();

      if (fullname.length < 2) {
        return { success: false, message: "First name must be at least 2 characters." };
      }
      if (lastname.length < 2) {
        return { success: false, message: "Last name must be at least 2 characters." };
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return { success: false, message: "Enter a valid email address." };
      }
      if (String(password || "").length < 8) {
        return { success: false, message: "Password must be at least 8 characters." };
      }

      setIsAuthenticating(true);
      try {
        await registerUser({
          fullname,
          lastname,
          email: cleanEmail,
          password: String(password),
        });
      } catch (error) {
        setIsAuthenticating(false);
        return {
          success: false,
          message: error?.message || "Unable to create your account right now.",
        };
      }

      // The register endpoint does not issue tokens, so sign the new
      // customer straight in with the credentials they just created.
      const result = await login(cleanEmail, password);
      setIsAuthenticating(false);
      return result;
    },
    [login]
  );

  const logout = useCallback(() => {
    clearSession();
    setAuthModal({ open: false, mode: "signin" });
    schedulePrompt(REPROMPT_INTERVAL);
  }, [clearSession, schedulePrompt]);

  const updateProfile = useCallback((updatedData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : prev));
  }, []);

  const refreshSession = useCallback(async () => {
    if (!refreshToken) return false;
    try {
      const next = await refreshAuthToken(refreshToken);
      saveTokens(next.accessToken, next.refreshToken);
      return true;
    } catch {
      clearSession();
      return false;
    }
  }, [refreshToken, saveTokens, clearSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isInitializing,
        isAuthenticating,
        accessToken,
        login,
        signup,
        logout,
        updateProfile,
        refreshSession,
        authModalOpen: authModal.open,
        authModalMode: authModal.mode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
