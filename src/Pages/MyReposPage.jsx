import { faArrowRightLong, faSpinner, faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useGitHubRepos } from "../utils/axios/useUser";
import { Link } from "react-router-dom";
import { MyReposPageCard } from "../utils/Card";

const MyReposPage = () => {
  const { data, loading, error, refetch } = useGitHubRepos();

  return (
    <section className="py-12 px-7 lg:py-16 bg-white">
      <div className="flex justify-between items-center px-1 md:px-10">
        <div>
          <p className="text-lg md:text-xl font-semibold text-gray-900">Featured repositories</p>
          <p className="text-sm text-gray-600">
            Hand-picked specialized open-source projects
          </p>
        </div>

        <Link to={"/search"} className="text-sm font-semibold text-green-600 hover:text-green-700 flex items-center gap-1.5">
          View All <FontAwesomeIcon icon={faArrowRightLong} />
        </Link>
      </div>

      {loading && data.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-green-600 text-2xl mr-3" />
          <span className="text-gray-600 font-medium">Loading repositories...</span>
        </div>
      ) : error ? (
        <div className="text-center py-16 px-4 bg-red-50 rounded-xl border border-red-100 my-8 max-w-2xl mx-auto">
          <p className="text-red-600 font-semibold mb-2">Failed to load repositories</p>
          <p className="text-xs text-red-500 mb-4">{error}</p>
          <button onClick={refetch} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition">
            Try Again
          </button>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-16 px-4 bg-gray-50 rounded-xl border border-gray-200 my-8 max-w-2xl mx-auto">
          <FontAwesomeIcon icon={faFolderOpen} className="text-gray-400 text-4xl mb-3" />
          <p className="text-gray-800 font-semibold mb-1">No repositories found</p>
          <p className="text-xs text-gray-500 mb-4">Connect your GitHub account or submit a repo to populate the feed.</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-10">
            {data.map((repo) => (
              <MyReposPageCard key={repo.id} repo={repo} />
            ))}
          </div>
          <div className="flex justify-center mt-10">
            <button
              onClick={refetch}
              disabled={loading}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <FontAwesomeIcon icon={faSpinner} className="animate-spin" />}
              <span>Refresh Repositories</span>
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default MyReposPage;




