/**
 * useUser.js — Custom React hooks that wrap the userApi.js functions.
 *
 * Each hook encapsulates its own loading/error state so components stay clean.
 * All hooks rely on the JWT being stored in localStorage; the api.js interceptor
 * picks it up automatically, so no token is passed explicitly here.
 *
 * Exported hooks:
 *   useUser         — paginated repo list with search, filter, and sort
 *   useRepoStats    — aggregate statistics for the user's repos
 *   useCreateRepo   — creates a manual repo record
 *   useGitHubStatus — checks whether the user's GitHub account is linked
 *   useConnectGitHub— connects a GitHub account
 *   useSyncRepos    — triggers a full GitHub → DB sync
 */
import { useState, useEffect, useCallback } from "react";
import {
  fetchUserRepos,
  fetchPublicRepos,
  fetchRepoStats,
  createRepoData,
  connectGitHub,
  fetchGitHubStatus,
  fetchGitHubRepos,
} from "./userApi";

/**
 * useUser — fetches and paginates the authenticated user's repositories.
 *
 * Supports server-side filtering (search, language) and sorting (stars, name, etc.).
 * Re-fetches automatically whenever params change.
 *
 * @param {Object} initialParams — overrides for the default params below.
 * @returns {{
 *   data: ResponseDto[],        — current page of repos
 *   loading: boolean,
 *   error: string,
 *   page: number,               — current 0-based page index
 *   totalPages: number,
 *   totalElements: number,
 *   params: Object,             — current filter/sort params
 *   setFilter: Function,        — merge new params and re-fetch from page 0
 *   nextPage: Function,
 *   prevPage: Function,
 *   refetch: Function           — re-fetch the current page
 * }}
 */
export const useUser = (initialParams = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [params, setParams] = useState({
    search: "",
    language: "",
    sortField: "stars",
    sortOrder: "desc",
    size: 9,
    ...initialParams
  });

  const getRepos = useCallback(async (pageNum = 0, currentParams = params) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetchUserRepos({
        ...currentParams,
        page: pageNum
      });
      setData(res.content || []);
      setPage(res.number || 0);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      setError(err.response?.data || err.message || "Failed to load repositories");
    } finally {
      setLoading(false);
    }
  }, [params]);

  // Refetch when params change
  useEffect(() => {
    getRepos(0, params);
  }, [params, getRepos]);

  const setFilter = (newParams) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  const nextPage = () => {
    if (page + 1 < totalPages) {
      getRepos(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 0) {
      getRepos(page - 1);
    }
  };

  return {
    data,
    loading,
    error,
    page,
    totalPages,
    totalElements,
    params,
    setFilter,
    nextPage,
    prevPage,
    refetch: () => getRepos(page)
  };
};

/**
 * usePublicRepos — fetches and paginates public repositories across the platform.
 * Does NOT require authentication.
 */
export const usePublicRepos = (initialParams = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [params, setParams] = useState({
    search: "",
    language: "",
    sortField: "stars",
    sortOrder: "desc",
    size: 9,
    ...initialParams
  });

  const getPublic = useCallback(async (pageNum = 0, currentParams = params) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetchPublicRepos({
        ...currentParams,
        page: pageNum
      });
      setData(res.content || []);
      setPage(res.number || 0);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      setError(err.response?.data || err.message || "Failed to load public repositories");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    getPublic(0, params);
  }, [params, getPublic]);

  const setFilter = (newParams) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  const nextPage = () => {
    if (page + 1 < totalPages) {
      getPublic(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 0) {
      getPublic(page - 1);
    }
  };

  return {
    data,
    loading,
    error,
    page,
    totalPages,
    totalElements,
    params,
    setFilter,
    nextPage,
    prevPage,
    refetch: () => getPublic(page)
  };
};

// Hook to fetch repository stats
export const useRepoStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getStats = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchRepoStats();
      setStats(data);
    } catch (err) {
      setError(err.response?.data || err.message || "Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStats();
  }, []);

  return { stats, loading, error, refetch: getStats };
};

// Hook to create manual repositories
export const useCreateRepo = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const createRepo = async (payload) => {
    try {
      setLoading(true);
      setError("");
      setSuccess(false);
      const res = await createRepoData(payload);
      setSuccess(true);
      return res;
    } catch (err) {
      setError(err.response?.data || err.message || "Upload failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createRepo, loading, error, success };
};

// Hook to query GitHub status
export const useGitHubStatus = () => {
  const [status, setStatus] = useState({ connected: false, githubUsername: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getStatus = async () => {
    try {
      setLoading(true);
      const res = await fetchGitHubStatus();
      setStatus(res);
    } catch (err) {
      setError(err.message || "Failed to fetch GitHub status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStatus();
  }, []);

  return { status, loading, error, refetch: getStatus };
};

// Hook to connect GitHub account
export const useConnectGitHub = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const connect = async (payload) => {
    try {
      setLoading(true);
      setError("");
      setSuccess(false);
      const res = await connectGitHub(payload);
      setSuccess(true);
      return res;
    } catch (err) {
      setError(err.response?.data || err.message || "Connection failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { connect, loading, error, success };
};

// Hook to trigger manual Repository Synchronization
export const useSyncRepos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState([]);

  const sync = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess(false);
      const res = await syncGitHubRepos();
      setSuccess(true);
      console.log(res)
      setData(res)
      return res;
    } catch (err) {
      setError(err.response?.data || err.message || "Sync failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { sync, loading, error, success, data };
};

// Hook to fetch GitHub repos for preview (no DB save)
export const useGitHubRepos = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetchGitHubRepos();
      console.log(res)
      setData(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.response?.data || err.message || "Failed to load GitHub repositories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
};
