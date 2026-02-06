export interface WeekData {
  week: string;
  avg_goldstein: number | null;
  coop: number;
  conf: number;
  total: number;
  mentions: number;
}

export interface PairData {
  actor1: string;
  actor2: string;
  label: string;
  total_events: number;
  recent_avg_goldstein: number | null;
  trend: number | null;
  data: WeekData[];
}

export interface Rankings {
  most_conflictual: string[];
  most_cooperative: string[];
  biggest_shifts: string[];
}

export interface PulseData {
  generated_at: string;
  weeks: string[];
  pairs: PairData[];
  rankings: Rankings;
  countries: Record<string, string>;
}
