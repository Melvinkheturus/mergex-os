import type {
  User,
  Brand,
  UserInvite,
  LoginAudit,
  InviteStatus,
  AuditAction,
} from "@prisma/client";

export type {
  User,
  Brand,
  UserInvite,
  LoginAudit,
  InviteStatus,
  AuditAction,
};

export type UserWithWorkspace = User & {
  brand: Brand | null;
};
