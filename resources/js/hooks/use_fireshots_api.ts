import axios from "axios";

export interface SnapshotPayload {
  sell_rate: number;
  snapshot_date: string;
  force?: boolean;
}

export interface SummaryResponse {
  snapshot_date: string;
  total_ngn: number;
  total_ngn_unified: number;
  total_usd_equiv: number;
  rates: { sell: number; buy: number };
}

export default function useFireshotsAPI() {
  const base = "/api/shots";

  return {
    runSnapshot: (payload: SnapshotPayload) =>
      axios.post(`${base}/run`, payload),

    getDays: () => axios.get<string[]>(`${base}/days`),

    getSummary: (date?: string) =>
      axios.get<SummaryResponse>(`${base}/summary`, {
        params: date ? { snapshot_date: date } : {},
      }),

    getChange: (start: string, end: string) =>
      axios.get(`${base}/change`, { params: { start, end } }),
  };
}
