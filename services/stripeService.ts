
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export const createDesignCheckoutSession = async (designId: string, userId: string) => {
  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'design',
        designId,
        userId,
      }),
    });

    const { sessionId, error } = await response.json();

    if (error) throw new Error(error);

    const stripe = await stripePromise;
    if (stripe) {
      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
      if (stripeError) throw stripeError;
    }
  } catch (error) {
    console.error('Checkout Error:', error);
    throw error;
  }
};

export const createBookingDepositSession = async (bookingId: string, amountCents: number, userId: string) => {
  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'booking_deposit',
        bookingId,
        amountCents,
        userId,
      }),
    });

    const { sessionId, error } = await response.json();

    if (error) throw new Error(error);

    const stripe = await stripePromise;
    if (stripe) {
      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
      if (stripeError) throw stripeError;
    }
  } catch (error) {
    console.error('Checkout Error:', error);
    throw error;
  }
};
