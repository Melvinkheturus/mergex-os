export interface Teammate {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  designation?: string | null;
  role: {
    name: string;
    label: string;
  };
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
}

export interface SettingsPageProps {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    designation: string | null;
    avatarUrl: string | null;
    role: {
      name: string;
      label: string;
    };
  } | null;
  brands: Brand[];
  teammates: Teammate[];
}

export type SettingsTab =
  | "my-profile"
  | "notifications"
  | "brand-settings"
  | "crm-settings"
  | "members"
  | "audit-logs";
