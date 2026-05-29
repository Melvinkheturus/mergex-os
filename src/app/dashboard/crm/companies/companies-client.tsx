"use client";

import { useState } from "react";
import {
  Building2, Plus, Search, Globe, MoreHorizontal, Users, IndianRupee, Layers,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Company {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  size?: string;
  revenue?: number;
  website?: string;
  _count?: { contacts: number; deals: number };
  createdAt: string;
}

const INDUSTRIES = [
  "SaaS", "E-commerce", "Manufacturing", "Healthcare", "Finance",
  "Education", "Logistics", "Real Estate", "Consulting", "Other",
];

function CompanyCard({ company }: { company: Company }) {
  const initials = company.name.slice(0, 2).toUpperCase();
  return (
    <Card className="hover:shadow-md transition-shadow group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary text-sm">
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold truncate max-w-32">{company.name}</p>
              {company.domain && (
                <p className="text-xs text-muted-foreground">{company.domain}</p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem className="text-xs">View Account</DropdownMenuItem>
              <DropdownMenuItem className="text-xs">Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs text-destructive focus:text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {company.industry && (
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
              <Layers className="h-2.5 w-2.5 mr-1" />{company.industry}
            </Badge>
          )}
          {company.size && (
            <Badge variant="outline" className="text-[10px] px-2 py-0.5">
              <Users className="h-2.5 w-2.5 mr-1" />{company.size}
            </Badge>
          )}
          {company.revenue != null && (
            <Badge variant="outline" className="text-[10px] px-2 py-0.5">
              <IndianRupee className="h-2.5 w-2.5 mr-1" />
              ₹{(company.revenue / 1e7).toFixed(1)}Cr
            </Badge>
          )}
        </div>

        {company.website && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Globe className="h-3.5 w-3.5 shrink-0" />
            <a href={company.website} target="_blank" rel="noopener noreferrer"
              className="truncate hover:text-primary transition-colors">{company.website}</a>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>{company._count?.contacts ?? 0} contacts</span>
          <span>{company._count?.deals ?? 0} deals</span>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center col-span-full">
      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Building2 className="h-7 w-7 text-primary" />
      </div>
      <h3 className="text-base font-semibold">No companies yet</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
        Add the accounts and organizations you sell to.
      </p>
      <Button size="sm" className="mt-4" onClick={onAdd}>
        <Plus className="h-4 w-4 mr-1.5" /> Add Company
      </Button>
    </div>
  );
}

export function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const companies: Company[] = []; // TODO: fetch from API

  const filtered = companies.filter(c => {
    const matchSearch = `${c.name} ${c.domain ?? ""} ${c.industry ?? ""}`
      .toLowerCase().includes(search.toLowerCase());
    const matchIndustry = industryFilter === "all" || c.industry === industryFilter;
    return matchSearch && matchIndustry;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Companies</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Accounts and organizations you work with
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1.5" /> Add Company
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search companies…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-40 h-9 text-sm">
            <SelectValue placeholder="All Industries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.length === 0
          ? <EmptyState onAdd={() => {}} />
          : filtered.map(c => <CompanyCard key={c.id} company={c} />)
        }
      </div>
    </div>
  );
}
