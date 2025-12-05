// services/stripeService.ts
import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

  if (!key) {
    console.warn("Stripe publishable key not set; Stripe is disabled.");
    return Promise.resolve(null);
  }

  if (!stripePromise) {
    stripePromise = loadStripe(key);
  }

  return stripePromise;
};

/**
 * TEMP STUB:
 * Satisfies imports from DesignDetail.tsx without actually charging anyone.
 * Later, replace with a real backend call that creates a Checkout Session.
 */
export const createDesignCheckoutSession = async (designId: string) => {
  const stripe = await getStripe();

  if (!stripe) {
    console.warn(
      "Stripe is not configured yet. Skipping design checkout for:",
      designId
    );
    alert("Payments for designs are not live yet, but the rest of Ink Link works!");
    return;
  }

  // TODO: real backend call + redirectToCheckout
  console.log(
    "[Stub] Would create Stripe Checkout session for design:",
    designId
  );
};

/**
 * TEMP STUB:
 * Satisfies imports from BookingDetail.tsx without actually charging anyone.
 * Later, replace with a real backend call for booking deposits.
 */
export const createBookingDepositSession = async (bookingId: string) => {
  const stripe = await getStripe();

  if (!stripe) {
    console.warn(
      "Stripe is not configured yet. Skipping booking deposit for:",
      bookingId
    );
    alert("Booking deposits are not live yet, but the rest of Ink Link works!");
    return;
  }

  // TODO: real backend call + redirectToCheckout
  console.log(
    "[Stub] Would create Stripe Checkout session for booking deposit:",
    bookingId
  );
};
