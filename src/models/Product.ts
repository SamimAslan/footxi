import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProductBadge {
  name: string;
  price: number;
}

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  team: string;
  brand?: string;
  league: string;
  leagueSlug: string;
  season: string;
  type: "home" | "away" | "third" | "retro";
  kitType: "fans" | "player" | "retro";
  priceOverride?: number;
  image: string;
  backImage: string;
  sizes: string[];
  badges: IProductBadge[];
  isNewArrival: boolean;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductBadgeSchema = new Schema<IProductBadge>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, default: 3 },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    team: { type: String, required: true },
    brand: { type: String, default: "" },
    league: { type: String, required: true },
    leagueSlug: { type: String, required: true },
    season: { type: String, default: "2025/26" },
    type: {
      type: String,
      enum: ["home", "away", "third", "retro"],
      required: true,
    },
    kitType: {
      type: String,
      enum: ["fans", "player", "retro"],
      required: true,
    },
    priceOverride: { type: Number, required: false },
    image: { type: String, default: "" },
    backImage: { type: String, default: "" },
    sizes: {
      type: [String],
      default: ["S", "M", "L", "XL", "XXL"],
    },
    badges: { type: [ProductBadgeSchema], default: [] },
    isNewArrival: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const ProductModel: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default ProductModel;
