import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { ChangelogTimeline } from "./changelog-timeline";
import { TypingHeading } from "./typing-heading";

export const metadata = {
  title: "Changelog | MergeX OS",
  description: "Track every update, feature, improvement and fix in MergeX OS.",
};

export default async function ChangelogPage() {
  const user = await getCurrentUser();

  // Fetch all published releases with their items from the database
  const dbReleases = await db.changeLog.findMany({
    where: {
      status: "published",
    },
    include: {
      items: true,
    },
    orderBy: {
      releaseDate: "desc",
    },
  });

  const releases = dbReleases;

  return (
    <div className="relative min-h-screen bg-black text-foreground font-sans antialiased overflow-x-hidden selection:bg-purple-500/30 selection:text-white">
      {/* Background Grid & Atmospheric Glows */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.2]"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 30%, rgba(139,92,246,0.15) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute top-[-5%] left-[15%] w-[450px] h-[450px] rounded-full bg-purple-500/10 blur-[130px] pointer-events-none z-0 animate-ambient-glow" />
      <div className="absolute top-[20%] right-[5%] w-[380px] h-[380px] rounded-full bg-indigo-500/5 blur-[110px] pointer-events-none z-0 animate-ambient-glow [animation-delay:-8s]" />

      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-2.5 flex items-center justify-between">
          {/* Left: Logo + Name */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img
              src="/logo/mergex-logo.png"
              alt="MergeX OS Logo"
              className="w-12 h-12 md:w-14 md:h-14 object-contain shrink-0"
            />
            <span className="text-base md:text-lg font-semibold text-white tracking-widest uppercase font-clash">
              MERGEX OS
            </span>
          </Link>

          {/* Center: nav menus */}
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/#preview" className="hover:text-white transition-colors">Preview</Link>
            <Link href="/#about" className="hover:text-white transition-colors">About</Link>
            <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/changelog" className="text-white transition-colors">Changelog</Link>
          </nav>

          {/* Right: Dashboard / Login */}
          <div className="flex items-center gap-3">
            {user ? (
              <LiquidMetalButton
                label="Dashboard"
                href="/workspaces"
                width={110}
                height={36}
              />
            ) : (
              <LiquidMetalButton
                label="Login"
                href="/sign-in"
                width={110}
                height={36}
              />
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 max-w-[1300px] mx-auto px-6 pt-32 sm:pt-40 pb-24">
        {/* HERO */}
        <div className="text-left mb-12 sm:mb-16">
          <TypingHeading />
          <p className="mt-4 text-[#9CA3AF] text-sm sm:text-base tracking-wide max-w-2xl">
            Track every update, feature, improvement, and fix deployed to the MergeX operations command center.
          </p>
        </div>

        {/* INFO NOTICE BANNER */}
        <div className="mb-12 p-4 rounded-xl border border-purple-500/10 bg-purple-500/5 flex items-center gap-3 text-xs text-purple-200/80">
          <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>New versions are rolled out gradually and may take a few days to reach all workspaces.</span>
        </div>

        {/* TIMELINE SECTION */}
        <ChangelogTimeline initialReleases={JSON.parse(JSON.stringify(releases))} />
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 bg-black pt-20 pb-12 border-t border-white/4 text-xs text-muted-foreground">
        
        <div className="w-full max-w-none px-8 md:px-16 lg:px-24 pb-2 flex items-center justify-center">

          {/* Center: Tagline ("Experience liftoff" size) */}
          <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light tracking-tight text-white font-sans text-center">
            ONE SYSTEM ZERO FRICTION
          </span>

        </div>

        {/* Gigantic Footer Text */}
        <div className="w-full overflow-hidden mt-16 pointer-events-none select-none border-t border-white/2 pt-8 flex justify-center items-center animate-signature">
          <div className="relative text-center w-full px-8 md:px-16 pb-2">
            
            {/* Copyright/Metadata label bottom-left */}
            <div className="absolute bottom-0 left-2 md:left-4 text-left pointer-events-auto z-20">
              <div className="flex items-center gap-1.5 md:gap-3 text-[7px] md:text-[0.75vw] text-neutral-500 tracking-wider">
                <span>© 2025-2026 The MergeX Company</span>
                <span className="text-neutral-700">|</span>
                <span className="hidden sm:inline">We believe good systems outlast trends.</span>
                <span className="hidden sm:inline text-neutral-700">•</span>
                <span className="font-mono text-neutral-600">v1.0.0-alpha</span>
              </div>
            </div>

            <div className="flex flex-row items-baseline justify-center whitespace-nowrap w-full relative">
              <div className="relative inline-block">
                {/* "THE" label top-left */}
                <div className="absolute top-[-15%] left-[1%] md:top-[2%] md:left-[1vw] text-left">
                  <span className="text-[1.2vw] md:text-[1.1vw] font-semibold uppercase tracking-[0.7em] select-none font-clash bg-linear-to-b from-white to-purple-500 bg-clip-text text-transparent">
                    THE
                  </span>
                </div>

                {/* Main MERGEX heading */}
                <h2 className="text-[19vw] md:text-[20vw] leading-none font-semibold tracking-widest select-none font-clash uppercase relative text-center bg-linear-to-b from-white to-purple-500 bg-clip-text text-transparent">
                  MERGEX
                </h2>

                {/* "COMPANY" label bottom-right */}
                <div className="absolute bottom-[-5%] right-[2%] md:bottom-[-1.5%] md:right-[2.5vw] text-right">
                  <span className="text-[1.5vw] md:text-[1.6vw] font-semibold uppercase tracking-[0.6em] select-none font-clash bg-linear-to-b from-white to-purple-500 bg-clip-text text-transparent" style={{ marginRight: '-0.6em' }}>
                    COMPANY
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </footer>
    </div>
  );
}
