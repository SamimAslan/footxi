"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Loader2,
  Plus,
  Upload,
  Search,
  Pencil,
  Trash2,
  Filter,
  Shirt,
  Eye,
  EyeOff,
} from "lucide-react";
import Papa from "papaparse";

interface ProductRow {
  _id: string;
  name: string;
  team: string;
  brand?: string;
  league: string;
  leagueSlug: string;
  type: string;
  kitType: string;
  season: string;
  sizes: string[];
  isNewArrival: boolean;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
}

interface CsvImportRow {
  [key: string]: string | undefined;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const kitTypeColors: Record<string, string> = {
  fans: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  player: "bg-brand-green/10 text-white border-brand-green/25",
  retro: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kitTypeFilter, setKitTypeFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvResult, setCsvResult] = useState<string>("");
  const [csvError, setCsvError] = useState<string>("");
  const [csvProgress, setCsvProgress] = useState<string>("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (kitTypeFilter) params.set("kitType", kitTypeFilter);
      if (brandFilter) params.set("brand", brandFilter);
      params.set("page", page.toString());
      params.set("limit", "30");

      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      const nextProducts: ProductRow[] = data.products || [];
      setProducts(nextProducts);
      setSelectedIds((prev) =>
        prev.filter((id) => nextProducts.some((p) => p._id === id))
      );
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [search, kitTypeFilter, brandFilter, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch {
      // ignore
    } finally {
      setDeleting(null);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const toggleSelectAllOnPage = () => {
    const pageIds = products.map((p) => p._id);
    const allSelected =
      pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (
      !window.confirm(
        `Delete ${selectedIds.length} selected product(s)? This cannot be undone.`
      )
    ) {
      return;
    }

    setBulkDeleting(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setCsvError(data.error || "Bulk delete failed");
        return;
      }
      setSelectedIds([]);
      fetchProducts();
    } catch {
      setCsvError("Bulk delete failed");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleCsvUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setCsvError("Please upload a .csv file");
      setCsvResult("");
      return;
    }

    setCsvUploading(true);
    setCsvError("");
    setCsvResult("");
    setCsvProgress("");

    try {
      const parsed = await new Promise<Papa.ParseResult<CsvImportRow>>((resolve, reject) => {
        Papa.parse<CsvImportRow>(file, {
          header: true,
          skipEmptyLines: true,
          complete: resolve,
          error: reject,
        });
      });

      const rows = parsed.data || [];
      if (rows.length === 0) {
        setCsvError("CSV is empty");
        return;
      }

      const chunkSize = 30;
      const totalChunks = Math.ceil(rows.length / chunkSize);
      let created = 0;
      let updated = 0;
      let skipped = 0;
      let blocked = 0;

      for (let i = 0; i < totalChunks; i += 1) {
        const from = i * chunkSize;
        const to = Math.min((i + 1) * chunkSize, rows.length);
        const chunkRows = rows.slice(from, to);
        setCsvProgress(`Importing chunk ${i + 1}/${totalChunks} (${to}/${rows.length})...`);

        let res: Response | null = null;
        let data: {
          created?: number;
          updated?: number;
          skipped?: number;
          blockedImageReferencesRemoved?: number;
          error?: string;
        } = {};

        for (let attempt = 1; attempt <= 3; attempt += 1) {
          try {
            // eslint-disable-next-line no-await-in-loop
            res = await fetch("/api/admin/products/import-csv", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ rows: chunkRows }),
            });
            // eslint-disable-next-line no-await-in-loop
            data = await res.json().catch(() => ({}));

            if (res.ok) break;
            if (res.status !== 504 && res.status !== 502 && res.status !== 503) break;
          } catch {
            // retry network errors
          }

          // eslint-disable-next-line no-await-in-loop
          await wait(700 * attempt);
        }

        if (!res || !res.ok) {
          setCsvError(data.error || `CSV import failed at chunk ${i + 1}`);
          setCsvProgress("");
          return;
        }

        created += data.created || 0;
        updated += data.updated || 0;
        skipped += data.skipped || 0;
        blocked += data.blockedImageReferencesRemoved || 0;
      }

      setCsvResult(
        `Imported. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}, Blocked images removed: ${blocked}`
      );
      setCsvProgress("");
      fetchProducts();
    } catch {
      setCsvError("CSV import failed");
      setCsvProgress("");
    } finally {
      setCsvUploading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">Products</h1>
          <p className="text-sm text-[var(--muted)] mt-1">{total} total products</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-4 py-2.5 bg-[var(--surface)] border border-[color:var(--border)] text-[var(--foreground)] font-semibold text-sm rounded-lg hover:bg-[var(--surface-muted)] transition-colors cursor-pointer">
            {csvUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload CSV
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              disabled={csvUploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCsvUpload(file);
                e.currentTarget.value = "";
              }}
            />
          </label>

          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-green text-white font-semibold text-sm rounded-lg hover:bg-brand-green-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>
      </div>

      <div className="mb-5 space-y-2">
        <p className="text-xs text-[var(--muted)]">
          CSV columns supported: product_name, category, brand, sizes, main_image_url,
          image_url_2, image_url_3, image_url_4, image_url_5, all_image_urls.
        </p>
        {csvResult && (
          <div className="text-xs px-3 py-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-300">
            {csvResult}
          </div>
        )}
        {csvError && (
          <div className="text-xs px-3 py-2 rounded-lg border border-red-500/25 bg-red-500/10 text-red-300">
            {csvError}
          </div>
        )}
        {csvProgress && (
          <div className="text-xs px-3 py-2 rounded-lg border border-brand-green/25 bg-brand-green/10 text-white/90">
            {csvProgress}
          </div>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or team..."
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface)] border border-[color:var(--border)] rounded-lg text-[var(--foreground)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-brand-green/30 transition-colors"
          />
        </div>
        <input
          type="text"
          value={brandFilter}
          onChange={(e) => {
            setBrandFilter(e.target.value);
            setPage(1);
          }}
          placeholder="Filter by brand..."
          className="sm:w-52 px-4 py-2.5 bg-[var(--surface)] border border-[color:var(--border)] rounded-lg text-[var(--foreground)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-brand-green/30 transition-colors"
        />
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--muted)]" />
          {["", "fans", "player", "retro"].map((kt) => (
            <button
              key={kt}
              onClick={() => {
                setKitTypeFilter(kt);
                setPage(1);
              }}
              className={`px-3 py-2 text-xs font-medium uppercase tracking-wider rounded-lg transition-all ${
                kitTypeFilter === kt
                  ? "bg-brand-green/10 text-white border border-brand-green/30"
                  : "bg-[var(--surface)] text-[var(--muted)] border border-[color:var(--border)] hover:text-[var(--foreground)]"
              }`}
            >
              {kt || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-[var(--surface)] rounded-2xl border border-[color:var(--border)] p-16 text-center">
          <Shirt className="w-10 h-10 text-[var(--muted)] mx-auto mb-3" />
          <p className="text-[var(--foreground)] mb-1">No products found</p>
          <p className="text-xs text-[var(--muted)] mb-6">
            {search || kitTypeFilter
              ? "Try different filters"
              : "Start by adding your first product"}
          </p>
          {!search && !kitTypeFilter && (
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-green text-white font-semibold text-sm rounded-lg hover:bg-brand-green-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2 text-xs text-[var(--muted)]">
              <input
                type="checkbox"
                checked={
                  products.length > 0 &&
                  products.every((p) => selectedIds.includes(p._id))
                }
                onChange={toggleSelectAllOnPage}
                className="h-4 w-4 rounded border-[color:var(--border)] bg-[var(--surface)] text-white focus:ring-brand-green/40"
              />
              Select all on page
            </label>
            <button
              onClick={handleBulkDelete}
              disabled={selectedIds.length === 0 || bulkDeleting}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {bulkDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              Delete selected ({selectedIds.length})
            </button>
          </div>

          <div className="bg-[var(--surface)] rounded-2xl border border-[color:var(--border)] overflow-hidden">
            {/* Header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-3 bg-[var(--surface-muted)] border-b border-[color:var(--border)] text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">
              <div className="col-span-3">Product</div>
              <div className="col-span-2">Team / League</div>
              <div className="col-span-1">Type</div>
              <div className="col-span-1">Kit</div>
              <div className="col-span-2">Sizes</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Rows */}
            {products.map((product) => (
              <div
                key={product._id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 px-5 py-4 border-b border-[color:var(--border)] hover:bg-[var(--surface-muted)] transition-all duration-200 items-center"
              >
                <div className="lg:col-span-3">
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(product._id)}
                      onChange={() => toggleSelectOne(product._id)}
                      className="mt-0.5 h-4 w-4 rounded border-[color:var(--border)] bg-[var(--surface)] text-white focus:ring-brand-green/40"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-[var(--muted)]">{product.season}</p>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <p className="text-xs text-[var(--foreground)]">{product.team}</p>
                  <p className="text-[10px] text-[var(--muted)]">
                    {product.league}
                    {product.brand ? ` · ${product.brand}` : ""}
                  </p>
                </div>
                <div className="lg:col-span-1">
                  <span className="text-xs text-[var(--muted)] capitalize">
                    {product.type}
                  </span>
                </div>
                <div className="lg:col-span-1">
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${
                      kitTypeColors[product.kitType] || ""
                    }`}
                  >
                    {product.kitType}
                  </span>
                </div>
                <div className="lg:col-span-2">
                  <div className="flex flex-wrap gap-1">
                    {product.sizes.map((s) => (
                      <span
                        key={s}
                        className="px-1.5 py-0.5 text-[9px] bg-[var(--surface-muted)] text-[var(--muted)] border border-[color:var(--border)]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <div className="flex items-center gap-1.5">
                    {product.isActive ? (
                      <Eye className="w-3 h-3 text-green-400" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-[var(--muted)]" />
                    )}
                    <span
                      className={`text-[10px] ${
                        product.isActive ? "text-green-500" : "text-[var(--muted)]"
                      }`}
                    >
                      {product.isActive ? "Active" : "Hidden"}
                    </span>
                  </div>
                  <div className="flex gap-1 mt-1">
                    {product.isNewArrival && (
                      <span className="text-[9px] px-1 bg-brand-green/10 text-white">
                        NEW
                      </span>
                    )}
                    {product.isFeatured && (
                      <span className="text-[9px] px-1 bg-blue-400/10 text-blue-400">
                        FEAT
                      </span>
                    )}
                  </div>
                </div>
                <div className="lg:col-span-2 flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/products/${product._id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[var(--surface)] border border-[color:var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-all"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(product._id)}
                    disabled={deleting === product._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[var(--surface)] border border-[color:var(--border)] text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all disabled:opacity-50"
                  >
                    {deleting === product._id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-xs rounded-lg bg-[var(--surface)] border border-[color:var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <span className="text-xs text-[var(--muted)]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-xs rounded-lg bg-[var(--surface)] border border-[color:var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
