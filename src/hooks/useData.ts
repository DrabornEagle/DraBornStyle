import { useEffect, useState, useCallback } from "react";
import { query } from "../services/api";
import { useApp } from "../app/Context";
import { Row } from "../types";
export function useData<T = any>(
  resource: string,
  filters: Row = {},
  enabled = true,
) {
  const { revision } = useApp();
  const [data, setData] = useState<T | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState<string | null>(null),
    [retry, setRetry] = useState(0);
  const serialized = JSON.stringify(filters);
  useEffect(() => {
    let active = true;
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    query<T>(resource, JSON.parse(serialized))
      .then((d) => {
        if (active) setData(d);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [resource, serialized, enabled, revision, retry]);
  return {
    data,
    loading,
    error,
    reload: useCallback(() => setRetry((v) => v + 1), []),
  };
}
