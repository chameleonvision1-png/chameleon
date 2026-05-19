"use client";

import React, { useState } from "react";
import { useSyncAuth } from "@/components/sync/SyncAuthProvider";
import { useSync } from "@/components/sync/SyncProviders";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, AlertCircle, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SyncForgotPasswordPage() {
  const { resetPassword } = useSyncAuth();
  const { lang } = useSync();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const isAr = lang === "ar";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const { error: resetError } = await resetPassword(email);

    if (resetError) {
      setError(resetError.message);
      setIsSubmitting(false);
      return;
    }

    setSuccess(true);
    setIsSubmitting(false);
  };

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

        {success ? (
          <>
            <div className="sync-auth-success-icon">
              <CheckCircle2 size={48} />
            </div>
            <h1 className="sync-auth-title">
              {isAr ? "تم إرسال الرابط ✉️" : "Reset Link Sent ✉️"}
            </h1>
            <p className="sync-auth-subtitle">
              {isAr
                ? "لو الإيميل موجود عندنا، هتلاقي رسالة فيها رابط تغيير كلمة المرور."
                : "If that email is registered, you'll receive a password reset link."}
            </p>
            <Link href="/auth/login" className="sync-auth-submit" style={{ textDecoration: "none", display: "flex", justifyContent: "center" }}>
              {isAr ? "الرجوع لتسجيل الدخول" : "Back to Sign In"}
            </Link>
          </>
        ) : (
          <>
            <h1 className="sync-auth-title">
              {isAr ? "نسيت كلمة المرور" : "Forgot Password"}
            </h1>
            <p className="sync-auth-subtitle">
              {isAr
                ? "اكتب الإيميل بتاعك وهنبعتلك رابط لتغيير كلمة المرور"
                : "Enter your email and we'll send you a reset link"}
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

              <button
                type="submit"
                className="sync-auth-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 size={20} className="sync-spin" />
                ) : (
                  <>
                    <span>{isAr ? "إرسال رابط التغيير" : "Send Reset Link"}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="sync-auth-footer-text">
              <Link href="/auth/login" className="sync-auth-link">
                {isAr ? "← الرجوع لتسجيل الدخول" : "← Back to Sign In"}
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
