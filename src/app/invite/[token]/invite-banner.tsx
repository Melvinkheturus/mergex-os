"use client";

import { ShieldCheck, KeyRound, Lock } from "lucide-react";

export function InviteBanner() {
  return (
    <div className="relative w-full md:w-[44%] lg:w-[42%] xl:w-[40%] rounded-[20px] overflow-hidden bg-[#060608] p-6 md:p-8 flex flex-col justify-between min-h-[350px] md:min-h-0 md:h-full border border-white/5 border-b-transparent shadow-[0_0_50px_-12px_rgba(139,92,246,0.12)] shrink-0 select-none">
      {/* Arch Shaped Violet/Purple Dome Gradient (Curved n-shape dome dropping on sides) */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(100% 60% at 50% 0%, #8b5cf6 0%, #6d28d9 35%, #3b0764 65%, #060608 100%)",
        }}
      />

      {/* Textured SVG Grains Overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none mix-blend-overlay z-1"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Dissolve bottom card edge with page background color (#060608) */}
      <div className="absolute inset-x-0 bottom-0 h-44 bg-linear-to-t from-[#060608] via-[#060608]/95 to-transparent pointer-events-none z-2" />

      {/* Decorative ambient elements inside the card */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_60%)] pointer-events-none z-1" />

      {/* Logo & Header using local brand assets */}
      <div className="relative z-10 flex items-center gap-3">
        <img
          src="/logo/flat_logo.png"
          alt="MergeX Logo"
          className="h-6 w-auto object-contain brightness-200"
        />
        <div className="pl-1">
          <span className="text-sm font-extrabold tracking-tight text-white leading-none block">
            MergeX OS
          </span>
        </div>
      </div>

      {/* Core Content */}
      <div className="relative z-10 my-auto py-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-[1.15]">
          Welcome to MergeX
        </h1>
        <p className="text-xs text-white/60 mt-2 max-w-[260px] leading-relaxed">
          Set up your credentials to join your workspace platform.
        </p>

        {/* Stepper / Features Indicators */}
        <div className="mt-6 space-y-3.5 max-w-[260px]">
          {[
            {
              icon: ShieldCheck,
              label: "Secure Sign Up",
              desc: "Enterprise-grade protection by Clerk",
            },
            {
              icon: KeyRound,
              label: "Workspace Auditing",
              desc: "Access & actions strictly logged",
            },
            {
              icon: Lock,
              label: "Encrypted Session",
              desc: "End-to-end zero-trust architecture",
            },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white shrink-0">
                <Icon className="h-3.5 w-3.5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{label}</p>
                <p className="text-[9px] text-white/30">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="relative z-10 text-center text-[10px] text-white/30 select-none">
        Access is invite-only. Contact your admin to request access.
      </div>
    </div>
  );
}
