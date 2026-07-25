import React, { useState, useEffect, useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faFilter,
  faArrowLeft,
  faArrowRight,
  faCompass,
  faXmark,
  faSliders,
  faAngleDown,
} from "@fortawesome/free-solid-svg-icons";
import { Card } from "../utils/Card";
import { fetchPublicRepos } from "../utils/axios/userApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const LANGUAGES = [
  "All",
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "Go",
  "Rust",
  "C++",
  "C#",
  "Ruby",
  "PHP",
  "Kotlin",
  "Swift",
  "Dart",
  "Shell",
];

const SORT_OPTIONS = [
  { label: "Most Stars",        field: "stars",      order: "desc" },
  { label: "Least Stars",       field: "stars",      order: "asc"  },
  { label: "Most Forks",        field: "forksCount", order: "desc" },
  { label: "Recently Updated",  field: "updatedAt",  order: "desc" },
  { label: "Oldest Updated",    field: "updatedAt",  order: "asc"  },
];

const PAGE_SIZE = 9;

// ─── Skeleton Card ─────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-3 min-h-[220px] animate-pulse">
    <div className="flex justify-between items-start gap-2">
      <div className="h-5 bg-gray-200 rounded w-2/3" />
      <div className="h-5 bg-gray-100 rounded-full w-16" />
    </div>
    <div className="h-3 bg-gray-100 rounded w-1/4" />
    <div className="space-y-2 flex-1">
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-5/6" />
      <div className="h-3 bg-gray-100 rounded w-3/4" />
    </div>
    <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
      <div className="h-5 bg-gray-100 rounded w-20" />
      <div className="h-7 bg-gray-200 rounded-lg w-24" />
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const SearchPage = () => {
  const [query, setQuery]         = useState("");
  const [language, setLanguage]   = useState("All");
  const [sortIdx, setSortIdx]     = useState(0);
  const [page, setPage]           = useState(0);

  const [repos, setRepos]             = useState([]);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const [langOpen, setLangOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const debounceRef = useRef(null);
  const langDropRef = useRef(null);
  const sortDropRef = useRef(null);

  // ── Close dropdowns on outside click ─────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (langDropRef.current && !langDropRef.current.contains(e.target)) setLangOpen(false);
      if (sortDropRef.current && !sortDropRef.current.contains(e.target)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Core fetch ────────────────────────────────────────────────────────────
  const loadRepos = useCallback(async (q, lang, sIdx, pg) => {
    setLoading(true);
    setError("");
    try {
      const sort = SORT_OPTIONS[sIdx];
      const data = await fetchPublicRepos({
        search:    q,
        language:  lang === "All" ? "" : lang,
        page:      pg,
        size:      PAGE_SIZE,
        sortField: sort.field,
        sortOrder: sort.order,
      });
      setRepos(data.content ?? []);
      setTotalPages(data.totalPages ?? 0);
      setTotalElements(data.totalElements ?? 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load repositories.");
      setRepos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Debounce search + filter changes, reset page ──────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      loadRepos(query, language, sortIdx, 0);
    }, 400);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, language, sortIdx]);

  // ── Re-fetch when page changes (not triggered by filter/search) ───────────
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    loadRepos(query, language, sortIdx, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleClearSearch = () => { setQuery(""); };

  const activeLang = language === "All" ? "Language" : language;
  const activeSort = SORT_OPTIONS[sortIdx].label;

  // ── Pagination helpers ────────────────────────────────────────────────────
  const renderPageButtons = () =>
    Array.from({ length: totalPages }, (_, i) => i).map((pg) => {
      const isCurrent  = pg === page;
      const nearCurrent = Math.abs(pg - page) <= 2;
      const isEdge      = pg === 0 || pg === totalPages - 1;

      if (!nearCurrent && !isEdge) {
        if (pg === 1 || pg === totalPages - 2)
          return <span key={pg} className="text-slate-400 text-sm px-1">…</span>;
        return null;
      }
      return (
        <button
          key={pg}
          onClick={() => setPage(pg)}
          className={`w-9 h-9 rounded-lg text-sm font-semibold transition cursor-pointer ${
            isCurrent
              ? "bg-green-600 text-white shadow-sm shadow-green-200"
              : "bg-white border border-slate-200 text-slate-600 hover:border-green-400 hover:text-green-700"
          }`}
        >
          {pg + 1}
        </button>
      );
    });

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero / Header ───────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 px-8 pt-10 pb-8">
        <div className="max-w-5xl mx-auto">

          {/* Title */}
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center shadow-sm shadow-green-200">
              <FontAwesomeIcon icon={faCompass} className="text-white text-sm" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Discover Repositories
            </h1>
          </div>
          <p className="text-slate-500 text-sm ml-12 mb-7">
            Explore public repositories shared by the community
          </p>

          {/* Search Bar */}
          <div className="relative">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none"
            />
            <input
              id="search-input"
              type="text"
              placeholder="Search repositories by name, description…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition shadow-sm"
            />
            {query && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1 cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            )}
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap items-center gap-3 mt-4">

            {/* Language dropdown */}
            <div ref={langDropRef} className="relative">
              <button
                id="language-filter-btn"
                onClick={() => { setLangOpen((o) => !o); setSortOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:border-green-400 hover:text-green-700 transition shadow-xs cursor-pointer"
              >
                <FontAwesomeIcon icon={faFilter} className="text-xs" />
                {activeLang}
                <FontAwesomeIcon
                  icon={faAngleDown}
                  className={`text-xs transition-transform ${langOpen ? "rotate-180" : ""}`}
                />
              </button>
              {langOpen && (
                <div className="absolute top-full mt-2 left-0 z-30 bg-white border border-slate-200 rounded-xl shadow-lg p-1 min-w-[160px] max-h-64 overflow-y-auto">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => { setLanguage(lang); setLangOpen(false); setPage(0); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition cursor-pointer ${
                        language === lang
                          ? "bg-green-50 text-green-700 font-semibold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort dropdown */}
            <div ref={sortDropRef} className="relative">
              <button
                id="sort-btn"
                onClick={() => { setSortOpen((o) => !o); setLangOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:border-green-400 hover:text-green-700 transition shadow-xs cursor-pointer"
              >
                <FontAwesomeIcon icon={faSliders} className="text-xs" />
                {activeSort}
                <FontAwesomeIcon
                  icon={faAngleDown}
                  className={`text-xs transition-transform ${sortOpen ? "rotate-180" : ""}`}
                />
              </button>
              {sortOpen && (
                <div className="absolute top-full mt-2 left-0 z-30 bg-white border border-slate-200 rounded-xl shadow-lg p-1 min-w-[195px]">
                  {SORT_OPTIONS.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setSortIdx(idx); setSortOpen(false); setPage(0); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition cursor-pointer ${
                        sortIdx === idx
                          ? "bg-green-50 text-green-700 font-semibold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Active language chip */}
            {language !== "All" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-semibold">
                {language}
                <button
                  onClick={() => { setLanguage("All"); setPage(0); }}
                  className="hover:text-green-900 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </span>
            )}

            {/* Results count */}
            {!loading && totalElements > 0 && (
              <span className="ml-auto text-xs text-slate-400 font-medium">
                {totalElements.toLocaleString()}{" "}
                {totalElements === 1 ? "repo" : "repos"} found
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-8 py-8">

        {/* Error banner */}
        {error && !loading && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 mb-6 text-sm">
            <span className="text-lg">⚠️</span>
            {error}
          </div>
        )}

        {/* Loading skeleton grid */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && repos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="text-slate-400 text-2xl" />
            </div>
            <h3 className="text-slate-700 font-semibold text-lg mb-1">No repositories found</h3>
            <p className="text-slate-400 text-sm max-w-xs">
              {query
                ? `No results for "${query}". Try a different keyword or remove filters.`
                : "No public repositories available yet. Check back later!"}
            </p>
            {(query || language !== "All") && (
              <button
                onClick={() => { setQuery(""); setLanguage("All"); setPage(0); }}
                className="mt-5 px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Repo card grid */}
        {!loading && repos.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {repos.map((repo, i) => (
                <Card key={repo.id ?? repo.githubId ?? i} repo={repo} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  id="prev-page-btn"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:border-green-400 hover:text-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-xs"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                  Prev
                </button>

                <div className="flex items-center gap-1">
                  {renderPageButtons()}
                </div>

                <button
                  id="next-page-btn"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:border-green-400 hover:text-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-xs"
                >
                  Next
                  <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                </button>
              </div>
            )}

            <p className="text-center text-xs text-slate-400 mt-3">
              Page {page + 1} of {totalPages}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;