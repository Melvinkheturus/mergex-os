export interface Teammate {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  designation?: string | null;
  status: "ACTIVE" | "SUSPENDED" | "ARCHIVED";
  role: {
    label: string;
  };
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  status: string;
  createdAt: string;
}

export interface Proposal {
  id: string;
  title: string;
  proposalNumber: string;
  status: string;
  value: number;
  createdAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  scheduledAt: string;
  duration: number;
  mode: string;
  meetingUrl: string | null;
  status: string;
  lead: {
    id: string;
    companyName: string;
    contactPerson: string;
  } | null;
  organizer: {
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  } | null;
}

export interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string | null;
  phone: string | null;
  expectedValue: number | null;
  winLossStatus: string | null;
  nextActionDate: string | null;
  createdAt: string;
  owner: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    avatarUrl: string | null;
  } | null;
  stage: {
    id: string;
    name: string;
    label: string;
    color: string | null;
  } | null;
  source: {
    id: string;
    name: string;
  } | null;
}

export interface AnalyticsWidgetProps {
  type: string;
  teammates: Teammate[];
  brands: Brand[];
  leads?: Lead[];
  meetings?: Meeting[];
  proposals?: Proposal[];
  clients?: Client[];
}
