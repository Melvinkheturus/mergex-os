export const LEAD_STATUS = {
  NEW: "new",
  CONTACTED: "contacted",
  QUALIFIED: "qualified",
  LOST: "lost",
} as const;

export const DEAL_STAGE = {
  PROSPECTING: "prospecting",
  PROPOSAL: "proposal",
  NEGOTIATION: "negotiation",
  CLOSED_WON: "closed_won",
  CLOSED_LOST: "closed_lost",
} as const;
