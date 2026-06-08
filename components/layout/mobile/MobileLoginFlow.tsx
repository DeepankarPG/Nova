"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, ArrowLeft, Mail, Phone, ChevronDown, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Types ───────────────────────────────────────────────── */
type Step = "welcome" | "email" | "phone" | "otp" | "signup";
type AuthMode = "email" | "phone";

/* ─── Dial codes ──────────────────────────────────────────── */
const DIAL_CODES = [
  { code: "+91",  flag: "🇮🇳", country: "India"        },
  { code: "+1",   flag: "🇺🇸", country: "USA"          },
  { code: "+44",  flag: "🇬🇧", country: "UK"           },
  { code: "+971", flag: "🇦🇪", country: "UAE"          },
  { code: "+65",  flag: "🇸🇬", country: "Singapore"    },
  { code: "+61",  flag: "🇦🇺", country: "Australia"    },
  { code: "+81",  flag: "🇯🇵", country: "Japan"        },
  { code: "+49",  flag: "🇩🇪", country: "Germany"      },
  { code: "+33",  flag: "🇫🇷", country: "France"       },
  { code: "+966", flag: "🇸🇦", country: "Saudi Arabia" },
  { code: "+60",  flag: "🇲🇾", country: "Malaysia"     },
  { code: "+62",  flag: "🇮🇩", country: "Indonesia"    },
  { code: "+63",  flag: "🇵🇭", country: "Philippines"  },
] as const;

const GRADIENT = "linear-gradient(180deg, #001a6e 0%, #003dbf 15%, #0057e3 34%, #2b7de9 50%, #5b9cf6 57%, #c7ddfb 62%, #eef5ff 66%, #ffffff 70%, #ffffff 100%)";

/* ─── Globe illustration ──────────────────────────────────── */
const CHIPS = [
  { sym: "₹", label: "INR", style: { top:  -2, right: 16 }, delay: 0    },
  { sym: "$", label: "USD", style: { top:  76, right: -4 }, delay: 0.5  },
  { sym: "€", label: "EUR", style: { bottom: -2, left: 16 }, delay: 1.0 },
  { sym: "£", label: "GBP", style: { top:  76, left: -4 }, delay: 1.5  },
];

