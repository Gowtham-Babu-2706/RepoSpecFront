import api from "./api";

// ─── Authentication APIs ──────────────────────────────────────────────────────

export const registerUser = async (data) => {
  const resp = await api.post("auth/register", data);
  return resp.data;
};

export const loginUserApi = async (data) => {
  const resp = await api.post("auth/login", data);
  return resp.data;
};

// ─── Repository APIs ──────────────────────────────────────────────────────────

export const fetchUserRepos = async ({
  search = "",
  language = "",
  page = 0,
  size = 9,
  sortField = "stars",
  sortOrder = "desc",
} = {}) => {
  // Spring Data Pageable expects sort as "field,direction" (e.g. "stars,desc")
  const sortParam = `${sortField},${sortOrder}`;
  const resp = await api.get("repo", {
    params: { search, language, page, size, sort: sortParam },
  });
  return resp.data;
};

export const fetchPublicRepos = async ({
  search = "",
  language = "",
  page = 0,
  size = 9,
  sortField = "stars",
  sortOrder = "desc",
} = {}) => {
  const sortParam = `${sortField},${sortOrder}`;
  const resp = await api.get("repo/public", {
    params: { search, language, page, size, sort: sortParam },
  });
  return resp.data;
};


export const fetchRepoStats = async () => {
  const resp = await api.get("repo/stats");
  return resp.data;
};


export const createRepoData = async (data) => {
  const resp = await api.post("repo", data);
  return resp.data;
};


export const connectGitHub = async (data) => {
  const resp = await api.post("github/connect", data);
  return resp.data;
};


export const fetchGitHubRepos = async () => {
  const resp = await api.post("github/sync");
  return resp.data;
};


export const fetchGitHubStatus = async () => {
  const resp = await api.get("github/status");
  return resp.data;
};



// ─── Comment APIs ──────────────────────────────────────────────────────────

export const fetchComments = async (repoId) => {
  const resp = await api.get(`repos/${repoId}/comments`);
  return resp.data;
};

export const postComment = async (repoId, content) => {
  const resp = await api.post(`repos/${repoId}/comments`, { content });
  return resp.data;
};