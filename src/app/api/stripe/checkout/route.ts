import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
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

    const {
      items,
      shippingAddress,
      shippingMethod,
      subtotal,
      discountPercent,
      discountAmount,
      shippingCost,
      total,
      currency: paymentCurrency,
      exchangeRate,
    } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address) {
      return NextResponse.json({ error: "Shipping address is required" }, { status: 400 });
    }

    const stripeCurrency = (paymentCurrency || "chf").toLowerCase();
    const rate = exchangeRate || 1;

    await connectDB();

    const order = await Order.create({
      user: session.user.id,
      email: session.user.email,
      items,
      shippingAddress,
      shippingMethod,
      subtotal,
      discountPercent,
      discountAmount,
      shippingCost,
      total,
      paymentCurrency: stripeCurrency.toUpperCase(),
      exchangeRate: rate,
      status: "awaiting_payment",
    });

    const lineItems = items.map((item: { name: string; team: string; kitType: string; size: string; quantity: number; totalPrice: number }) => ({
      price_data: {
        currency: stripeCurrency,
        product_data: {
          name: `${item.team} - ${item.name}`,
          description: `Size: ${item.size} | Type: ${item.kitType}`,
        },
        unit_amount: Math.round((item.totalPrice / item.quantity) * rate * 100),
      },
      quantity: item.quantity,
    }));

    if (discountAmount > 0) {
      lineItems.push({
        price_data: {
          currency: stripeCurrency,
          product_data: {
            name: `Discount (${discountPercent}%)`,
            description: "Bulk order discount",
          },
          unit_amount: -Math.round(discountAmount * rate * 100),
        },
        quantity: 1,
      });
    }

    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: stripeCurrency,
          product_data: {
            name: `Shipping (${shippingMethod})`,
            description: shippingMethod === "express" ? "7-15 days" : "15-30 days",
          },
          unit_amount: Math.round(shippingCost * rate * 100),
        },
        quantity: 1,
      });
    }

    const origin = req.headers.get("origin") || process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Card includes Apple Pay & Google Pay automatically when enabled in Stripe Dashboard.
    // Twint only works with CHF - try it, fallback to card-only if not activated.
    const baseMethods: string[] =
      stripeCurrency === "chf" ? ["card", "twint"] : ["card"];

    let stripeSession;
    try {
      stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: baseMethods as Stripe.Checkout.SessionCreateParams.PaymentMethodType[],
        line_items: lineItems,
        mode: "payment",
        success_url: `${origin}/checkout/success?orderId=${order._id}`,
        cancel_url: `${origin}/checkout/cancel?orderId=${order._id}`,
        customer_email: session.user.email,
        metadata: {
          orderId: order._id.toString(),
          userId: session.user.id,
        },
      });
    } catch (err: unknown) {
      // If twint is not enabled in dashboard, retry without it
      if (
        baseMethods.includes("twint") &&
        err instanceof Error &&
        err.message.includes("twint")
      ) {
        stripeSession = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: "payment",
          success_url: `${origin}/checkout/success?orderId=${order._id}`,
          cancel_url: `${origin}/checkout/cancel?orderId=${order._id}`,
          customer_email: session.user.email,
          metadata: {
            orderId: order._id.toString(),
            userId: session.user.id,
          },
        });
      } else {
        throw err;
      }
    }

    await Order.findByIdAndUpdate(order._id, {
      stripeSessionId: stripeSession.id,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
