import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Taste — Design Study",
  robots: { index: false, follow: false },
};

export default function TastePage() {
  return <main className="min-h-screen w-full bg-[#FF7BB0]" />;
}
