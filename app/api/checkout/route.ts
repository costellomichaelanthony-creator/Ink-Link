
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
  try {
    const { type, designId, bookingId, userId, amountCents } = await req.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    let sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${baseUrl}/${type === 'design' ? 'designs' : 'bookings'}/${type === 'design' ? designId : bookingId}?success=true`,
      cancel_url: `${baseUrl}/${type === 'design' ? 'designs' : 'bookings'}/${type === 'design' ? designId : bookingId}?canceled=true`,
      metadata: {
        userId,
        type,
      },
    };

    if (type === 'design') {
      // 1. Fetch design details (In reality, fetch from DB to verify price)
      // For this example, we assume we fetch price from DB using designId
      // const design = await db.query...
      // const price = design.price_cents;
      const price = 5000; // Mock price

      sessionConfig.line_items = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Tattoo Flash Design',
              metadata: { designId },
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ];
      sessionConfig.metadata!.designId = designId;
    } else if (type === 'booking_deposit') {
      sessionConfig.line_items = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Booking Deposit',
              metadata: { bookingId },
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ];
      sessionConfig.metadata!.bookingId = bookingId;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ sessionId: session.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
