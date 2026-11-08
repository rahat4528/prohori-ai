export type EventSource = "scanner" | "honeypot" | "ratelimiter" | "analyst";
export type EventSeverity = "info" | "low" | "medium" | "high" | "critical";

export interface RecommendedAction {
  action_id: string;
  action_type: string;
  target: string;
  description_en: string;
  description_bn: string;
  risk_level: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "EXECUTED";
  requires_human_approval: boolean;
}

export interface AnalystEnrichment {
  severity?: EventSeverity;
  confidence?: number;
  narrative_en?: string;
  narrative_bn?: string;
  citations?: string[];
  mitre_technique?: string;
  recommended_action?: string;
  recommendations?: RecommendedAction[];
  requires_human_approval?: boolean;
  provider?: string;
}

export interface SecurityEvent {
  id: string;
  ts: string;
  source: EventSource;
  severity: EventSeverity;
  type: string;
  details: Record<string, any>;
  analyst?: AnalystEnrichment | null;
}

export interface Incident {
  incident_id: string;
  source_ip: string;
  severity: EventSeverity;
  status?: "ACTIVE" | "CONTAINED" | "RESOLVED";
  event_count: number;
  events: SecurityEvent[];
  summary_en: string;
  summary_bn: string;
  first_seen?: string;
  last_seen?: string;
}

export interface KnowledgeDoc {
  id: string;
  type: string;
  title: string;
  content: string;
  mitigation: string;
  metadata?: Record<string, any>;
}


export interface AskResponse {
  question: string;
  answer: string;
  language: "en" | "bn";
  citations: string[];
  referenced_event_ids: string[];
  provider: string;
}

