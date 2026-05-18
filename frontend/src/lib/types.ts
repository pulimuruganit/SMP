export type Tone = "neutral" | "success" | "warning" | "danger";

export type SummaryCard = {
  key: string;
  label: string;
  value: string;
  sublabel?: string | null;
  tone: Tone;
};

export type SummaryResponse = {
  greeting_name: string;
  as_of: string;
  cards: SummaryCard[];
};

export type PriorityLevel = "high" | "medium" | "low";

export type PriorityItem = {
  id: string;
  title: string;
  detail?: string | null;
  level: PriorityLevel;
};

export type PrioritiesResponse = {
  items: PriorityItem[];
};

export type CashFlowPoint = {
  day: string;
  incoming: number;
  outgoing: number;
};

export type CashFlowResponse = {
  horizon_days: number;
  net_expected: { currency: string; amount: number };
  points: CashFlowPoint[];
};

export type EmailInsightsResponse = {
  last_days: number;
  total: number;
  breakdown: { positive: number; neutral: number; negative: number };
  recent_needing_attention: Array<{
    id: string;
    sender: string;
    subject: string;
    received_at: string;
    priority: PriorityLevel;
  }>;
};

export type FollowUpsResponse = {
  statuses: Array<{ label: string; count: number }>;
};

export type ChatResponse = {
  answer: string;
  suggested_actions: string[];
};

export type IntegrationProvider = {
  provider: "gmail" | "outlook";
  connected: boolean;
  email_address?: string | null;
};

export type IntegrationsResponse = {
  providers: IntegrationProvider[];
};
