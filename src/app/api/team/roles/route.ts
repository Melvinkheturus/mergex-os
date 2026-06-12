import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";
import { PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from "@/lib/auth/permissions";
import crypto from "crypto";

async function ensurePermissionsExist() {
  const allPermissions = Object.entries(PERMISSIONS);
  await Promise.all(
    allPermissions.map(([id, p]) =>
      db.permission.upsert({
        where: { id },
        create: { id, module: p.module, action: p.action },
        update: {},
      })
    )
  );
}

async function seedDefaultRolesIfNeeded() {
  const count = await db.role.count();
  if (count <= 2) {
    await ensurePermissionsExist();
    for (const [roleName, permKeys] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
      if (roleName === "super_admin") continue;

      const label = roleName === "cx_executive"
        ? "CX Executive"
        : roleName === "sales_manager"
        ? "Sales Manager"
        : roleName === "proposal_manager"
        ? "Proposal Manager"
        : roleName
            .split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");

      await db.role.upsert({
        where: { name: roleName },
        create: {
          id: crypto.randomUUID(),
          name: roleName,
          label,
          description: `Default system role for ${label}`,
          isSystem: true,
          RolePermission: {
            create: permKeys.map((k) => ({
              id: crypto.randomUUID(),
              permissionId: k,
            })),
          },
        },
        update: {},
      });
    }
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await seedDefaultRolesIfNeeded();
  } catch (err) {
    console.error("[roles/route] Seeding default roles failed:", err);
  }

  const roles = await db.role.findMany({
    where: { name: { not: "super_admin" } },
    orderBy: { label: "asc" },
    select: {
      id: true,
      name: true,
      label: true,
      description: true,
      isSystem: true,
      RolePermission: {
        select: {
          permissionId: true,
        },
      },
    },
  });

  return NextResponse.json(roles);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isSuperAdmin = user.role.name === "super_admin";
  const canManage = isSuperAdmin || user.permissions.includes("roles.manage");
  if (!canManage) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { label, description } = body as { label?: string; description?: string };

  if (!label?.trim() || !description?.trim()) {
    return NextResponse.json({ error: "Label and description are required" }, { status: 400 });
  }

  const name = label.trim().toLowerCase().replace(/\s+/g, "_");

  const existing = await db.role.findUnique({ where: { name } });
  if (existing) {
    return NextResponse.json({ error: "A role with this name already exists" }, { status: 409 });
  }

  await ensurePermissionsExist();
  const defaultKeys = DEFAULT_ROLE_PERMISSIONS.viewer;

  const newRole = await db.role.create({
    data: {
      id: crypto.randomUUID(),
      name,
      label: label.trim(),
      description: description.trim(),
      isSystem: false,
      RolePermission: {
        create: defaultKeys.map((k) => ({
          id: crypto.randomUUID(),
          permissionId: k,
        })),
      },
    },
    select: {
      id: true,
      name: true,
      label: true,
      description: true,
      isSystem: true,
      RolePermission: {
        select: {
          permissionId: true,
        },
      },
    },
  });

  return NextResponse.json(newRole);
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isSuperAdmin = user.role.name === "super_admin";
  const canManage = isSuperAdmin || user.permissions.includes("roles.manage");
  if (!canManage) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { roleId, permissions } = body as { roleId?: string; permissions?: string[] };

  if (!roleId || !Array.isArray(permissions)) {
    return NextResponse.json({ error: "roleId and permissions array are required" }, { status: 400 });
  }

  const role = await db.role.findUnique({ where: { id: roleId } });
  if (!role) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }

  await ensurePermissionsExist();

  await db.$transaction([
    db.rolePermission.deleteMany({
      where: { roleId },
    }),
    db.rolePermission.createMany({
      data: permissions.map((p) => ({
        id: crypto.randomUUID(),
        roleId,
        permissionId: p,
      })),
    }),
  ]);

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isSuperAdmin = user.role.name === "super_admin";
  const canManage = isSuperAdmin || user.permissions.includes("roles.manage");
  if (!canManage) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Role ID is required" }, { status: 400 });
  }

  const role = await db.role.findUnique({ where: { id } });
  if (!role) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }

  if (role.isSystem) {
    return NextResponse.json({ error: "Cannot delete system roles" }, { status: 400 });
  }

  await db.role.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
