"use client";

import { useCurrentUser } from "./useCurrentUser";

export function usePermissions() {
  const { user } = useCurrentUser();
  return { user };
}
