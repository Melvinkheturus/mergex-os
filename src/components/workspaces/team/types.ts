export type UserStatus = "ACTIVE" | "SUSPENDED" | "ARCHIVED";

export interface Teammate {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  designation?: string | null;
  clerkId?: string;
  status: UserStatus;
  suspendedAt?: string | null;
  archivedAt?: string | null;
  role: {
    name: string;
    label: string;
    id?: string;
  };
  brandAccess?: { id: string; name: string; slug: string }[];
  employeeId?: string | null;
  moduleAccess?: string[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface DbRole {
  id: string;
  name: string;
  label: string;
  description?: string | null;
  isSystem?: boolean;
  RolePermission?: { permissionId: string }[];
}

export interface PendingInvite {
  id: string;
  email: string;
  roleId: string | null;
  status: string;
  expiresAt: string;
  createdAt: string;
  brands: { id: string; name: string; slug: string }[];
  moduleAccess?: string[];
  permissionAccess?: string[];
}
