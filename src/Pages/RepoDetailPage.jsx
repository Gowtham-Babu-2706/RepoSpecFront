/**
 * RepoDetailPage — displays full details for a single repository.
 *
 * Navigation:
 *   Reached via navigate("/repo-detail", { state: { repo } }) from Card.jsx.
 *   The repo object comes from the backend ResponseDto (see Repo/ResponseDto.java).
 *
 * Comment section (right panel):
 *   - On mount, fetches real comments from GET /api/v3/repos/{repoId}/comments
 *   - Sending a message calls POST /api/v3/repos/{repoId}/comments
 *   - The JWT in the Authorization header identifies the author (no userId param needed)
 *   - "Global" tab shows per-repo comments; "DM" tab is a future feature placeholder
 */
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCodeBranch,
  faStar,
  faHeart,
  faComment,
  faShare,
  faGlobe,
  faLock,
  faPaperPlane,
  faCircle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { fetchComments, postComment } from "../utils/axios/userApi";
import { useAuth } from "../context/AuthContext";

/* ─── Language badge colours ─────────────────────────────────── */
const LANG_COLORS = {
  Rust:       "bg-orange-100 text-orange-700 border-orange-200",
  JavaScript: "bg-yellow-100 text-yellow-700 border-yellow-200",
  TypeScript: "bg-blue-100   text-blue-700   border-blue-200",
  Java:       "bg-red-100    text-red-700    border-red-200",
  Python:     "bg-green-100  text-green-700  border-green-200",
  default:    "bg-gray-100   text-gray-700   border-gray-200",
};

