import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "World Cup · 2026/27 international kits",
  description:
    "National team jerseys for the World Cup era — 2026/27 international drops, shipped worldwide.",
};

export default function WorldCupLayout({ children }: { children: ReactNode }) {
  return children;
}
