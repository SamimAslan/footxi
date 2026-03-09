"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { leagues } from "@/data/products";
import {
  Loader2,
  Save,
  ArrowLeft,
  Plus,
  X,
  Shirt,
  Tag,
  Globe,
  Calendar,
  Shield,
  Star,
  Eye,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import Link from "next/link";

interface ProductBadge {
  name: string;
  price: number;
}

interface ProductFormData {
  name: string;
  team: string;
  league: string;
  leagueSlug: string;
  season: string;
  type: "home" | "away" | "third" | "retro";
  kitType: "fans" | "player" | "retro";
  image: string;
  backImage: string;
  sizes: string[];
  badges: ProductBadge[];
  isNewArrival: boolean;
  isFeatured: boolean;
  isActive: boolean;
}

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const TYPES: { value: ProductFormData["type"]; label: string }[] = [
  { value: "home", label: "Home" },
  { value: "away", label: "Away" },
  { value: "third", label: "Third" },
  { value: "retro", label: "Retro" },
];
interface Props {
  initialData?: ProductFormData & { _id?: string };
  isEditing?: boolean;
}

export default function AdminProductForm({ initialData, isEditing }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<ProductFormData>(
    initialData || {
      name: "",
      team: "",
      league: "",
      leagueSlug: "",
      season: "2025/26",
      type: "home",
      kitType: "fans",
      image: "",
      backImage: "",
      sizes: ["S", "M", "L", "XL", "XXL"],
      badges: [],
      isNewArrival: false,
      isFeatured: false,
      isActive: true,
    }
  );

  const [newBadgeName, setNewBadgeName] = useState("");
  const [newBadgePrice, setNewBadgePrice] = useState("3");
  const [uploading, setUploading] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dragOverBack, setDragOverBack] = useState(false);

  const handleImageUpload = async (file: File, field: "image" | "backImage" = "image") => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    const setUploadState = field === "image" ? setUploading : setUploadingBack;
    setUploadState(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Upload failed");
        return;
      }

      const data = await res.json();
      update({ [field]: data.url });
    } catch {
      setError("Failed to upload image");
    } finally {
      setUploadState(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file, "image");
  };

  const onDropBack = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverBack(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file, "backImage");
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file, "image");
  };

  const onFileSelectBack = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file, "backImage");
  };

  const update = (partial: Partial<ProductFormData>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  };

  const selectLeague = (slug: string) => {
    const league = leagues.find((l) => l.slug === slug);
    if (league) {
      update({ league: league.name, leagueSlug: league.slug, team: "" });
    }
  };

  const toggleSize = (size: string) => {
    update({
      sizes: form.sizes.includes(size)
        ? form.sizes.filter((s) => s !== size)
        : [...form.sizes, size],
    });
  };

  const addBadge = () => {
    if (!newBadgeName.trim()) return;
    update({
      badges: [
        ...form.badges,
        { name: newBadgeName.trim(), price: parseFloat(newBadgePrice) || 3 },
      ],
    });
    setNewBadgeName("");
    setNewBadgePrice("3");
  };

  const removeBadge = (index: number) => {
    update({ badges: form.badges.filter((_, i) => i !== index) });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.team || !form.league || !form.leagueSlug) {
      setError("Name, team, and league are required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const url = isEditing
        ? `/api/admin/products/${initialData?._id}`
        : "/api/admin/products";
      const method = isEditing ? "PUT" : "POST";

      const payload: ProductFormData = {
        ...form,
        kitType: form.type === "retro" ? "retro" : "fans",
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save product");
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const [teamQuery, setTeamQuery] = useState(initialData?.team || "");
  const [teamFocused, setTeamFocused] = useState(false);

  const currentLeague = leagues.find((l) => l.slug === form.leagueSlug);
  const allTeams = leagues.flatMap((l) => l.teams);
  const availableTeams = currentLeague?.teams || [];
  const teamPool = availableTeams.length > 0 ? availableTeams : allTeams;
  const filteredTeams = teamQuery.trim()
    ? teamPool.filter((t) => t.toLowerCase().includes(teamQuery.toLowerCase())).slice(0, 4)
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/products"
          className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            {isEditing ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            {isEditing
              ? "Update product details"
              : "Fill in the details to create a new jersey listing"}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-8">
        {/* Basic Info */}
        <div className="bg-[var(--surface)] border border-[color:var(--border)] p-5 sm:p-6 rounded-2xl">
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-5 flex items-center gap-2">
            <Shirt className="w-4 h-4 text-amber-400" />
            Basic Information
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update({ name: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--surface-muted)] border border-[color:var(--border)] text-[var(--foreground)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-amber-400/30 transition-colors rounded-lg"
                placeholder="e.g. Barcelona Home Kit 25/26"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                <Globe className="w-3 h-3 inline mr-1" />
                League *
              </label>
              <select
                value={form.leagueSlug}
                onChange={(e) => selectLeague(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--surface-muted)] border border-[color:var(--border)] text-[var(--foreground)] text-sm focus:outline-none focus:border-amber-400/30 transition-colors rounded-lg appearance-none"
              >
                <option value="">Select league</option>
                {leagues.map((l) => (
                  <option key={l.slug} value={l.slug}>
                    {l.name} ({l.country})
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                Team *
              </label>
              <input
                type="text"
                value={teamQuery}
                onChange={(e) => {
                  setTeamQuery(e.target.value);
                  update({ team: e.target.value });
                }}
                onFocus={() => setTeamFocused(true)}
                onBlur={() => setTimeout(() => setTeamFocused(false), 200)}
                className="w-full px-4 py-3 bg-[var(--surface-muted)] border border-[color:var(--border)] text-[var(--foreground)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-amber-400/30 transition-colors rounded-lg"
                placeholder="Type to search teams..."
              />

              {/* Autocomplete dropdown */}
              {teamFocused && filteredTeams.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-[var(--surface)] border border-[color:var(--border)] rounded-lg shadow-2xl max-h-52 overflow-y-auto">
                  {filteredTeams.map((team) => (
                    <button
                      key={team}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setTeamQuery(team);
                        update({ team });
                        setTeamFocused(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        form.team === team
                          ? "bg-amber-400/10 text-amber-400"
                          : "text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                      }`}
                    >
                      {team}
                    </button>
                  ))}
                  {teamQuery.trim() && !teamPool.includes(teamQuery.trim()) && (
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        update({ team: teamQuery.trim() });
                        setTeamFocused(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-amber-500 hover:bg-[var(--surface-muted)] border-t border-[color:var(--border)] flex items-center gap-2"
                    >
                      <Plus className="w-3 h-3" />
                      Add &quot;{teamQuery.trim()}&quot; as new team
                    </button>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                <Calendar className="w-3 h-3 inline mr-1" />
                Season
              </label>
              <input
                type="text"
                value={form.season}
                onChange={(e) => update({ season: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--surface-muted)] border border-[color:var(--border)] text-[var(--foreground)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-amber-400/30 transition-colors rounded-lg"
                placeholder="2025/26"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                <ImageIcon className="w-3 h-3 inline mr-1" />
                Product Image
              </label>

              {form.image ? (
                <div className="flex items-start gap-4">
                  <div className="relative w-32 h-40 bg-white rounded-lg overflow-hidden border border-[color:var(--border)] flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.image}
                      alt="Product"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-xs text-[var(--muted)] break-all">{form.image}</p>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[var(--surface)] border border-[color:var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors rounded-lg cursor-pointer">
                        <Upload className="w-3 h-3" />
                        Replace
                        <input
                          type="file"
                          accept="image/*"
                          onChange={onFileSelect}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={() => update({ image: "" })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[var(--surface)] border border-[color:var(--border)] text-red-500 hover:bg-red-500/10 transition-colors rounded-lg"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    dragOver
                      ? "border-amber-400/50 bg-amber-400/5"
                      : "border-[color:var(--border)] hover:border-amber-300/50"
                  }`}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                      <p className="text-sm text-[var(--muted)]">Uploading...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-[var(--surface-muted)] rounded-xl flex items-center justify-center">
                        <Upload className="w-5 h-5 text-[var(--muted)]" />
                      </div>
                      <div>
                        <p className="text-sm text-[var(--foreground)]">
                          Drag &amp; drop an image here, or{" "}
                          <label className="text-amber-400 hover:text-amber-300 cursor-pointer transition-colors">
                            browse
                            <input
                              type="file"
                              accept="image/*"
                              onChange={onFileSelect}
                              className="hidden"
                            />
                          </label>
                        </p>
                        <p className="text-[10px] text-[var(--muted)] mt-1">
                          PNG, JPG, WEBP up to 10MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Back Image */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                <ImageIcon className="w-3 h-3 inline mr-1" />
                Back Image (Optional)
              </label>

              {form.backImage ? (
                <div className="flex items-start gap-4">
                  <div className="relative w-32 h-40 bg-white rounded-lg overflow-hidden border border-[color:var(--border)] flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.backImage}
                      alt="Back"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-xs text-[var(--muted)] break-all">{form.backImage}</p>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[var(--surface)] border border-[color:var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors rounded-lg cursor-pointer">
                        <Upload className="w-3 h-3" />
                        Replace
                        <input
                          type="file"
                          accept="image/*"
                          onChange={onFileSelectBack}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={() => update({ backImage: "" })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[var(--surface)] border border-[color:var(--border)] text-red-500 hover:bg-red-500/10 transition-colors rounded-lg"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverBack(true);
                  }}
                  onDragLeave={() => setDragOverBack(false)}
                  onDrop={onDropBack}
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                    dragOverBack
                      ? "border-amber-400/50 bg-amber-400/5"
                      : "border-[color:var(--border)] hover:border-amber-300/50"
                  }`}
                >
                  {uploadingBack ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                      <p className="text-sm text-[var(--muted)]">Uploading...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-5 h-5 text-[var(--muted)]" />
                      <p className="text-xs text-[var(--muted)]">
                        Drop back image or{" "}
                        <label className="text-amber-400 hover:text-amber-300 cursor-pointer">
                          browse
                          <input
                            type="file"
                            accept="image/*"
                            onChange={onFileSelectBack}
                            className="hidden"
                          />
                        </label>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Type & Kit Type */}
        <div className="bg-[var(--surface)] border border-[color:var(--border)] p-5 sm:p-6 rounded-2xl">
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-5 flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-400" />
            Jersey Type
          </h2>

          <div className="space-y-5">
            {/* Type */}
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-3">
                Kit Style
              </label>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => update({ type: t.value })}
                    className={`px-4 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                      form.type === t.value
                        ? "bg-amber-400/10 border-amber-400/30 text-amber-400"
                : "bg-[var(--surface-muted)] border-[color:var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-muted)] px-4 py-3">
              <p className="text-xs text-[var(--muted)]">
                Kit versions are now automatic: customers can choose{" "}
                <span className="text-[var(--foreground)] font-medium">Fans / Player</span> on
                product detail. Retro kits stay Retro only.
              </p>
            </div>
          </div>
        </div>

        {/* Sizes */}
        <div className="bg-[var(--surface)] border border-[color:var(--border)] p-5 sm:p-6 rounded-2xl">
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Available Sizes
          </h2>
          <p className="text-xs text-[var(--muted)] mb-4">
            Click to toggle which sizes are available for this product
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_SIZES.map((size) => {
              const active = form.sizes.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`w-14 h-14 rounded-xl border text-sm font-semibold transition-all ${
                    active
                      ? "bg-amber-400/10 border-amber-400/30 text-amber-400"
                      : "bg-[var(--surface-muted)] border-[color:var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-[var(--muted)] mt-3">
            Selected: {form.sizes.join(", ") || "None"}
          </p>
        </div>

        {/* Badges */}
        <div className="bg-[var(--surface)] border border-[color:var(--border)] p-5 sm:p-6 rounded-2xl">
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-5 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            Arm Badges
          </h2>

          {/* Existing badges */}
          {form.badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {form.badges.map((badge, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 bg-[var(--surface-muted)] border border-[color:var(--border)] rounded-lg"
                >
                  <Shield className="w-3 h-3 text-amber-400" />
                  <span className="text-sm text-[var(--foreground)]">{badge.name}</span>
                  <span className="text-xs text-[var(--muted)]">
                    CHF {badge.price}
                  </span>
                  <button
                    onClick={() => removeBadge(i)}
                    className="ml-1 p-0.5 text-[var(--muted)] hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add badge */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newBadgeName}
              onChange={(e) => setNewBadgeName(e.target.value)}
              placeholder="Badge name (e.g. La Liga Badge)"
              className="flex-1 px-4 py-2.5 bg-[var(--surface-muted)] border border-[color:var(--border)] text-[var(--foreground)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-amber-400/30 transition-colors rounded-lg"
              onKeyDown={(e) => e.key === "Enter" && addBadge()}
            />
            <input
              type="number"
              value={newBadgePrice}
              onChange={(e) => setNewBadgePrice(e.target.value)}
              className="w-24 px-4 py-2.5 bg-[var(--surface-muted)] border border-[color:var(--border)] text-[var(--foreground)] text-sm focus:outline-none focus:border-amber-400/30 transition-colors rounded-lg"
              placeholder="3"
            />
            <button
              onClick={addBadge}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[var(--surface)] border border-[color:var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-muted)] text-sm transition-colors rounded-lg"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        {/* Flags */}
        <div className="bg-[var(--surface)] border border-[color:var(--border)] p-5 sm:p-6 rounded-2xl">
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-5 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            Visibility & Flags
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => update({ isActive: !form.isActive })}
                className={`w-10 h-6 rounded-full relative transition-colors ${
                  form.isActive ? "bg-green-500" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    form.isActive ? "translate-x-[18px]" : "translate-x-0.5"
                  }`}
                />
              </div>
              <div>
                <p className="text-sm text-[var(--foreground)] flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-[var(--muted)]" />
                  Active
                </p>
                <p className="text-[10px] text-[var(--muted)]">
                  Visible to customers on the website
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => update({ isNewArrival: !form.isNewArrival })}
                className={`w-10 h-6 rounded-full relative transition-colors ${
                  form.isNewArrival ? "bg-amber-500" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    form.isNewArrival ? "translate-x-[18px]" : "translate-x-0.5"
                  }`}
                />
              </div>
              <div>
                <p className="text-sm text-[var(--foreground)] flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--muted)]" />
                  New Arrival
                </p>
                <p className="text-[10px] text-[var(--muted)]">
                  Shows &quot;NEW&quot; badge on the product card
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => update({ isFeatured: !form.isFeatured })}
                className={`w-10 h-6 rounded-full relative transition-colors ${
                  form.isFeatured ? "bg-blue-500" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    form.isFeatured ? "translate-x-[18px]" : "translate-x-0.5"
                  }`}
                />
              </div>
              <div>
                <p className="text-sm text-[var(--foreground)] flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-[var(--muted)]" />
                  Featured
                </p>
                <p className="text-[10px] text-[var(--muted)]">
                  Show on the homepage featured section
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-4">
          <Link
            href="/admin/products"
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-amber-400 text-black font-semibold text-sm hover:bg-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEditing ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
