"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronDown, Briefcase, Users, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

interface DashboardHeaderProps {
  user: {
    firstName: string | null;
  } | null;
  brandName: string;
  slug: string;
}

export function DashboardHeader({ user, brandName, slug }: DashboardHeaderProps) {
  const router = useRouter();
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting("Good morning");
    else if (hours < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
      <div className="text-left space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {greeting}, <span className="font-normal">{user?.firstName ?? "Teammate"}</span>
        </h2>
        <p className="text-xs text-muted-foreground">
          Here's your operational overview for <span className="font-semibold text-foreground/85">{brandName}</span> today.
        </p>
      </div>

      {/* Global Quick Action Dropdown */}
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="h-8 text-xs font-semibold bg-[#4C1D95] hover:bg-[#3B0764] text-white flex items-center gap-1.5 transition-all cursor-pointer rounded-md shadow-xs">
              <Plus className="w-3.5 h-3.5" />
              <span>Create</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-[#111114] border border-border/20 rounded-xl shadow-lg p-1">
            <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground/60 px-2 py-1">
              Sales Workflows
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push(`/workspaces/${slug}/crm/leads/new`)} className="text-xs flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted/50 rounded-md">
              <Briefcase className="h-3.5 w-3.5 text-[#8B5CF6]" />
              <span>New Lead</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/workspaces/${slug}/clients`)} className="text-xs flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted/50 rounded-md">
              <Users className="h-3.5 w-3.5 text-[#8B5CF6]" />
              <span>New Client</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/10 my-1" />
            <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground/60 px-2 py-1">
              Utilities
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push(`/workspaces/${slug}/documents`)} className="text-xs flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted/50 rounded-md">
              <FileText className="h-3.5 w-3.5 text-[#8B5CF6]" />
              <span>Upload Document</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/workspaces/${slug}/crm/meetings`)} className="text-xs flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted/50 rounded-md">
              <Calendar className="h-3.5 w-3.5 text-[#8B5CF6]" />
              <span>Schedule Meeting</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
