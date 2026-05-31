import {
  LayoutDashboard,
  TrendingUp,
  Users,
  FileText,
  BookOpen,
  Settings,
} from "lucide-react";
import type { NavGroup } from "@/types";

export const navGroups: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { title: "Dashboard",  href: "/dashboard",           icon: LayoutDashboard },
      { title: "CRM",        href: "/dashboard/crm",       icon: TrendingUp },
      { title: "Clients",    href: "/dashboard/clients",   icon: Users,       isComingSoon: true },
      { title: "Documents",  href: "/dashboard/documents", icon: FileText,    isComingSoon: true },
      { title: "Knowledge",  href: "/dashboard/knowledge", icon: BookOpen,    isComingSoon: true },
    ],
  },
];
