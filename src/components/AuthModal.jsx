import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const EMPTY_SIGNUP = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  agreeTerms: true,
};

const inputClass =
  "w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:border-stone-400";

export default function AuthModal() {
  const {
    authModalOpen,
    authModalMode,
    closeAuthModal,
    login,
    signup,
    isAuthenticating,
  } = useAuth();
  const { addToast } = useToast();

  const [mode, setMode] = useState(authModalMode || "signin");
  const [signinForm, setSigninForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState(EMPTY_SIGNUP);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const emailRef = useRef(null);

  const handleCancel = useCallback(() => {
    addToast(
      "No problem — we'll check back in 5 minutes so you don't lose your picks.",
      "info",
      4200
    );
    closeAuthModal();
  }, [addToast, closeAuthModal]);

  // Reset the visible tab whenever the modal is (re)opened.
  useEffect(() => {
    if (authModalOpen) {
      setMode(authModalMode || "signin");
      setError("");
      setShowPassword(false);
    }
  }, [authModalOpen, authModalMode]);

  // Esc to close, body scroll lock, focus the first field.
  useEffect(() => {
    if (!authModalOpen) return undefined;

    const focusTimer = setTimeout(() => emailRef.current?.focus(), 80);
    const onKeyDown = (event) => {
      if (event.key === "Escape") handleCancel();
    };
    const previousOverflow = document.body.style.overflow;

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [authModalOpen, mode, handleCancel]);

  if (!authModalOpen) return null;

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setShowPassword(false);
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    setError("");

    const result = await login(signinForm.email, signinForm.password);
    if (!result.success) {
      setError(result.message);
      return;
    }

    const firstName = result.user?.name?.split(" ")[0];
    addToast(`Welcome back${firstName ? `, ${firstName}` : ""}!`, "success");
    setSigninForm({ email: "", password: "" });
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    setError("");

    if (!signupForm.agreeTerms) {
      setError("Please accept the Terms of Service to create an account.");
      return;
    }

    const result = await signup(signupForm);
    if (!result.success) {
      setError(result.message);
      return;
    }

    const firstName = result.user?.name?.split(" ")[0];
    addToast(
      `Welcome to ShopForge${firstName ? `, ${firstName}` : ""}! Your account is ready.`,
      "success"
    );
    setSignupForm(EMPTY_SIGNUP);
  };

  const handleSignupChange = (event) => {
    const { name, value, type, checked } = event.target;
    setSignupForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-950/60 backdrop-blur-sm p-4 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <button
          type="button"
          onClick={handleCancel}
          aria-label="Close sign in"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
        >
          ✕
        </button>

        <div className="px-6 pt-7 sm:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-lg font-black text-white">
              S
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-stone-900">
                Shop<span className="text-stone-500">Forge</span>
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                Members save more
              </p>
            </div>
          </div>

          <h2
            id="auth-modal-title"
            className="mt-5 text-2xl font-extrabold tracking-tight text-stone-900"
          >
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-stone-500">
            {mode === "signin"
              ? "Sign in to sync your wishlist, bag, and order history."
              : "Join in seconds — save favourites and check out faster."}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-stone-100 p-1">
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className={`rounded-lg py-2 text-xs font-bold transition ${
                mode === "signin"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`rounded-lg py-2 text-xs font-bold transition ${
                mode === "signup"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[11px] font-medium text-red-700"
            >
              {error}
            </div>
          )}

          {mode === "signin" ? (
            <form onSubmit={handleSignIn} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-700">
                  Email Address
                </label>
                <input
                  ref={emailRef}
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={signinForm.email}
                  onChange={(event) =>
                    setSigninForm((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={signinForm.password}
                    onChange={(event) =>
                      setSigninForm((prev) => ({
                        ...prev,
                        password: event.target.value,
                      }))
                    }
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-3 text-[11px] font-semibold text-stone-400 hover:text-stone-700"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full rounded-xl bg-black py-3.5 text-xs font-bold text-white shadow-md transition hover:bg-stone-800 disabled:opacity-50"
              >
                {isAuthenticating ? "Signing in..." : "Sign In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-stone-700">
                    First Name
                  </label>
                  <input
                    ref={emailRef}
                    type="text"
                    required
                    name="firstName"
                    autoComplete="given-name"
                    placeholder="First"
                    value={signupForm.firstName}
                    onChange={handleSignupChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-stone-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    name="lastName"
                    autoComplete="family-name"
                    placeholder="Last"
                    value={signupForm.lastName}
                    onChange={handleSignupChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-700">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={signupForm.email}
                  onChange={handleSignupChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    name="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={signupForm.password}
                    onChange={handleSignupChange}
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-3 text-[11px] font-semibold text-stone-400 hover:text-stone-700"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-2 pt-1 text-[11px] leading-relaxed text-stone-600">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={signupForm.agreeTerms}
                  onChange={handleSignupChange}
                  className="mt-0.5 rounded text-black focus:ring-0"
                />
                <span>
                  I agree to the Terms of Service & Privacy Policy.
                </span>
              </label>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full rounded-xl bg-black py-3.5 text-xs font-bold text-white shadow-md transition hover:bg-stone-800 disabled:opacity-50"
              >
                {isAuthenticating ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={handleCancel}
            className="mt-3 w-full rounded-xl border border-stone-200 py-2.5 text-[11px] font-semibold text-stone-500 transition hover:bg-stone-50 hover:text-stone-800"
          >
            Continue browsing as a guest
          </button>
        </div>

        <div className="mt-5 border-t border-stone-100 bg-stone-50 px-6 py-4 sm:px-8">
          <p className="text-[10px] leading-relaxed text-stone-500">
            Guest browsing is allowed, but we'll remind you every 5 minutes so
            your wishlist and bag never get lost.
          </p>
        </div>
      </div>
    </div>
  );
}
