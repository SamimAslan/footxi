import type { Metadata } from "next";
import { getProductForMetadata } from "@/lib/getProductForMetadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productId: string }>;
}): Promise<Metadata> {
  const { productId } = await params;
  const p = await getProductForMetadata(productId);
  if (!p) {
    return {
      title: "Product",
      description: "Football kits and jerseys at FootXI.",
    };
  }
  return {
    title: p.name,
    description: p.description.slice(0, 160),
    openGraph: {
      title: p.name,
      description: p.description.slice(0, 200),
      type: "website",
      images: p.image?.startsWith("http") ? [{ url: p.image }] : undefined,
    },
    twitter: {
      card: p.image?.startsWith("http") ? "summary_large_image" : "summary",
      title: p.name,
      description: p.description.slice(0, 160),
    },
  };
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
