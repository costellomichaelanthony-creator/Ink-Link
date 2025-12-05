
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { type, userId, designId, bookingId } = session.metadata!;

    if (type === 'design' && designId) {
      // 1. Mark design as sold
      await supabase.from('designs').update({ is_available: false }).eq('id', designId);
      
      // 2. Record purchase
      await supabase.from('design_purchases').insert({
        design_id: designId,
        buyer_id: userId,
        amount_cents: session.amount_total,
        stripe_payment_intent_id: session.payment_intent as string,
      });
    } else if (type === 'booking_deposit' && bookingId) {
      // 1. Update booking status
      await supabase.from('bookings').update({ 
        status: 'DEPOSIT_PAID',
        deposit_amount_cents: session.amount_total
      }).eq('id', bookingId);
    }
  }

  return NextResponse.json({ received: true });
}
