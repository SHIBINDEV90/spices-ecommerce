import type { Metadata } from "next";
import { EB_Garamond, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/context/CartContext";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Providers } from "@/components/Providers";

export const dynamic = 'force-dynamic';

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spicewizz",
  description: "Exporters of fine Kerala spices",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ebGaramond.variable} ${hankenGrotesk.variable} antialiased font-body-lg`}
      >
        <Providers>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
          </CartProvider>
        </Providers>
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
    </html>
  );
}
