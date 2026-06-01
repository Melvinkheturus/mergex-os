import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Building2,
  Users,
  FolderGit2,
  LineChart,
  Lock,
  Sparkles,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Moon,
  Sun,
  Laptop,
  Plus,
  MoreVertical,
  TrendingUp,
  Activity,
  Clock,
  FileText
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";

export const metadata = {
  title: "MergeX Sales OS - Internal Operational Workspace",
  description: "Confidential operations platform for customer experience, sales, and client execution.",
};

export default async function LandingPage() {
  const user = await getCurrentUser();

  return (
    <div className="relative min-h-screen bg-black text-foreground font-sans antialiased overflow-x-hidden selection:bg-purple-500/30 selection:text-white">
      
      {/* ── Background Elements & Atmospheric Glows ────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.2]"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 30%, rgba(139,92,246,0.15) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />
      
      {/* Immersive Decorative Orbs */}
      <div className="absolute top-[-5%] left-[15%] w-[450px] h-[450px] rounded-full bg-purple-500/10 blur-[130px] pointer-events-none z-0 animate-ambient-glow" />
      <div className="absolute top-[20%] right-[5%] w-[380px] h-[380px] rounded-full bg-indigo-500/5 blur-[110px] pointer-events-none z-0 animate-ambient-glow [animation-delay:-8s]" />
      
      {/* ── TOP NAVIGATION HEADER ────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 animate-header">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Left: Big Logo + SALES OS in capital (no MergeX text) */}
        <div className="flex items-center gap-3">
          <img
            src="/logo/mergex-logo.png"
            alt="Sales OS Logo"
            className="w-12 h-12 md:w-14 md:h-14 object-contain shrink-0"
          />
          <span className="text-base md:text-lg font-black text-white tracking-widest uppercase">
            SALES OS
          </span>
        </div>

        {/* Center: nav menus */}
        <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">
          <Link href="#" className="text-white transition-colors">Home</Link>
          <Link href="#preview" className="hover:text-white transition-colors">Preview</Link>
          <Link href="#about" className="hover:text-white transition-colors">About</Link>
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
        </nav>

        {/* Right: Login option */}
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

      {/* ── HERO SECTION (CONSTRAINED MAX WIDTH) ───────────────────────── */}
      <section className="relative z-30 max-w-5xl mx-auto px-6 pt-32 md:pt-40 pb-8 text-center flex flex-col items-center">
        
        {/* Huge centered Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.08] max-w-4xl font-sans animate-fade-in-up delay-100">
          Complete control over your <br />
          <span className="bg-linear-to-b from-white to-purple-500 bg-clip-text text-transparent">sales & operations</span>
        </h1>

        {/* Centered Tagline */}
        <p className="mt-6 text-[#9CA3AF] text-sm sm:text-base leading-relaxed max-w-4xl font-sans tracking-wide animate-fade-in-up delay-200">
          The secure internal workspace for the MergeX team. <br className="hidden md:inline" /> Manage sales pipelines, track client accounts, and store contracts under protected single sign-on.
        </p>

        {/* Secure SSO Entrance Button */}
        <div className="mt-8 animate-fade-in-up delay-300">
          <LiquidMetalButton
            label={user ? "Go to Dashboard" : "Get started"}
            href={user ? "/workspaces" : "/sign-in"}
          />
        </div>

      </section>

      {/* ── THE LIVE PREVIEW DASHBOARD CARD (VIEWPORT FULL WIDTH WITH MINIMAL PADDING) ── */}
      <div id="preview" className="relative z-10 w-full px-2 md:px-3 max-w-none mx-auto pb-16 -mt-4 sm:-mt-6 md:-mt-8">
        
        {/* Floating Card: low padding, rounded corners, top is transparent, bottom has purple gradient */}
        <div 
          className="relative rounded-2xl pt-2.5 px-2.5 pb-0 shadow-2xl shadow-black/60 overflow-hidden animate-dashboard-reveal delay-500"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 40%, rgba(46,16,101,0.85) 75%, rgba(109,40,217,0.95) 100%)',
            borderBottom: '1.5px solid rgba(139,92,246,0.8)'
          }}
        >
          
          {/* Ambient inner purple bottom glow */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-linear-to-t from-[#8B5CF6]/35 to-transparent blur-xl pointer-events-none" />

          {/* Centered Dashboard Mockup: Pure image without browser shell, pushed downwards */}
          <div 
            className="relative z-10 w-[90%] md:w-[85%] lg:w-[80%] mx-auto mt-16 md:mt-28 mb-0 rounded-t-xl overflow-hidden border-t border-x border-white/8 shadow-2xl transition-all duration-500 hover:border-purple-500/20 bg-neutral-950"
          >
            <img 
              src="/dashboard.png" 
              alt="MergeX Sales OS Dashboard" 
              className="w-full h-auto object-cover object-top select-none filter brightness-[0.98]"
              loading="eager"
            />
          </div>

        </div>

      </div>

      {/* ── ABOUT SALES OS SECTION ──────────────────────────────────────── */}
      <section id="about" className="relative z-10 max-w-4xl mx-auto px-6 py-24 border-t border-white/4 text-center flex flex-col items-center">
        <p className="text-xs font-bold text-purple-400 tracking-widest uppercase font-mono">
          About Sales OS
        </p>
        <h2 className="text-3xl sm:text-4xl font-serif font-light italic text-white mt-4 tracking-tight leading-tight max-w-2xl">
          Enterprise sales velocity, <br />
          <span className="text-purple-400">
            reimagined for MergeX.
          </span>
        </h2>
        <div className="mt-8 space-y-6 text-neutral-400 text-sm sm:text-base leading-relaxed max-w-3xl">
          <p>
            MergeX Sales OS is a highly confidential, custom-tailored command center engineered to orchestrate B2B sales development, customer experience, and client delivery.
          </p>
          <p className="text-sm">
            Moving beyond traditional disjointed CRM pipelines, Sales OS unifies your entire pipeline lifecycle. From automated ICP lead qualification and client onboarding states, to secure workspace delegation and client contract vaulting-your sales velocity is accelerated and protected under rigid enterprise single sign-on.
          </p>
        </div>
      </section>

      {/* ── 2. PLATFORM OVERVIEW ───────────────────────────────────────── */}
      <section id="features" className="relative z-10 max-w-5xl mx-auto px-6 py-24 border-t border-white/4">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-bold text-purple-400 tracking-widest uppercase font-mono">Platform Capabilities</p>
          <h2 className="text-3xl font-serif font-light italic text-white mt-3 tracking-tight">
            Clear pipeline metrics & secure document controls
          </h2>
          <p className="mt-3 text-sm text-[#9CA3AF]">
            All the internal tools your team needs to manage clients, track pipelines, and speed up operations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="group p-5 rounded-2xl bg-white/2 hover:bg-white/4 border border-white/5 hover:border-purple-500/20 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/5 cursor-pointer transition-all duration-300 flex flex-col items-start text-left">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase text-[11px]">Lead & Client Tracking</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Know exactly where every deal stands. Track lead activity logs and progress across all brands.
            </p>
          </div>

          <div className="group p-5 rounded-2xl bg-white/2 hover:bg-white/4 border border-white/5 hover:border-purple-500/20 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/5 cursor-pointer transition-all duration-300 flex flex-col items-start text-left">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
              <Building2 className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase text-[11px]">Separate Brand Dashboards</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Keep client data organized. Access individual brand dashboards and activity timelines securely.
            </p>
          </div>

          <div className="group p-5 rounded-2xl bg-white/2 hover:bg-white/4 border border-white/5 hover:border-purple-500/20 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/5 cursor-pointer transition-all duration-300 flex flex-col items-start text-left">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
              <FolderGit2 className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase text-[11px]">Secure Document Vault</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Protect client contracts. Store signed proposals, specifications, and client agreements safely.
            </p>
          </div>

          <div className="group p-5 rounded-2xl bg-white/2 hover:bg-white/4 border border-white/5 hover:border-purple-500/20 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/5 cursor-pointer transition-all duration-300 flex flex-col items-start text-left">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
              <LineChart className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase text-[11px]">Pipeline Analytics</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Track team speed and sales performance. View visual charts of pipeline health and deal metrics.
            </p>
          </div>

        </div>

      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="relative z-10 bg-black pt-20 pb-12 border-t border-white/4 text-xs text-muted-foreground">
        
        {/* Glow point behind divider */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-linear-to-r from-transparent via-purple-500/40 to-transparent" />
        
        <div className="max-w-5xl mx-auto px-6 pb-12 flex justify-center items-center">
          
          {/* Left: Brand logo & name */}
          <div className="flex items-center gap-3">
            <img
              src="/logo/mergex-logo.png"
              alt="Sales OS Logo"
              className="w-8 h-8 object-contain shrink-0"
            />
            <span className="text-xs font-black text-white tracking-widest uppercase font-sans">
              MERGEX SALES OS
            </span>
          </div>

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
