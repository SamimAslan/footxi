import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import ProductModel from "@/models/Product";

export type ProductMetaPayload = {
  name: string;
  image: string;
  description: string;
};

export async function getProductForMetadata(productId: string): Promise<ProductMetaPayload | null> {
  if (!mongoose.Types.ObjectId.isValid(productId)) return null;
  try {
    await connectDB();
    const p = await ProductModel.findOne({ _id: productId, isActive: true })
      .select("name team league season kitType image")
      .lean();
    if (!p || typeof p.name !== "string") return null;
    const image = typeof p.image === "string" ? p.image : "";
    const description = `${p.name} — ${p.team}, ${p.league}. Quality football kit (${p.season || ""}). Secure checkout & worldwide delivery at FootXI.`;
    return { name: p.name, image, description };
  } catch {
    return null;
  }
}
