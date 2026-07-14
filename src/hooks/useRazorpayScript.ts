import { useEffect, useState } from "react";

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
}

// Loads the Razorpay Checkout widget script once and reports readiness.
export function useRazorpayScript(): boolean {
  const [loaded, setLoaded] = useState(() => typeof window !== "undefined" && !!window.Razorpay);

  useEffect(() => {
    if (loaded) return;
    if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      setLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);
  }, [loaded]);

  return loaded;
}
