import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { orderId } = await params;
    await connectDB();

    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { orderId } = await params;

    await connectDB();

    const order = await Order.findById(orderId).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { orderId } = await params;
    const { status, adminNote } = await req.json();

    const validStatuses = [
      "awaiting_payment",
      "paid",
      "accepted",
      "shipped",
      "delivered",
      "declined",
      "cancelled",
    ];

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await connectDB();

    // If declining, attempt automatic refund via Stripe
    if (status === "declined") {
      const existingOrder = await Order.findById(orderId).lean();
      if (!existingOrder) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      let paymentIntentId = existingOrder.stripePaymentIntentId;

      // Fallback: if paymentIntentId missing, retrieve it from the Stripe session
      if (!paymentIntentId && existingOrder.stripeSessionId) {
        try {
          const stripeSession = await stripe.checkout.sessions.retrieve(
            existingOrder.stripeSessionId
          );
          if (stripeSession.payment_intent) {
            paymentIntentId = stripeSession.payment_intent as string;
            // Save it for future reference
            await Order.findByIdAndUpdate(orderId, { stripePaymentIntentId: paymentIntentId });
          }
        } catch (sessionErr) {
          console.error("Failed to retrieve Stripe session:", sessionErr);
        }
      }

      if (paymentIntentId) {
        try {
          await stripe.refunds.create({
            payment_intent: paymentIntentId,
          });
        } catch (refundErr) {
          console.error("Stripe refund failed:", refundErr);
          return NextResponse.json(
            { error: "Failed to process refund. Please refund manually in Stripe Dashboard." },
            { status: 500 }
          );
        }
      } else {
        console.error("No payment intent found for order:", orderId);
        return NextResponse.json(
          { error: "No payment information found. Please refund manually in Stripe Dashboard." },
          { status: 500 }
        );
      }
    }

    const update: Record<string, string> = {};
    if (status) update.status = status;
    if (adminNote !== undefined) update.adminNote = adminNote;

    const order = await Order.findByIdAndUpdate(orderId, update, {
      new: true,
    }).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
