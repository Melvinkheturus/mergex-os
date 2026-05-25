"use client";

import { useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Shield,
  Mail,
  MoreHorizontal,
  Crown,
  ChevronDown,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// ─── Types mirroring Prisma schema ───────────────────────────────────────────

type RoleName = "super_admin" | "sales_manager" | "sales_rep" | "viewer";

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  role: { name: RoleName; label: string };
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  status: "PENDING" | "EXPIRED";
  createdAt: string;
  expiresAt: string;
}

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLES: Record<RoleName, { label: string; color: string; icon: React.ElementType }> = {
  super_admin: { label: "Super Admin", color: "text-purple-500 bg-purple-500/10 border-purple-500/20", icon: Crown },
  sales_manager: { label: "Sales Manager", color: "text-amber-500 bg-amber-500/10 border-amber-500/20", icon: Shield },
  sales_rep: { label: "Sales Rep", color: "text-blue-500 bg-blue-500/10 border-blue-500/20", icon: Users },
  viewer: { label: "Viewer", color: "text-muted-foreground bg-muted border-border", icon: Users },
};

// ─── Mock data (replace with Prisma data fetching) ───────────────────────────

const MOCK_MEMBERS: TeamMember[] = [
  {
    id: "1",
    firstName: "Manikandan",
    lastName: "Admin",
    email: "admin@mergex.io",
    role: { name: "super_admin", label: "Super Admin" },
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

const MOCK_INVITES: PendingInvite[] = [];

// ─── Subcomponents ───────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: RoleName }) {
  const config = ROLES[role];
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${config.color}`}
    >
      <Icon className="h-2.5 w-2.5" />
      {config.label}
    </span>
  );
}

function MemberRow({ member }: { member: TeamMember }) {
  const initials = `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();

  return (
    <div className="flex items-center gap-4 py-3 px-4 hover:bg-muted/50 rounded-lg transition-colors group">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={member.avatarUrl} />
        <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium truncate">
            {member.firstName} {member.lastName}
          </span>
          <RoleBadge role={member.role.name} />
          {!member.isActive && (
            <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-destructive border-destructive/30">
              Deactivated
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{member.email}</span>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
        <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
        <span>
          {member.lastLoginAt
            ? `Active ${new Date(member.lastLoginAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
            : "Never logged in"}
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem className="text-xs">
            <Shield className="h-3.5 w-3.5 mr-2" />
            Change Role
          </DropdownMenuItem>
          <DropdownMenuItem className="text-xs">
            <Mail className="h-3.5 w-3.5 mr-2" />
            Send Email
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-xs text-destructive focus:text-destructive">
            <XCircle className="h-3.5 w-3.5 mr-2" />
            Deactivate
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function InviteRow({ invite }: { invite: PendingInvite }) {
  return (
    <div className="flex items-center gap-4 py-3 px-4 hover:bg-muted/50 rounded-lg transition-colors group">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarFallback className="text-xs bg-muted text-muted-foreground">
          <Mail className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground truncate">
            {invite.email}
          </span>
          <Badge
            variant="outline"
            className={`text-[10px] h-4 px-1.5 ${
              invite.status === "EXPIRED"
                ? "text-destructive border-destructive/30"
                : "text-amber-500 border-amber-500/30"
            }`}
          >
            {invite.status === "EXPIRED" ? "Expired" : "Pending"}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">Invited as {invite.role}</span>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3 w-3 shrink-0" />
        <span>
          Expires {new Date(invite.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem className="text-xs">
            <Mail className="h-3.5 w-3.5 mr-2" />
            Resend Invite
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-xs text-destructive focus:text-destructive">
            <XCircle className="h-3.5 w-3.5 mr-2" />
            Revoke Invite
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function InviteDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RoleName>("sales_rep");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Invite Team Member</DialogTitle>
          <DialogDescription className="text-sm">
            They&apos;ll receive an email with a secure invite link (valid 72 hours).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Email Address</Label>
            <Input
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Role</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full h-9 justify-between text-sm font-normal">
                  {ROLES[role].label}
                  <ChevronDown className="h-4 w-4 ml-2 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {(Object.keys(ROLES) as RoleName[]).map((r) => (
                  <DropdownMenuItem key={r} className="text-sm" onClick={() => setRole(r)}>
                    <RoleBadge role={r} />
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="flex-1"
              disabled={!email}
              onClick={() => {
                // TODO: POST /api/team/invite
                onOpenChange(false);
              }}
            >
              <Mail className="h-3.5 w-3.5 mr-1.5" />
              Send Invite
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function TeamDirectory() {
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);

  const filtered = MOCK_MEMBERS.filter(
    (m) =>
      `${m.firstName} ${m.lastName} ${m.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const activeCount = MOCK_MEMBERS.filter((m) => m.isActive).length;
  const pendingCount = MOCK_INVITES.filter((i) => i.status === "PENDING").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Team</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage team members, roles, and invitations
          </p>
        </div>
        <Button size="sm" onClick={() => setInviteOpen(true)}>
          <UserPlus className="h-4 w-4 mr-1.5" />
          Invite Member
        </Button>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active Members", value: activeCount, icon: Users, color: "text-emerald-500" },
          { label: "Pending Invites", value: pendingCount, icon: Clock, color: "text-amber-500" },
          { label: "Roles Defined", value: Object.keys(ROLES).length, icon: Shield, color: "text-primary" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div>
                <div className="text-xl font-bold">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Members List */}
      <Card>
        <CardHeader className="pb-2 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Members
            <Badge variant="secondary" className="text-xs ml-auto">
              {filtered.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No members found</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {filtered.map((member) => (
                <MemberRow key={member.id} member={member} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {MOCK_INVITES.length > 0 && (
        <Card>
          <CardHeader className="pb-2 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Pending Invites
              <Badge variant="secondary" className="text-xs ml-auto">
                {MOCK_INVITES.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="space-y-0.5">
              {MOCK_INVITES.map((invite) => (
                <InviteRow key={invite.id} invite={invite} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Legend */}
      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Role Definitions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {(Object.entries(ROLES) as [RoleName, (typeof ROLES)[RoleName]][]).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <div key={key} className="flex items-start gap-2.5">
                  <div className={`mt-0.5 h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${config.color} border`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{config.label}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      {key === "super_admin" && "Full access to all modules and settings"}
                      {key === "sales_manager" && "Manage team, view all leads and reports"}
                      {key === "sales_rep" && "Own leads, meetings, and proposals"}
                      {key === "viewer" && "Read-only access to CRM and analytics"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Separator />
      <p className="text-xs text-muted-foreground text-center">
        Live member data loads from Clerk + Prisma once onboarding is complete.
      </p>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}
