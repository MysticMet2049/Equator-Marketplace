/**
 * useApiRequest.js
 * Generic hook to run an async API call with standard loading/error/data
 * state management. Used as the building block for useProducts, useStores,
 * and any other data-fetching hook, so every page gets the same
 * loading / error / success / empty pattern for free.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { ApiError } from "../api/httpClient";

/**
 * @param {(...args: any[]) => Promise<any>} requestFn — the API function to call
 * @param {{ immediate?: boolean, initialArgs?: any[] }} options
 *   immediate   — if true, runs the request once on mount with initialArgs
 *   initialArgs — arguments passed to requestFn when immediate is true
 *
 * @returns {{
 *   data: any,
 *   loading: boolean,
 *   error: string|null,
 *   run: (...args:any[]) => Promise<any>,
 *   reset: () => void,
 * }}
 */
export function useApiRequest(requestFn, { immediate = false, initialArgs = [] } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  // Avoid setting state after unmount (e.g. user navigates away mid-request)
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const run = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await requestFn(...args);
        if (mountedRef.current) {
          setData(result);
          setLoading(false);
        }
        return result;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "Une erreur inattendue est survenue.";

        // Technical details stay in console; UI only sees the clean message
        console.error("[useApiRequest] request failed:", err);

        if (mountedRef.current) {
          setError(message);
          setLoading(false);
        }
        throw err;
      }
    },
    [requestFn]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      run(...initialArgs).catch(() => {
        // error already captured in state — swallow here to avoid
        // unhandled promise rejection warnings on mount
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, error, run, reset };
}

export default useApiRequest;
