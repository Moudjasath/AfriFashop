import { useState, useEffect, useRef } from 'react';
import { productsApi } from '../services/api';

/**
 * Fetches products from the API whenever params change (deep-compared via JSON).
 * Returns { products, pagination, loading, error }.
 */
export function useProducts(params = {}) {
  const [products, setProducts]     = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // Keep latest params in a ref so the effect body always sees them
  // without adding the object to the dependency array (avoids infinite loops).
  const paramsRef = useRef(params);
  useEffect(() => { paramsRef.current = params; });

  // Serialize to detect real changes
  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    productsApi.list(paramsRef.current)
      .then(res => {
        if (cancelled) return;
        setProducts(res.data ?? []);
        setPagination(res.pagination ?? null);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.message || 'Failed to load products');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [paramsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return { products, pagination, loading, error };
}
