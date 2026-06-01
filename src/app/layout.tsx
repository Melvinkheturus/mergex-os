import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { AppProvider } from "@/providers/AppProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import "./globals.css";

// ── Font Loading (rule: server-side, swap avoids FOIT) ────────────────────
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false, // decorative only - non-critical
});

// ── App URL ───────────────────────────────────────────────────────────────
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://cx.mergex.in";

// ── SEO & Open Graph metadata ─────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  title: {
    default: "MergeX Sales OS - Sales Execution Platform",
    template: "%s | MergeX Sales OS",
  },

  description:
    "MergeX Sales OS is an enterprise-grade sales operations platform - CRM, pipeline management, ICP scoring, discovery meetings, proposal handoff, analytics, and team RBAC in one unified workspace.",

  keywords: [
    "Sales OS",
    "CRM",
    "Sales Operations",
    "MergeX",
    "Pipeline Management",
    "Lead Scoring",
    "ICP Score",
    "Discovery Meeting",
    "Sales Analytics",
    "B2B Sales",
    "Sales Execution",
    "Sales Framework",
    "Knowledge Base",
  ],

  authors: [{ name: "MergeX", url: APP_URL }],
  creator: "MergeX",
  publisher: "MergeX",

  // Internal tool - block search engines
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },

  alternates: {
    canonical: APP_URL,
  },

  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: "MergeX Sales OS",
    title: "MergeX Sales OS - Sales Execution Platform",
    description:
      "Enterprise-grade sales operating system. Pipeline intelligence, ICP scoring, discovery meetings, and proposal handoff - all in one place.",
    images: [
      {
        url: "/logo/mergex-logo.png",
        width: 1200,
        height: 630,
        alt: "MergeX Sales OS",
      },
    ],
    locale: "en_IN",
  },

  twitter: {
    card: "summary_large_image",
    title: "MergeX Sales OS",
    description: "Enterprise sales operating framework - beyond a CRM.",
    images: ["/logo/mergex-logo.png"],
    creator: "@mergex",
  },

  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "manifest", url: "/favicon/site.webmanifest" },
    ],
  },

  manifest: "/favicon/site.webmanifest",
  applicationName: "MergeX Sales OS",
  category: "Business",
};

// ── Viewport ──────────────────────────────────────────────────────────────
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0B0F" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

// ── Root Layout ───────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Fontshare (Clash Display) - preconnect + preload the stylesheet
          so the browser fetches it in parallel with page HTML (non-blocking).
          rel="preload" as="style" + onload trick is avoided here because
          Next.js handles critical CSS; we just need the connection early.
        */}
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.fontshare.com" />
        <link
          rel="preload"
          as="style"
          href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap"
        />
      </head>
      <body
        className={`${inter.variable} ${cormorant.variable} font-sans antialiased text-foreground`}
      >
        {/*
          Provider order (outer → inner):
          1. ClerkProvider  - auth context available to everything
          2. AppProvider    - ThemeProvider + TooltipProvider + Toaster
          3. {children}     - page content streams in
        */}
        <ClerkProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <AppProvider>
              {children}
            </AppProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
