"use client";

import { useState } from "react";
import { Users, Mail, ShieldCheck, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Teammate, Brand } from "./team/types";
import { MembersSection } from "./team/members-section";
import { InvitationsSection } from "./team/invitations-section";
import { RolesSection } from "./team/roles-section";
import { BrandAccessSection } from "./team/brand-access-section";

type TeamTabSection = "members" | "invitations" | "roles" | "brand-access";

interface TeamTabProps {
  teammates: Teammate[];
  brands: Brand[];
}

export function TeamTab({ teammates, brands }: TeamTabProps) {
  const [activeSection, setActiveSection] = useState<TeamTabSection>("members");

  const tabs: { id: TeamTabSection; label: string; icon: React.ElementType }[] = [
    { id: "members",      label: "Members",      icon: Users },
    { id: "invitations",  label: "Invitations",  icon: Mail },
    { id: "roles",        label: "Roles",        icon: ShieldCheck },
    { id: "brand-access", label: "Brand Access", icon: Building2 },
  ];

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">
          Team &amp; Access
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage team members, invitations, roles and brand access from one central place.
        </p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 border-b border-neutral-200 dark:border-white/5 pb-0 overflow-x-auto no-scrollbar">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all relative cursor-pointer shrink-0 border-b-2",
              activeSection === id
                ? "text-[#8B5CF6] border-[#8B5CF6]"
                : "text-muted-foreground hover:text-foreground border-transparent"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div className="mt-4">
        {activeSection === "members"      && <MembersSection      teammates={teammates} brands={brands} />}
        {activeSection === "invitations"  && <InvitationsSection  brands={brands} />}
        {activeSection === "roles"        && <RolesSection />}
        {activeSection === "brand-access" && <BrandAccessSection  teammates={teammates} brands={brands} />}
      </div>
    </div>
  );
}