/* ═══════════════════════════════════════════════════════════════ */
const RepoDetailPage = () => {
  const { state }  = useLocation();
  const repo       = state?.repo;

  // Auth context — used to determine which messages are "self" (own user)
  const { user } = useAuth();

  const [chatTab,     setChatTab]     = useState("global");
  const [messages,    setMessages]    = useState([]);
  const [msgInput,    setMsgInput]    = useState("");
  const [liked,       setLiked]       = useState(false);
  const [commLoading, setCommLoading] = useState(false); // loading state for comment fetch
  const [commError,   setCommError]   = useState("");    // error state for comment operations
  const [sending,     setSending]     = useState(false); // sending state for new comment

  // Ref to auto-scroll the chat to the latest message
  const chatBottomRef = useRef(null);

  // Derived repo fields with safe fallbacks
  const repoId      = repo?.id;
  const repoName    = repo?.repoName || repo?.name || "Repository";
  const description = repo?.description || "No description provided.";
  const stars       = repo?.stars      ?? 0;
  const forks       = repo?.forksCount ?? 0;
  const language    = repo?.language   || "JavaScript";
  const visibility  = repo?.visibility || "public";
  const owner       = repo?.owner      || "unknown";
  const langColor   = LANG_COLORS[language] || LANG_COLORS.default;

  /**
   * Fetches all comments for this repository from the backend on mount.
   * Backend returns comments sorted newest-first (ORDER BY created_at DESC),
   * but we reverse them so the oldest shows at the top of the chat.
   */
  useEffect(() => {
    if (!repoId) return; // guard: no repo passed via navigation state

    const loadComments = async () => {
      setCommLoading(true);
      setCommError("");
      try {
        const data = await fetchComments(repoId);
        // Backend returns newest-first; reverse so oldest appears at top of chat
        setMessages([...data].reverse());
      } catch (err) {
        setCommError("Failed to load comments.");
        console.error("Comment fetch error:", err);
      } finally {
        setCommLoading(false);
      }
    };

    loadComments();
  }, [repoId]);

  /**
   * Auto-scroll the chat panel to the bottom when new messages arrive.
   */
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Sends a new comment to the backend and appends it to the local messages list.
   * The backend stores the author from the JWT — no userId is sent in the body.
   */
  const sendMessage = async () => {
    if (!msgInput.trim() || !repoId) return;

    const content = msgInput.trim();
    setSending(true);
    setMsgInput(""); // optimistically clear input

    try {
      const saved = await postComment(repoId, content);
      // Append the newly created comment to the end of the chat list
      setMessages((prev) => [...prev, saved]);
    } catch (err) {
      setCommError("Failed to send comment. Please try again.");
      setMsgInput(content); // restore input so user doesn't lose their text
      console.error("Comment post error:", err);
    } finally {
      setSending(false);
    }
  };

  /**
   * Formats a comment's createdAt ISO string into a short human-readable time.
   * Falls back to "just now" if the timestamp is missing.
   */
  const formatTime = (createdAt) => {
    if (!createdAt) return "just now";
    return new Date(createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-full bg-slate-50 overflow-hidden">

      {/* ── MAIN CONTENT ──────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">

        {/* Sticky repo header */}
        <div className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Repo avatar — first letter of repo name, gradient background */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {repoName[0]?.toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-slate-900 text-[15px] leading-tight">{repoName}</div>
              <div className="text-[11px] text-slate-400">by @{owner}</div>
            </div>
            {/* Visibility badge — public or private */}
            <span
              className={[
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ml-1",
                visibility === "private"
                  ? "bg-red-50 text-red-600 border-red-200"
                  : "bg-slate-50 text-slate-500 border-slate-200",
              ].join(" ")}
            >
              <FontAwesomeIcon icon={visibility === "private" ? faLock : faGlobe} className="text-[9px]" />
              {visibility}
            </span>
          </div>

          {/* Stat pills — stars, forks, health indicator */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-600 border border-yellow-100">
              <FontAwesomeIcon icon={faStar} />
              {stars}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
              <FontAwesomeIcon icon={faCodeBranch} />
              {forks}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-50 text-green-600 border border-green-100">
              <FontAwesomeIcon icon={faCircle} className="text-[8px]" />
              Good health
            </span>
          </div>
        </div>

        {/* Social actions bar */}
        <div className="bg-white border-b border-slate-100 px-6 py-2.5 flex items-center gap-6">
          {/* Like toggle — purely local state for now */}
          <button
            onClick={() => setLiked((p) => !p)}
            className={[
              "flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer border-0 bg-transparent",
              liked ? "text-rose-500" : "text-slate-400 hover:text-rose-400",
            ].join(" ")}
          >
            <FontAwesomeIcon icon={faHeart} />
            {liked ? 235 : 234} Likes
          </button>
          {/* Comment count — shows real count from fetched messages */}
          <button className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-green-600 transition-colors cursor-pointer border-0 bg-transparent">
            <FontAwesomeIcon icon={faComment} />
            {messages.length} Comment{messages.length !== 1 ? "s" : ""}
          </button>
          <button className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-green-600 transition-colors cursor-pointer border-0 bg-transparent">
            <FontAwesomeIcon icon={faShare} />
            Share
          </button>
        </div>

        {/* README card */}
        <div className="p-5 flex-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">📄 README.md</span>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold ${langColor}`}>
                {language}
              </span>
            </div>
            {/* Card body */}
            <div className="p-5 text-sm text-slate-600 leading-relaxed space-y-3">
              <h2 className="text-base font-bold text-slate-900">{repoName}</h2>
              <p>{description}</p>
              {/* Clone command — uses repo fullLink if available, falls back to constructed URL */}
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-700 overflow-x-auto">
                <span className="text-green-600">$</span>{" "}
                git clone {repo?.fullLink || `https://github.com/${owner}/${repoName}`}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── RIGHT PANEL ───────────────────────────────────────────── */}
      <aside className="w-72 flex-shrink-0 bg-white border-l border-slate-100 flex flex-col overflow-hidden shadow-sm">

        {/* About section */}
        <div className="p-4 border-b border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">About</p>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">{description}</p>

          {/* Language tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {["open-source", language.toLowerCase(), "dev"].map((tag) => (
              <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${langColor}`}>
                #{tag}
              </span>
            ))}
          </div>

          {/* Meta rows */}
          <div className="flex flex-col gap-1.5">
            {[
              ["Main language", language],
              ["Owner", `@${owner}`],
              ["Visibility", visibility],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">{k}</span>
                <span className="font-semibold text-slate-700">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Comment / Chat section ─────────────────────────────── */}
        <div className="flex flex-col flex-1 min-h-0">

          {/* Chat header + tabs */}
          <div className="border-b border-slate-100 px-4 pt-3 pb-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Community Chat
            </p>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5">

            {/* Loading state while fetching comments */}
            {commLoading && (
              <div className="flex justify-center items-center py-6 text-slate-400 text-xs">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                Loading comments…
              </div>
            )}

            {/* Error state */}
            {commError && !commLoading && (
              <div className="text-center text-xs text-red-400 py-4">{commError}</div>
            )}

            {/* Empty state */}
            {!commLoading && !commError && messages.length === 0 && (
              <div className="text-center text-xs text-slate-300 py-6">
                No comments yet. Be the first!
              </div>
            )}

            {/* Real comment bubbles from backend */}
            {messages.map((msg) => {
              // A message is "self" if the username matches the logged-in user's username
              const isSelf = user && msg.username === user.username;
              const avatar = msg.username ? msg.username[0].toUpperCase() : "?";

              return (
                <div key={msg.id} className={`flex gap-2 ${isSelf ? "flex-row-reverse" : "flex-row"}`}>
                  {/* User avatar — green for self, purple gradient for others */}
                  <div
                    className={[
                      "w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white",
                      isSelf ? "bg-green-500" : "bg-gradient-to-br from-purple-400 to-pink-400",
                    ].join(" ")}
                  >
                    {avatar}
                  </div>

                  {/* Message bubble */}
                  <div className={`max-w-[75%] flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
                    {/* Show username only for other users */}
                    {!isSelf && (
                      <span className="text-[10px] text-slate-400 mb-0.5 ml-1">{msg.username}</span>
                    )}
                    <div
                      className={[
                        "px-3 py-2 text-xs leading-relaxed",
                        isSelf
                          ? "bg-green-500 text-white rounded-tl-xl rounded-bl-xl rounded-br-xl"
                          : "bg-slate-100 text-slate-700 rounded-tr-xl rounded-bl-xl rounded-br-xl",
                      ].join(" ")}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-slate-300 mt-0.5 mx-1">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Invisible div at the bottom — scrolled into view when new messages arrive */}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat input */}
          <div className="border-t border-slate-100 p-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-green-300 focus-within:bg-white transition-all">
              <input
                type="text"
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !sending && sendMessage()}
                placeholder={user ? "Type a comment…" : "Log in to comment…"}
                disabled={!user || sending}
                className="flex-1 bg-transparent border-0 outline-none text-xs text-slate-700 placeholder-slate-400 disabled:opacity-50"
              />
              {/* Send button — shows spinner while posting */}
              <button
                onClick={sendMessage}
                disabled={!msgInput.trim() || sending || !user}
                className={[
                  "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all border-0",
                  msgInput.trim() && !sending && user
                    ? "bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed",
                ].join(" ")}
              >
                <FontAwesomeIcon
                  icon={sending ? faSpinner : faPaperPlane}
                  className={`text-[11px] ${sending ? "animate-spin" : ""}`}
                />
              </button>
            </div>
            {/* Hint if user is not logged in */}
            {!user && (
              <p className="text-[10px] text-slate-400 mt-1.5 text-center">
                <a href="/login" className="underline hover:text-slate-600">Log in</a> to leave a comment.
              </p>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default RepoDetailPage;
