import { useEffect, useState, useCallback } from "react";
import { query } from "../services/api";
import { useApp } from "../app/Context";
import { Row } from "../types";
export function useData<T = any>(
  resource: string,
  filters: Row = {},
  enabled = true,
) {
  const { revision, session, boot } = useApp();
  const [dataIdentity, setDataIdentity] = useState("");
  const [data, setData] = useState<T | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState<string | null>(null),
    [retry, setRetry] = useState(0);
  const serialized = JSON.stringify(filters);
  const identity = JSON.stringify([
    resource,
    serialized,
    session?.user.id,
    boot?.is_admin,
    boot?.demo_batches.map((batch) => batch.id),
  ]);
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
        if (active) {
          setData(d);
          setDataIdentity(identity);
        }
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
  }, [identity, enabled, revision, retry]);
  return {
    data: enabled && dataIdentity === identity ? data : null,
    loading,
    error,
    reload: useCallback(() => setRetry((v) => v + 1), []),
  };
}
