import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";

const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Method = "phone" | "email";
type EmailMode = "signin" | "signup";
type PhoneStep = "phone" | "otp";

export function Login() {
  const { status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [method, setMethod] = useState<Method>("phone");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Phone/OTP state
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  // Email/password state
  const [emailMode, setEmailMode] = useState<EmailMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (status === "signedIn") {
      const from = (location.state as { from?: Location })?.from?.pathname ?? "/account";
      navigate(from, { replace: true });
    }
  }, [status, navigate, location.state]);

  const switchMethod = (m: Method) => {
    setMethod(m);
    setError("");
  };

  const sendOtp = async () => {
    setError("");
    if (!PHONE_RE.test(phone)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setBusy(true);
    try {
      if (!supabase) throw new Error("Sign-in isn't set up yet — please check back soon");
      const { error: err } = await supabase.auth.signInWithOtp({ phone: `+91${phone}` });
      if (err) throw err;
      setPhoneStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    setError("");
    setBusy(true);
    try {
      if (!supabase) throw new Error("Sign-in isn't set up yet — please check back soon");
      const { error: err } = await supabase.auth.verifyOtp({
        phone: `+91${phone}`,
        token: code,
        type: "sms",
      });
      if (err) throw err;
      // Navigation happens via the useEffect above once auth state updates.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setBusy(false);
    }
  };

  const submitEmail = async () => {
    setError("");
    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setBusy(true);
    try {
      if (!supabase) throw new Error("Sign-in isn't set up yet — please check back soon");
      const { error: err } =
        emailMode === "signup"
          ? await supabase.auth.signUp({ email, password })
          : await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      // Navigation happens via the useEffect above once auth state updates.
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(
        message.includes("already registered") ? "An account already exists with this email — try signing in instead."
        : message.includes("Invalid login credentials") ? "Incorrect email or password."
        : message
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-24">
      <h1 className="text-center text-3xl text-plum">Sign in</h1>

      <div className="mx-auto mt-6 flex max-w-xs rounded-full bg-plum/5 p-1">
        <button
          onClick={() => switchMethod("phone")}
          className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
            method === "phone" ? "bg-white text-plum shadow-soft" : "text-plum/50"
          }`}
        >
          Phone OTP
        </button>
        <button
          onClick={() => switchMethod("email")}
          className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
            method === "email" ? "bg-white text-plum shadow-soft" : "text-plum/50"
          }`}
        >
          Email & password
        </button>
      </div>

      {method === "phone" ? (
        <>
          <p className="mt-4 text-center text-sm text-plum/60">
            {phoneStep === "phone" ? "Enter your mobile number to continue" : `Enter the code sent to +91 ${phone}`}
          </p>
          <div className="mt-6 space-y-4">
            {phoneStep === "phone" ? (
              <>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-plum">Mobile number</span>
                  <div className="flex items-center rounded-xl border border-plum/20 bg-white px-4 focus-within:border-brass">
                    <span className="text-sm text-plum/50">+91</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="w-full bg-transparent px-2 py-2.5 text-sm outline-none"
                      placeholder="9876543210"
                    />
                  </div>
                </label>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  onClick={sendOtp}
                  disabled={busy}
                  className="w-full rounded-full bg-plum py-3 text-sm font-semibold text-ivory hover:bg-berry disabled:opacity-40"
                >
                  {busy ? "Sending…" : "Send OTP"}
                </button>
              </>
            ) : (
              <>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-plum">OTP</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full rounded-xl border border-plum/20 bg-white px-4 py-2.5 text-center text-lg tracking-widest outline-none focus:border-brass"
                    placeholder="••••••"
                  />
                </label>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  onClick={verifyOtp}
                  disabled={busy || code.length < 6}
                  className="w-full rounded-full bg-plum py-3 text-sm font-semibold text-ivory hover:bg-berry disabled:opacity-40"
                >
                  {busy ? "Verifying…" : "Verify & continue"}
                </button>
                <button
                  onClick={() => setPhoneStep("phone")}
                  className="w-full text-center text-sm text-plum/50 hover:text-plum"
                >
                  Change number
                </button>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="mt-4 text-center text-sm text-plum/60">
            {emailMode === "signin" ? "Sign in with your email and password" : "Create an account with email and password"}
          </p>
          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-plum">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-plum/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-brass"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-plum">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-plum/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-brass"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              onClick={submitEmail}
              disabled={busy || !email || !password}
              className="w-full rounded-full bg-plum py-3 text-sm font-semibold text-ivory hover:bg-berry disabled:opacity-40"
            >
              {busy ? "Please wait…" : emailMode === "signin" ? "Sign in" : "Create account"}
            </button>
            <button
              onClick={() => { setEmailMode(emailMode === "signin" ? "signup" : "signin"); setError(""); }}
              className="w-full text-center text-sm text-plum/50 hover:text-plum"
            >
              {emailMode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
