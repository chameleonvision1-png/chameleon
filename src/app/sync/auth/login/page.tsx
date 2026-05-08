"use client";

import React, { useState, useRef, Suspense } from "react";
import { useSyncAuth } from "@/components/sync/SyncAuthProvider";
import { useSync } from "@/components/sync/SyncProviders";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Loader2, Shield, X } from "lucide-react";
import Link from "next/link";

function SyncLoginContent() {
  const { signInWithEmail, signInWithGoogle, isLoading: authLoading, user, profile } = useSyncAuth();
  const { lang } = useSync();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auto-redirect if already logged in
  React.useEffect(() => {
    if (user && profile) {
      if (profile.role === "admin" || profile.role === "super_admin") {
        router.push("/sync/admin");
      } else {
        router.push("/sync");
      }
    }
  }, [user, profile, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hidden admin login: 5 taps on logo
  const [logoTaps, setLogoTaps] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const tapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoTap = () => {
    // If already in admin mode, don't count taps
    if (showAdminLogin) return;

    const newTaps = logoTaps + 1;
    setLogoTaps(newTaps);

    if (tapTimeout.current) clearTimeout(tapTimeout.current);
    tapTimeout.current = setTimeout(() => setLogoTaps(0), 2000);

    if (newTaps >= 5) {
      setShowAdminLogin(true);
      setLogoTaps(0);
      setError("");
    }
  };

  const exitAdminMode = () => {
    setShowAdminLogin(false);
    setError("");
    setEmail("");
    setPassword("");
  };

  const callbackError = searchParams.get("error");
  const isAr = lang === "ar";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Use a single client for the entire flow
    const { createSyncClient } = await import("@/lib/sync/supabase-client");
    const supabase = createSyncClient();

    // Step 1: Sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.user) {
      setError(
        isAr
          ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
          : "Invalid email or password"
      );
      setIsSubmitting(false);
      return;
    }

    if (showAdminLogin) {
      // Step 2: Check admin role immediately using the same authenticated client
      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", signInData.user.id)
        .single();

      console.log("Admin check:", { userProfile, profileError, userId: signInData.user.id });

      if (userProfile?.role === "admin" || userProfile?.role === "super_admin") {
        router.push("/sync/admin");
      } else {
        // Not an admin — sign them out immediately
        await supabase.auth.signOut();
        setError(
          isAr
            ? "⛔ هذا الحساب ليس لديه صلاحيات أدمن"
            : "⛔ This account does not have admin privileges"
        );
        setIsSubmitting(false);
      }
    } else {
      router.push("/sync");
    }
  };

  const handleGoogleLogin = async () => {
    const { error: googleError } = await signInWithGoogle();
    if (googleError) {
      setError(googleError.message);
    }
  };

  return (
    <div className="sync-auth-page" dir={isAr ? "rtl" : "ltr"}>
      {/* Background effects */}
      <div className="sync-auth-bg">
        <div className="sync-auth-gradient-1" />
        <div className="sync-auth-gradient-2" />
        <div className="sync-auth-grid" />
      </div>

      <motion.div
        key="login-card"
        className={`sync-auth-card ${showAdminLogin ? "sync-auth-card-admin" : ""}`}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Logo with hidden admin tap */}
        <div className="sync-auth-logo" onClick={handleLogoTap}>
          <img
            src="/sync-logo.png"
            alt="SYNC"
            className="sync-auth-logo-img"
          />
        </div>

        {/* Admin mode indicator with exit button */}
        <AnimatePresence>
          {showAdminLogin && (
            <motion.div
              className="sync-auth-admin-badge"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Shield size={14} />
              <span>{isAr ? "دخول الأدمن" : "Admin Access"}</span>
              <button
                className="sync-auth-admin-exit"
                onClick={exitAdminMode}
                title={isAr ? "خروج من وضع الأدمن" : "Exit admin mode"}
              >
                <X size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <h1 className="sync-auth-title">
          {showAdminLogin
            ? (isAr ? "لوحة التحكم" : "Control Panel")
            : (isAr ? "تسجيل الدخول" : "Sign In")}
        </h1>
        <p className="sync-auth-subtitle">
          {showAdminLogin
            ? (isAr ? "أدخل بيانات حساب الأدمن" : "Enter admin credentials")
            : (isAr ? "أدخل بياناتك للوصول إلى حسابك" : "Enter your credentials to access your account")}
        </p>

        {/* Error messages */}
        <AnimatePresence>
          {(error || callbackError) && (
            <motion.div
              className="sync-auth-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AlertCircle size={16} />
              <span>
                {error ||
                  (callbackError === "auth_callback_error"
                    ? isAr
                      ? "حدث خطأ في المصادقة، حاول مرة أخرى"
                      : "Authentication error, please try again"
                    : callbackError)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="sync-auth-form">
          <div className="sync-auth-field">
            <label>{isAr ? "البريد الإلكتروني" : "Email"}</label>
            <div className="sync-auth-input-wrapper">
              <Mail size={18} className="sync-auth-input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAr ? "example@email.com" : "example@email.com"}
                required
                autoComplete="email"
                dir="ltr"
              />
            </div>
          </div>

          <div className="sync-auth-field">
            <div className="sync-auth-field-header">
              <label>{isAr ? "كلمة المرور" : "Password"}</label>
              {!showAdminLogin && (
                <Link href="/sync/auth/forgot-password" className="sync-auth-forgot">
                  {isAr ? "نسيت كلمة المرور؟" : "Forgot password?"}
                </Link>
              )}
            </div>
            <div className="sync-auth-input-wrapper">
              <Lock size={18} className="sync-auth-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                dir="ltr"
              />
              <button
                type="button"
                className="sync-auth-toggle-pw"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`sync-auth-submit ${showAdminLogin ? "sync-auth-submit-admin" : ""}`}
            disabled={isSubmitting || authLoading}
          >
            {isSubmitting ? (
              <Loader2 size={20} className="sync-spin" />
            ) : (
              <>
                <span>
                  {showAdminLogin
                    ? (isAr ? "دخول لوحة التحكم" : "Access Dashboard")
                    : (isAr ? "تسجيل الدخول" : "Sign In")}
                </span>
                {showAdminLogin ? <Shield size={18} /> : <ArrowRight size={18} />}
              </>
            )}
          </button>
        </form>

        {/* Hide Google + Sign Up when admin mode is active */}
        {!showAdminLogin && (
          <>
            <div className="sync-auth-divider">
              <span>{isAr ? "أو" : "or"}</span>
            </div>

            <button className="sync-auth-google" onClick={handleGoogleLogin}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>{isAr ? "الدخول بحساب جوجل" : "Continue with Google"}</span>
            </button>

            <p className="sync-auth-footer-text">
              {isAr ? "مالكش حساب؟" : "Don't have an account?"}{" "}
              <Link href="/sync/auth/register" className="sync-auth-link">
                {isAr ? "اعمل حساب" : "Sign up"}
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function SyncLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--sync-bg)' }}>
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--sync-yellow)' }} />
      </div>
    }>
      <SyncLoginContent />
    </Suspense>
  );
}
