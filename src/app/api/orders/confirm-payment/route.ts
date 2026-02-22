import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findOne({
      _id: orderId,
      user: session.user.id,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Already paid, nothing to do
    if (order.status !== "awaiting_payment") {
      return NextResponse.json({ status: order.status });
    }

    // No Stripe session saved yet
    if (!order.stripeSessionId) {
      return NextResponse.json({ status: order.status });
    }

    // Verify payment with Stripe
    const stripeSession = await stripe.checkout.sessions.retrieve(
      order.stripeSessionId
    );

    if (stripeSession.payment_status === "paid") {
      const paymentIntentId = stripeSession.payment_intent as string;

      await Order.findByIdAndUpdate(orderId, {
        status: "paid",
        stripePaymentIntentId: paymentIntentId || "",
      });

      return NextResponse.json({ status: "paid" });
    }

    return NextResponse.json({ status: order.status });
  } catch (error) {
    console.error("Error confirming payment:", error);
    return NextResponse.json(
      { error: "Failed to confirm payment" },
      { status: 500 }
    );
  }
}
