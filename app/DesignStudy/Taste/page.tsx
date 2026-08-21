import type { Metadata } from "next";
import { Roboto_Mono, Schibsted_Grotesk } from "next/font/google";
import Hexpile from "./Hexpile";

const hexSans = Schibsted_Grotesk({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-hex-sans",
});

const hexMono = Roboto_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-hex-mono",
});

export const metadata: Metadata = {
  title: "Hexpile — Design Study",
  description:
    "An independent interaction study: a vertical hexagonal pile you sort into two fields.",
  robots: { index: false, follow: false },
};

export default function TastePage() {
  return <Hexpile className={`${hexSans.variable} ${hexMono.variable}`} />;
}
