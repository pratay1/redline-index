import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { DM_Mono, Manrope } from "next/font/google";
import { CatalogImagePrefetch } from "@/components/catalog-image-prefetch";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
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
  const imageUrls = [
    ...(await getPublishedVehicleImageUrls()),
    "/thisisnthardtocodeatall.png",
  ];

  return (
    <html
      lang="en"
      className={`${manrope.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <ClerkProvider>
          <CatalogImagePrefetch imageUrls={imageUrls} />
          <a href="#main-content" className="skip-link">
            Skip to content
          </a>
          <SiteHeader />
          <div id="main-content" className="flex-1">
            {children}
          </div>
          <SiteFooter />
        </ClerkProvider>
      </body>
    </html>
  );
}
