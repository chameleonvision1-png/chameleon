"use client";

import React, { useState } from "react";
import { useSyncAuth } from "@/components/sync/SyncAuthProvider";
import { useSync } from "@/components/sync/SyncProviders";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, AlertCircle, User, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SyncRegisterPage() {
  const { signUpWithEmail, signInWithGoogle } = useSyncAuth();
  const { lang } = useSync();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const isAr = lang === "ar";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError(isAr ? "كلمة المرور لازم تكون ٦ حروف على الأقل" : "Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError(isAr ? "كلمتين المرور مش متطابقين" : "Passwords don't match");
      return;
    }

    setIsSubmitting(true);

    const { error: signUpError } = await signUpWithEmail(email, password, fullName);

    if (signUpError) {
      setError(signUpError.message);
      setIsSubmitting(false);
      return;
    }

    setSuccess(true);
    setIsSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    const { error: googleError } = await signInWithGoogle();
    if (googleError) {
      setError(googleError.message);
    }
  };

  if (success) {
    return (
      <div className="sync-auth-page" dir={isAr ? "rtl" : "ltr"}>
        <div className="sync-auth-bg">
          <div className="sync-auth-gradient-1" />
          <div className="sync-auth-gradient-2" />
          <div className="sync-auth-grid" />
        </div>
        <motion.div
          className="sync-auth-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="sync-auth-success-icon">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="sync-auth-title">
            {isAr ? "تم التسجيل بنجاح! 🎉" : "Registration Successful! 🎉"}
          </h1>
          <p className="sync-auth-subtitle">
            {isAr
              ? "تم إرسال رابط تأكيد على بريدك الإلكتروني. افتح الرسالة واضغط على الرابط لتفعيل حسابك."
              : "A confirmation link has been sent to your email. Open the message and click the link to activate your account."}
          </p>
          <Link href="/sync/auth/login" className="sync-auth-submit" style={{ textDecoration: "none", display: "flex", justifyContent: "center" }}>
            {isAr ? "الذهاب لتسجيل الدخول" : "Go to Sign In"}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="sync-auth-page" dir={isAr ? "rtl" : "ltr"}>
      <div className="sync-auth-bg">
        <div className="sync-auth-gradient-1" />
        <div className="sync-auth-gradient-2" />
        <div className="sync-auth-grid" />
      </div>

      <motion.div
        className="sync-auth-card"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="sync-auth-logo">
          <img src="/sync-logo.png" alt="SYNC" className="sync-auth-logo-img" />
        </div>

        <h1 className="sync-auth-title">
          {isAr ? "إنشاء حساب جديد" : "Create Account"}
        </h1>
        <p className="sync-auth-subtitle">
          {isAr ? "سجّل علشان تقدر تشتري وتتابع طلباتك" : "Sign up to purchase and track your orders"}
        </p>

        <AnimatePresence>
          {error && (
            <motion.div
              className="sync-auth-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="sync-auth-form">
          <div className="sync-auth-field">
            <label>{isAr ? "الاسم الكامل" : "Full Name"}</label>
            <div className="sync-auth-input-wrapper">
              <User size={18} className="sync-auth-input-icon" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={isAr ? "اسمك هنا" : "Your full name"}
                required
                autoComplete="name"
              />
            </div>
          </div>

          <div className="sync-auth-field">
            <label>{isAr ? "البريد الإلكتروني" : "Email"}</label>
            <div className="sync-auth-input-wrapper">
              <Mail size={18} className="sync-auth-input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                autoComplete="email"
                dir="ltr"
              />
            </div>
          </div>

          <div className="sync-auth-field">
            <label>{isAr ? "كلمة المرور" : "Password"}</label>
            <div className="sync-auth-input-wrapper">
              <Lock size={18} className="sync-auth-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="new-password"
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

          <div className="sync-auth-field">
            <label>{isAr ? "تأكيد كلمة المرور" : "Confirm Password"}</label>
            <div className="sync-auth-input-wrapper">
              <Lock size={18} className="sync-auth-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="new-password"
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            className="sync-auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 size={20} className="sync-spin" />
            ) : (
              <>
                <span>{isAr ? "إنشاء حساب" : "Create Account"}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

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
          <span>{isAr ? "التسجيل بحساب جوجل" : "Continue with Google"}</span>
        </button>

        <p className="sync-auth-footer-text">
          {isAr ? "عندك حساب؟" : "Already have an account?"}{" "}
          <Link href="/sync/auth/login" className="sync-auth-link">
            {isAr ? "سجّل دخول" : "Sign in"}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
