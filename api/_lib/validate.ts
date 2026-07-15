import type { OrderAddress } from "../../src/types.js";
import type { AddressInput } from "./addresses.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/; // Indian mobile numbers
const PINCODE_RE = /^\d{6}$/;

export function validateAddress(input: unknown): OrderAddress {
  const a = input as Partial<OrderAddress> | null;
  if (!a || typeof a !== "object") throw new Error("Missing address");

  const name = (a.name ?? "").trim();
  const email = (a.email ?? "").trim();
  const phone = (a.phone ?? "").trim();
  const address = (a.address ?? "").trim();
  const city = (a.city ?? "").trim();
  const state = (a.state ?? "").trim();
  const pincode = (a.pincode ?? "").trim();

  if (!name) throw new Error("Name is required");
  if (!EMAIL_RE.test(email)) throw new Error("Invalid email address");
  if (!PHONE_RE.test(phone)) throw new Error("Invalid 10-digit mobile number");
  if (!address) throw new Error("Address is required");
  if (!city) throw new Error("City is required");
  if (!state) throw new Error("State is required");
  if (!PINCODE_RE.test(pincode)) throw new Error("Invalid 6-digit pincode");

  return { name, email, phone, address, city, state, pincode, country: "India" };
}

export function validateAddressInput(input: unknown): AddressInput {
  const a = input as Partial<AddressInput> | null;
  if (!a || typeof a !== "object") throw new Error("Missing address");

  const label = (a.label ?? "").trim();
  const name = (a.name ?? "").trim();
  const phone = (a.phone ?? "").trim();
  const address = (a.address ?? "").trim();
  const city = (a.city ?? "").trim();
  const state = (a.state ?? "").trim();
  const pincode = (a.pincode ?? "").trim();

  if (!name) throw new Error("Name is required");
  if (!PHONE_RE.test(phone)) throw new Error("Invalid 10-digit mobile number");
  if (!address) throw new Error("Address is required");
  if (!city) throw new Error("City is required");
  if (!state) throw new Error("State is required");
  if (!PINCODE_RE.test(pincode)) throw new Error("Invalid 6-digit pincode");

  return { label: label || undefined, name, phone, address, city, state, pincode, isDefault: !!a.isDefault };
}
