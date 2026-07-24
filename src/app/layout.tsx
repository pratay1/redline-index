import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { DM_Mono, Manrope, Syne } from "next/font/google";
import { CatalogImagePrefetch } from "@/components/catalog-image-prefetch";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteSilkBackground } from "@/components/site-silk-background";
import { getPublishedVehicleImageUrls } from "@/features/catalog/queries";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});
const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});
const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Redline Index", template: "%s | Redline Index" },
  description: "A precise, searchable index of verified automotive records.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Redline Index",
    description: "A precise, searchable index of verified automotive records.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const imageUrls = await getPublishedVehicleImageUrls();

  return (
    <html
      lang="en"
      className={`${manrope.variable} ${dmMono.variable} ${syne.variable} h-full antialiased`}
    >
      <body className="relative flex min-h-full flex-col bg-[#030303] text-foreground">
        <ClerkProvider>
          <SiteSilkBackground />
          <CatalogImagePrefetch imageUrls={imageUrls} />
          <a href="#main-content" className="skip-link">
            Skip to content
          </a>
          <div className="relative z-10 flex min-h-full flex-1 flex-col">
            <SiteHeader />
            <div id="main-content" className="relative z-[2] flex-1">
              {children}
            </div>
            <SiteFooter />
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
