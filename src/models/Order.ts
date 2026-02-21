import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  productId: string;
  name: string;
  team: string;
  league: string;
  kitType: "fans" | "player" | "retro";
  type: string;
  size: string;
  quantity: number;
  badges: { name: string; price: number }[];
  customName: string;
  customNumber: string;
  hasCustomNameNumber: boolean;
  unitPrice: number;
  totalPrice: number;
}

export interface IShippingAddress {
  fullName: string;
  address: string;
  city: string;
  country: string;
  zip: string;
  phone: string;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "accepted"
  | "shipped"
  | "delivered"
  | "declined"
  | "cancelled";

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  email: string;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  shippingMethod: "standard" | "express";
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  shippingCost: number;
  total: number;
  stripeSessionId: string;
  stripePaymentIntentId: string;
  status: OrderStatus;
  paymentCurrency: string;
  exchangeRate: number;
  adminNote: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    team: { type: String, required: true },
    league: { type: String, required: true },
    kitType: { type: String, enum: ["fans", "player", "retro"], required: true },
    type: { type: String, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    badges: [
      {
        name: { type: String },
        price: { type: Number },
      },
    ],
    customName: { type: String, default: "" },
    customNumber: { type: String, default: "" },
    hasCustomNameNumber: { type: Boolean, default: false },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    zip: { type: String, required: true },
    phone: { type: String, default: "" },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
    },
    shippingAddress: {
      type: ShippingAddressSchema,
      required: true,
    },
    shippingMethod: {
      type: String,
      enum: ["standard", "express"],
      default: "standard",
    },
    subtotal: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    shippingCost: { type: Number, required: true },
    total: { type: Number, required: true },
    stripeSessionId: { type: String, default: "" },
    stripePaymentIntentId: { type: String, default: "" },
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "accepted",
        "shipped",
        "delivered",
        "declined",
        "cancelled",
      ],
      default: "pending",
    },
    paymentCurrency: { type: String, default: "CHF" },
    exchangeRate: { type: Number, default: 1 },
    adminNote: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
