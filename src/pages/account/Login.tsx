import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { firebaseAuth } from "../../lib/firebaseClient";
import { useAuth } from "../../context/AuthContext";

const PHONE_RE = /^[6-9]\d{9}$/;

export function Login() {
  const { status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "signedIn") {
      const from = (location.state as { from?: Location })?.from?.pathname ?? "/account";
      navigate(from, { replace: true });
    }
  }, [status, navigate, location.state]);

  const sendOtp = async () => {
    setError("");
    if (!PHONE_RE.test(phone)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setBusy(true);
    try {
      if (!firebaseAuth) throw new Error("Sign-in isn't set up yet — please check back soon");
      if (!recaptchaContainerRef.current) throw new Error("Recaptcha not ready");
      const verifier = new RecaptchaVerifier(firebaseAuth, recaptchaContainerRef.current, {
        size: "invisible",
      });
      confirmationRef.current = await signInWithPhoneNumber(firebaseAuth, `+91${phone}`, verifier);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    setError("");
    if (!confirmationRef.current) {
      setError("Please request the OTP again");
      setStep("phone");
      return;
    }
    setBusy(true);
    try {
      await confirmationRef.current.confirm(code);
      // Navigation happens via the useEffect above once auth state updates.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-24">
      <h1 className="text-center text-3xl text-plum">Sign in</h1>
      <p className="mt-2 text-center text-sm text-plum/60">
        {step === "phone" ? "Enter your mobile number to continue" : `Enter the code sent to +91 ${phone}`}
      </p>

      <div className="mt-8 space-y-4">
        {step === "phone" ? (
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
              onClick={() => setStep("phone")}
              className="w-full text-center text-sm text-plum/50 hover:text-plum"
            >
              Change number
            </button>
          </>
        )}
      </div>

      <div ref={recaptchaContainerRef} />
    </div>
  );
}
