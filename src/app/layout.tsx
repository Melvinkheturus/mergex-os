import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import {
  ClerkProvider,
  Show,
  UserButton,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// ── SEO & Open Graph ──────────────────────────────────────
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://cx.mergex.in";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  title: {
    default: "MergeX Sales OS — Sales Execution Platform",
    template: "%s | MergeX Sales OS",
  },

  description:
    "MergeX Sales OS is an enterprise-grade sales operations platform — CRM, pipeline management, ICP scoring, discovery meetings, proposal handoff, analytics, and team RBAC in one unified workspace.",

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

  // Internal tool — block search engines
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },

  // Canonical
  alternates: {
    canonical: APP_URL,
  },

  // Open Graph
  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: "MergeX Sales OS",
    title: "MergeX Sales OS — Sales Execution Platform",
    description:
      "Enterprise-grade sales operating system. Pipeline intelligence, ICP scoring, discovery meetings, and proposal handoff — all in one place.",
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

  // Twitter / X Card
  twitter: {
    card: "summary_large_image",
    title: "MergeX Sales OS",
    description: "Enterprise sales operating framework — beyond a CRM.",
    images: ["/logo/mergex-logo.png"],
    creator: "@mergex",
  },

  // Favicon
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

  // Web app manifest
  manifest: "/favicon/site.webmanifest",

  // App metadata
  applicationName: "MergeX Sales OS",
  category: "Business",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0B0F" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

// ── Root Layout ───────────────────────────────────────────

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to speed up Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${inter.variable} ${cormorant.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider>
            <TooltipProvider delayDuration={300}>
              {/* Auth-aware global header — only visible on non-dashboard public routes */}
              <Show when="signed-out">
                <header className="sr-only" aria-hidden>
                  <SignInButton />
                  <SignUpButton />
                </header>
              </Show>
              <Show when="signed-in">
                <header className="sr-only" aria-hidden>
                  <UserButton />
                </header>
              </Show>
              {children}
            </TooltipProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
