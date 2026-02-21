"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";
import AdminProductForm from "@/components/AdminProductForm";
import Link from "next/link";

export default function EditProductPage() {
  const params = useParams();
  const productId = params.productId as string;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (productId) {
      fetch(`/api/admin/products/${productId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Product not found");
          return res.json();
        })
        .then((data) => {
          setProduct(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-zinc-400 mb-4">{error || "Product not found"}</p>
          <Link
            href="/admin/products"
            className="text-sm text-amber-400 hover:text-amber-300"
          >
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  return <AdminProductForm initialData={product} isEditing />;
}
