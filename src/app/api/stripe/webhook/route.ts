import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      await connectDB();

      const paymentIntentId = session.payment_intent as string;
      const orderId = session.metadata?.orderId;

      console.log(`Webhook: checkout.session.completed for order ${orderId}, payment_intent: ${paymentIntentId}`);

      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          status: "paid",
          stripePaymentIntentId: paymentIntentId || "",
        });
      }
    } catch (err) {
      console.error("Error updating order:", err);
      return NextResponse.json(
        { error: "Error updating order" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