function GlobeIllustration() {
  return (
    <div className="relative" style={{ width: 192, height: 192 }}>
      {/* Soft outer glow rings */}
      {[0, 1].map(i => (
        <motion.div key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: -(i + 1) * 20,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          animate={{ opacity: [0.5, 0.15, 0.5] }}
          transition={{ duration: 3.5, delay: i * 1.1, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Glass circle */}
      <div className="absolute rounded-full flex items-center justify-center"
        style={{
          inset: 16,
          background: "rgba(255,255,255,0.13)",
          border: "1.5px solid rgba(255,255,255,0.24)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
      >
        {/* Globe SVG — scaled up, white */}
        <Image src="/globe.svg" alt="" width={68} height={68}
          className="object-contain"
          style={{ filter: "brightness(0) invert(1)", opacity: 0.88 }}
        />
      </div>

      {/* Floating currency chips */}
      {CHIPS.map(chip => (
        <motion.div key={chip.label}
          className="absolute flex items-center gap-1 px-2.5 py-[5px] rounded-full"
          style={{
            ...chip.style,
            background: "rgba(255,255,255,0.17)",
            border: "1px solid rgba(255,255,255,0.3)",
            backdropFilter: "blur(8px)",
          }}
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 3, delay: chip.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 700, lineHeight: 1 }}>{chip.sym}</span>
          <span style={{ color: "rgba(255,255,255,0.62)", fontSize: 8.5, fontWeight: 600, letterSpacing: 0.3 }}>{chip.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Icons ───────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57C21.36 17 22.56 14.92 22.56 12.25z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function MetaIcon() {
  return (
    <svg width="22" height="13" viewBox="0 0 44 24" fill="none" aria-hidden>
      <path d="M2 12C2 7.03 5.58 3 10 3c2.38 0 4.6 1.18 6.5 3.65C18.4 4.18 20.62 3 23 3c4.42 0 8 4.03 8 9s-3.58 9-8 9c-2.38 0-4.6-1.18-6.5-3.65C14.6 19.82 12.38 21 10 21c-4.42 0-8-4.03-8-9z"
        stroke="#0866FF" strokeWidth="2.5" fill="none"/>
      <path d="M11 12c0-3.09 1.79-5.6 4-5.6M19 12c0 3.09-1.79 5.6-4 5.6"
        stroke="#0866FF" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

/* ─── Shared components ───────────────────────────────────── */
const INPUT_CLS = "w-full rounded-2xl border border-border bg-muted/35 px-4 py-3.5 text-[14px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-shadow";

function SocialButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="w-full flex items-center py-[14px] rounded-2xl border border-border/80 bg-card text-[14px] font-semibold text-foreground hover:bg-muted/40 active:scale-[0.98] transition-all"
    >
      <span className="w-12 flex items-center justify-center shrink-0">{icon}</span>
      <span className="flex-1 text-center pr-12">{label}</span>
    </button>
  );
}

function PrimaryBtn({ children, disabled, loading, onClick }: {
  children: React.ReactNode; disabled?: boolean; loading?: boolean; onClick?: () => void;
}) {
  return (
    <button type="button" disabled={disabled || loading} onClick={onClick}
      className={cn(
        "w-full py-4 rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2 transition-all",
        !disabled && !loading
          ? "bg-primary text-white shadow-sm active:scale-[0.98]"
          : "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
      )}
    >
      {loading
        ? <div className="h-5 w-5 rounded-full border-[2.5px] border-white/30 border-t-white animate-spin" />
        : children}
    </button>
  );
}

/* ─── Main export ─────────────────────────────────────────── */
export function MobileLoginFlow({ onDone, contained = false }: { onDone: () => void; contained?: boolean }) {
  const pos = contained ? "absolute" : "fixed";

  const [step,    setStep]    = useState<Step>("welcome");
  const [id,      setId]      = useState("");
  const [pwd,     setPwd]     = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [otp,     setOtp]     = useState("");
  const [cd,      setCd]      = useState(30);
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [company, setCompany] = useState("");
  const [spwd,    setSpwd]    = useState("");
  const [showSpwd,setShowSpwd]= useState(false);
  const [loading,  setLoading]  = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("email");
  const [phoneNum, setPhoneNum] = useState("");
  const [dialCode, setDialCode]       = useState("+91");
  const [dialSearch, setDialSearch]   = useState("");
  const [showDialSheet, setShowDialSheet] = useState(false);
  const otpRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step !== "otp") return;
    setCd(30);
    const t = setInterval(() => setCd(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [step]);

  useEffect(() => {
    if (step === "otp")   setTimeout(() => otpRef.current?.focus(), 80);
    if (step === "phone") setTimeout(() => phoneRef.current?.focus(), 80);
  }, [step]);

  const canGo = (() => {
    if (step === "email")  return id.trim().length > 3 && pwd.trim().length > 0;
    if (step === "phone")  return phoneNum.replace(/\D/g, "").length >= 7;
    if (step === "otp")    return otp.length === 6;
    if (step === "signup") return !!(name.trim() && email.trim() && spwd.trim());
    return false;
  })();

  const simulate = () => { setLoading(true); setTimeout(() => { setLoading(false); onDone(); }, 1100); };

  const next = () => {
    if (!canGo) return;
    if (step === "phone") { setStep("otp"); return; }
    simulate();
  };

  const back = () => {
    if (step === "email" || step === "phone" || step === "signup") setStep("welcome");
    else if (step === "otp") setStep(authMode === "phone" ? "phone" : "email");
    // dialCode handled by showDialSheet boolean, not step
  };

  const filteredDials = DIAL_CODES.filter(d =>
    d.country.toLowerCase().includes(dialSearch.toLowerCase()) ||
    d.code.includes(dialSearch)
  );

  return (
    <div className={`${pos} inset-0 z-[150] flex flex-col overflow-hidden`}
      style={{ borderRadius: contained ? 42 : 0 }}
    >
      <AnimatePresence mode="wait">

        {/* ════════════════ WELCOME HERO ════════════════ */}
        {step === "welcome" && (
          <motion.div key="welcome" className="absolute inset-0 flex flex-col"
            style={{ background: GRADIENT }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
          >
            {/* ── Blue zone: logo + illustration + headline (~58% of screen) ── */}
            <div className="flex flex-col shrink-0" style={{ height: "58%" }}>
              {/* PG logo — top left */}
              <div className="flex items-center gap-1.5 px-5 pt-6 pb-0 shrink-0">
                <Image src="/PG-logo.svg" alt="PayGlocal" width={20} height={20}
                  className="h-5 w-5 object-contain shrink-0" priority />
                <Image src="/PG-logo_workmark.svg" alt="PayGlocal" width={88} height={20}
                  className="h-5 w-[88px] object-contain object-left shrink-0" priority />
              </div>

              {/* Illustration */}
              <div className="flex-1 flex items-center justify-center">
                <GlobeIllustration />
              </div>

              {/* Headline */}
              <div className="px-6 pb-5">
                <h1 className="text-[24px] font-bold text-white leading-tight tracking-tight">
                  Your gateway to<br />global payments
                </h1>
                <p className="text-[13px] mt-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                  Accept payments from 180+ countries
                </p>
              </div>
            </div>

            {/* ── White zone: all buttons (gradient is white here) ── */}
            <div className="flex-1 flex flex-col px-5 pt-5 pb-0">

              {/* ① Email — primary */}
              <button type="button" onClick={() => { setAuthMode("email"); setStep("email"); }}
                className="w-full py-4 rounded-2xl bg-foreground text-background text-[15px] font-bold flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all mb-2.5"
              >
                <Mail className="h-4 w-4" strokeWidth={2} />
                Continue with email
              </button>

              {/* ② Phone — primary */}
              <button type="button" onClick={() => { setAuthMode("phone"); setStep("phone"); }}
                className="w-full py-4 rounded-2xl bg-foreground text-background text-[15px] font-bold flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all mb-4"
              >
                <Phone className="h-4 w-4" strokeWidth={2} />
                Continue with phone
              </button>

              {/* ③ Social — 2 columns */}
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <button type="button" onClick={onDone}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-border/60 bg-white text-[13px] font-semibold text-foreground active:scale-[0.98] transition-all"
                >
                  <GoogleIcon /> Google
                </button>
                <button type="button" onClick={onDone}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-border/60 bg-white text-[13px] font-semibold text-foreground active:scale-[0.98] transition-all"
                >
                  <MetaIcon /> Meta
                </button>
              </div>

              <div className="flex-1" />

              {/* OR + no account */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px bg-border/60" />
                <span className="text-[11px] text-muted-foreground/60 font-medium tracking-wider">OR</span>
                <div className="flex-1 h-px bg-border/60" />
              </div>

              <button type="button" onClick={() => setStep("signup")}
                className="w-full py-3.5 rounded-2xl border-2 border-foreground/20 bg-white text-[14px] font-semibold text-foreground active:scale-[0.98] transition-all mb-4"
              >
                I don&apos;t have an account
              </button>

              <p className="text-center text-[10.5px] text-muted-foreground/45 pb-5">
                Terms of Use · Privacy Policy
              </p>
            </div>
          </motion.div>
        )}

        {/* ════════════════ FORM SCREENS ════════════════ */}
        {step !== "welcome" && (
          <motion.div key="form" className="absolute inset-0 bg-background flex flex-col"
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Back button — left only, no logo clutter */}
            <div className="px-5 pt-5 pb-0 shrink-0">
              <button type="button" onClick={back}
                className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-muted/80 transition-colors"
              >
                <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2} />
              </button>
            </div>

            {/* Form content — scrollable */}
            <div className="flex-1 overflow-y-auto px-5 pb-4" style={{ scrollbarWidth: "none" }}>
              <AnimatePresence mode="wait">

                {/* ── Sign in (email + password combined) ── */}
                {step === "email" && (
                  <motion.div key="s-email"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                    className="flex flex-col"
                  >
                    {/* Title */}
                    <div className="pt-8 pb-8">
                      <h1 className="text-[28px] font-bold text-foreground leading-tight tracking-tight">Sign in</h1>
                      <p className="text-[14px] text-muted-foreground mt-1.5">Log in to continue</p>
                    </div>

                    {/* Fields with labels */}
                    <div className="flex flex-col gap-4">
                      <div>
                        <p className="text-[13px] font-semibold text-foreground mb-2">Email or phone number</p>
                        <input type="text" value={id} onChange={e => setId(e.target.value)}
                          placeholder="e.g. name@company.com"
                          autoFocus
                          className="w-full rounded-2xl bg-primary/[0.07] px-4 py-4 text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[13px] font-semibold text-foreground">Password</p>
                          <button type="button" className="text-[12px] text-primary font-semibold">
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <input type={showPwd ? "text" : "password"} value={pwd}
                            onChange={e => setPwd(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full rounded-2xl bg-primary/[0.07] px-4 py-4 pr-12 text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                            onKeyDown={e => e.key === "Enter" && canGo && next()}
                          />
                          <button type="button" onClick={() => setShowPwd(s => !s)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                          >
                            {showPwd ? <EyeOff className="h-[18px] w-[18px]" strokeWidth={1.75} /> : <Eye className="h-[18px] w-[18px]" strokeWidth={1.75} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* OTP alternative + create account */}
                    <div className="flex items-center gap-3 mt-6 mb-4">
                      <div className="flex-1 h-px bg-border/60" />
                      <span className="text-[11px] text-muted-foreground/60 font-medium tracking-wider">OR</span>
                      <div className="flex-1 h-px bg-border/60" />
                    </div>
                    <button type="button" onClick={() => setStep("otp")}
                      className="w-full py-4 rounded-2xl border border-border bg-card text-[14px] font-semibold text-primary hover:bg-muted/40 active:scale-[0.98] transition-all"
                    >
                      Proceed with Email OTP
                    </button>
                  </motion.div>
                )}

                {/* ── Phone ── */}
                {step === "phone" && (
                  <motion.div key="s-phone"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                    className="flex flex-col"
                  >
                    <div className="pt-8 pb-8">
                      <h1 className="text-[28px] font-bold text-foreground leading-tight tracking-tight">Enter your phone number</h1>
                      <p className="text-[14px] text-muted-foreground mt-2 leading-snug">
                        Enter your number to log in or create an account
                      </p>
                    </div>

                    {/* Dial code + phone input */}
                    <p className="text-[13px] font-semibold text-foreground mb-2">Phone number</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowDialSheet(true)}
                        className="flex items-center gap-1.5 rounded-2xl bg-primary/[0.07] px-3.5 py-4 text-[15px] font-medium text-foreground shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                      >
                        <span className="text-[18px]">{DIAL_CODES.find(d => d.code === dialCode)?.flag}</span>
                        <span className="text-[14px] font-semibold">{dialCode}</span>
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
                      </button>
                      <input
                        ref={phoneRef}
                        type="tel"
                        inputMode="numeric"
                        value={phoneNum}
                        onChange={e => setPhoneNum(e.target.value.replace(/[^\d\s\-]/g, ""))}
                        placeholder="Phone number"
                        className="flex-1 min-w-0 rounded-2xl bg-primary/[0.07] px-4 py-4 text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                        onKeyDown={e => e.key === "Enter" && canGo && next()}
                      />
                    </div>

                    {/* spacer — "create account" moved to pinned footer */}
                  </motion.div>
                )}

                {/* ── OTP ── */}
                {step === "otp" && (
                  <motion.div key="s-otp"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                    className="flex flex-col"
                  >
                    <div className="pt-8 pb-8">
                      <h1 className="text-[28px] font-bold text-foreground leading-tight tracking-tight">
                        {authMode === "phone" ? "Enter the code" : "Check your email"}
                      </h1>
                      <p className="text-[14px] text-muted-foreground mt-2 leading-snug">
                        {authMode === "phone"
                          ? <>Sent to <span className="font-semibold text-foreground">{dialCode} {phoneNum}</span>.{" "}
                              <button type="button" onClick={() => setStep("phone")} className="text-primary font-semibold">Change</button></>
                          : <>We sent a 6-digit code to <span className="font-semibold text-foreground">{id}</span></>
                        }
                      </p>
                    </div>

                    {/* OTP boxes */}
                    <div className="relative mb-4">
                      <input ref={otpRef} type="text" inputMode="numeric" maxLength={6}
                        value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-default"
                        onKeyDown={e => e.key === "Enter" && otp.length === 6 && next()}
                      />
                      <div className="flex gap-2" onClick={() => otpRef.current?.focus()}>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className={cn(
                            "flex-1 h-[54px] rounded-xl flex items-center justify-center text-[22px] font-bold text-foreground transition-all border-2",
                            otp[i]             ? "border-primary bg-primary/[0.07]"
                            : i === otp.length  ? "border-primary bg-card ring-2 ring-primary/15"
                                                : "border-border/60 bg-primary/[0.04]"
                          )}>
                            {otp[i] ?? ""}
                          </div>
                        ))}
                      </div>
                    </div>

                    <PrimaryBtn disabled={otp.length < 6} loading={loading} onClick={next}>
                      Verify <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                    </PrimaryBtn>

                    <p className="text-center text-[13px] text-muted-foreground mt-4">
                      {cd > 0
                        ? <>Resend code in <span className="font-semibold text-foreground">{cd}s</span></>
                        : <button type="button" onClick={() => { setOtp(""); setCd(30); }}
                            className="text-primary font-semibold">Resend code</button>}
                    </p>
                  </motion.div>
                )}

                {/* ── Sign up ── */}
                {step === "signup" && (
                  <motion.div key="s-signup"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}
                    className="flex flex-col"
                  >
                    <div className="pt-8 pb-6">
                      <h1 className="text-[28px] font-bold text-foreground leading-tight tracking-tight">Create account</h1>
                      <p className="text-[14px] text-muted-foreground mt-2">Start accepting payments globally</p>
                    </div>

                    <div className="flex flex-col gap-2.5 mb-4">
                      {[
                        { type: "text",     value: name,    set: setName,    ph: "Full name",               pw: false, showpw: false, setshow: () => {} },
                        { type: "email",    value: email,   set: setEmail,   ph: "Work email address",       pw: false, showpw: false, setshow: () => {} },
                        { type: "text",     value: company, set: setCompany, ph: "Company name (optional)",  pw: false, showpw: false, setshow: () => {} },
                      ].map(f => (
                        <input key={f.ph} type={f.type} value={f.value}
                          onChange={e => f.set(e.target.value)} placeholder={f.ph}
                          className="w-full rounded-2xl bg-primary/[0.07] px-4 py-4 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                        />
                      ))}
                      <div className="relative">
                        <input type={showSpwd ? "text" : "password"} value={spwd}
                          onChange={e => setSpwd(e.target.value)} placeholder="Create a password"
                          className="w-full rounded-2xl bg-primary/[0.07] px-4 py-4 pr-12 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                        />
                        <button type="button" onClick={() => setShowSpwd(s => !s)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showSpwd ? <EyeOff className="h-4 w-4" strokeWidth={1.75} /> : <Eye className="h-4 w-4" strokeWidth={1.75} />}
                        </button>
                      </div>
                    </div>

                    <PrimaryBtn disabled={!canGo} loading={loading} onClick={next}>
                      Create Account <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                    </PrimaryBtn>

                    <div className="flex flex-col items-center gap-2 mt-6 pt-5 border-t border-border/40">
                      <p className="text-[13px] text-muted-foreground">
                        Already have an account?{" "}
                        <button type="button" onClick={() => setStep("welcome")} className="text-primary font-semibold">Sign in</button>
                      </p>
                      <p className="text-center text-[10px] text-muted-foreground/45 leading-relaxed">
                        By continuing you agree to our{" "}
                        <span className="underline underline-offset-2">Terms of Use</span>
                        {" "}and{" "}
                        <span className="underline underline-offset-2">Privacy Policy</span>
                      </p>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Pinned CTA — email + phone steps */}
            <AnimatePresence>
              {(step === "email" || step === "phone") && (
                <motion.div key="pinned-cta" className="shrink-0 px-5 pb-5 pt-2"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.2 }}
                >
                  <PrimaryBtn disabled={!canGo} loading={loading} onClick={next}>
                    {step === "phone" ? "Continue" : "Sign in"}{" "}
                    <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                  </PrimaryBtn>
                  <p className="text-center text-[13px] text-muted-foreground mt-3">
                    Don&apos;t have an account?{" "}
                    <button type="button" onClick={() => setStep("signup")} className="text-primary font-semibold">
                      Create one
                    </button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dial code bottom sheet — boolean overlay, no step change = no glitch */}
            <AnimatePresence>
              {showDialSheet && (
                <>
                  <motion.div key="dial-bd"
                    className="absolute inset-0 z-10 bg-black/40"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    onClick={() => { setDialSearch(""); setShowDialSheet(false); }}
                  />
                  <motion.div key="dial-sheet"
                    className="absolute inset-x-0 bottom-0 z-20 flex flex-col bg-background rounded-t-[28px] overflow-hidden"
                    style={{ top: "18%" }}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {/* Handle */}
                    <div className="flex justify-center pt-3 pb-0 shrink-0" aria-hidden>
                      <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
                    </div>
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-border/50 shrink-0">
                      <h2 className="text-[17px] font-bold text-foreground">Country code</h2>
                      <button type="button"
                        onClick={() => { setDialSearch(""); setShowDialSheet(false); }}
                        className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors"
                      >
                        {/* X / close icon */}
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                          <path d="M1 1l12 12M13 1L1 13"/>
                        </svg>
                      </button>
                    </div>
                    {/* Search */}
                    <div className="px-5 py-3 shrink-0">
                      <div className="flex items-center gap-2.5 bg-muted/60 rounded-xl px-3.5 py-2.5">
                        <Search className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={2} />
                        <input type="text" value={dialSearch} onChange={e => setDialSearch(e.target.value)}
                          placeholder="Search country"
                          autoFocus
                          className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                        />
                      </div>
                    </div>
                    {/* List */}
                    <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                      {filteredDials.map((d, i) => (
                        <button key={d.code} type="button"
                          onClick={() => { setDialCode(d.code); setDialSearch(""); setShowDialSheet(false); }}
                          className={cn(
                            "w-full flex items-center gap-3.5 px-5 py-4 text-left hover:bg-muted/40 active:bg-muted/60 transition-colors",
                            i > 0 && "border-t border-border/40"
                          )}
                        >
                          <span className="text-[22px]">{d.flag}</span>
                          <span className="flex-1 text-[14px] font-medium text-foreground">{d.country}</span>
                          <span className="text-[13px] text-muted-foreground font-mono tabular-nums">{d.code}</span>
                          {dialCode === d.code && <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={2.5} />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
