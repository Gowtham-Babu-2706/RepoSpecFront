import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faCodeBranch, faExternalLinkAlt, faCalendarAlt, faLock, faGlobe, faCheck, faSpinner, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { createRepoData } from "./axios/userApi";


export const Card = ({ repo }) => {

  const navigate = useNavigate();
  if (!repo) return null;

  // Format date safely
  const formattedDate = repo.updatedAt
    ? new Date(repo.updatedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Recently";

  return (
    <div
      className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full min-h-[220px] cursor-pointer"
      onClick={() => navigate("/repo-detail", { state: { repo } })}
    >
      <div>
        {/* Title and Visibility */}
        <div className="flex items-start justify-between gap-2 mb-2 ">
          <h3 className="font-semibold text-lg text-black tracking-tight line-clamp-1 hover:underline">
            <a href={repo.fullLink} target="_blank" rel="noopener noreferrer">
              {repo.repoName || repo.name}
            </a>
          </h3>
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            repo.visibility === "private" 
              ? "bg-red-50 text-red-700 border-red-200" 
              : "bg-gray-100 text-gray-700 border-gray-200"
          }`}>
            <FontAwesomeIcon icon={repo.visibility === "private" ? faLock : faGlobe} className="text-[10px]" />
            {repo.visibility || "public"}
          </span>
        </div>

        {/* Owner Info */}
        {repo.owner && (
          <p className="text-xs text-gray-500 mb-3">
            by <span className="font-medium">@{repo.owner}</span>
          </p>
        )}

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
          {repo.description || "No description provided."}
        </p>
      </div>

      {/* Footer Details */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        
        {/* Metadata Details */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
          
          {/* Language / Tech stack */}
          {repo.language && (
            <span className="inline-flex items-center gap-1.5 font-medium px-2 py-1 bg-gray-100 rounded text-black">
              {repo.language}
            </span>
          )}

          {/* Stars & Forks */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1" title="Stars">
              <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
              {repo.stars || 0}
            </span>
            <span className="flex items-center gap-1" title="Forks">
              <FontAwesomeIcon icon={faCodeBranch} className="text-gray-500" />
              {repo.forksCount || 0}
            </span>
          </div>

        </div>

        {/* Action Button & Date */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Date */}
          <span className="text-[11px] text-gray-400 flex items-center gap-1">
            <FontAwesomeIcon icon={faCalendarAlt} />
            Updated {formattedDate}
          </span>

          {/* GitHub link button */}
          <a
            href={repo.fullLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-gray-800 text-white rounded-lg text-xs font-semibold transition"
          >
            GitHub
            <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" />
          </a>

        </div>

      </div>
    </div>
  );
};


export const MyReposPageCard = ({ repo }) => {

  const navigate = useNavigate();
  const [importState, setImportState] = useState("idle"); // "idle" | "loading" | "success" | "error"
  const [importError, setImportError] = useState("");

  if (!repo) return null;

  const handleImport = async (e) => {
    e.stopPropagation();
    if (importState === "loading" || importState === "success") return;
    setImportState("loading");
    setImportError("");
    try {
      await createRepoData({
        repoName:    repo.repoName    || repo.fullName || "",
        description: repo.description || "",
        language:    repo.language    || "",
        stars:       repo.stars       || 0,
        forksCount:  repo.forks       ?? repo.forksCount ?? 0,
        visibility:  repo.isPrivate   ? "private" : "public",
        fullLink:    repo.htmlUrl     || repo.fullLink || "",
        owner:       repo.owner       || "",
        updatedAt:   repo.updatedAt   || null,
        githubId:    repo.githubId    || null,
      });
      setImportState("success");
    } catch (err) {
      setImportError(err.response?.data?.message || err.message || "Import failed");
      setImportState("error");
      setTimeout(() => setImportState("idle"), 3000);
    }
  };

  // Format date safely
  const formattedDate = repo.updatedAt
    ? new Date(repo.updatedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Recently";

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full min-h-[220px] "
    >
      <div>
        {/* Title and Visibility */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-lg text-black tracking-tight line-clamp-1 hover:underline">
            <a href={repo.htmlUrl || repo.fullLink} target="_blank" rel="noopener noreferrer">
              {repo.repoName || repo.name || repo.fullName}
            </a>
          </h3>
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            (repo.isPrivate || repo.visibility === "private")
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-gray-100 text-gray-700 border-gray-200"
          }`}>
            <FontAwesomeIcon icon={(repo.isPrivate || repo.visibility === "private") ? faLock : faGlobe} className="text-[10px]" />
            {repo.isPrivate ? "private" : (repo.visibility || "public")}
          </span>
        </div>


        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
          {repo.description || "No description provided."}
        </p>
      </div>

      {/* Footer Details */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        
        {/* Metadata Details */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
          
          {/* Language / Tech stack */}
          {repo.language && (
            <span className="inline-flex items-center gap-1.5 font-medium px-2 py-1 bg-gray-100 rounded text-black">
              {repo.language}
            </span>
          )}

          {/* Stars & Forks */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1" title="Stars">
              <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
              {repo.stars || 0}
            </span>
            <span className="flex items-center gap-1" title="Forks">
              <FontAwesomeIcon icon={faCodeBranch} className="text-gray-500" />
              {repo.forks ?? repo.forksCount ?? 0}
            </span>
          </div>

        </div>

        {/* Action Button & Date */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Date */}
          <span className="text-[11px] text-gray-400 flex items-center gap-1">
            <FontAwesomeIcon icon={faCalendarAlt} />
            Updated {formattedDate}
          </span>

          <button
            onClick={handleImport}
            disabled={importState === "loading" || importState === "success"}
            title={importState === "error" ? importError : undefined}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
              importState === "success"
                ? "bg-green-600 text-white"
                : importState === "error"
                ? "bg-red-600 text-white"
                : "bg-slate-900 hover:bg-slate-800 text-white"
            }`}
          >
            {importState === "loading" && <FontAwesomeIcon icon={faSpinner} className="animate-spin" />}
            {importState === "success" && <FontAwesomeIcon icon={faCheck} />}
            {importState === "error"   && <FontAwesomeIcon icon={faTriangleExclamation} />}
            {importState === "loading"  ? "Importing…"
              : importState === "success" ? "Imported"
              : importState === "error"   ? "Failed"
              : "Import"}
          </button>
        </div>

      </div>
    </div>
  );
};
