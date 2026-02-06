import { useState, useEffect } from "react";
import type { PulseData } from "../types";
import { DATA_URL, STALE_THRESHOLD_MS } from "../config";

interface UseEventDataResult {
  data: PulseData | null;
  loading: boolean;
  error: string | null;
  isStale: boolean;
}

export function useEventData(): UseEventDataResult {
  const [data, setData] = useState<PulseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const res = await fetch(DATA_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: PulseData = await res.json();
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data");
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const isStale =
    data !== null &&
    Date.now() - new Date(data.generated_at).getTime() > STALE_THRESHOLD_MS;

  return { data, loading, error, isStale };
}
