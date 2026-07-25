import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className=" px-6 py-16 bg-white flex justify-center">
      <div className="max-w-6xl text-center">

        {/* Badge */}
        <p className="inline-flex items-center gap-2 bg-gray-100 px-5 py-2 rounded-full text-sm font-medium text-gray-700">
          <FontAwesomeIcon icon={faWandMagicSparkles} />
          Curated for developers who want depth, not noise
        </p>

        {/* Heading */}
        <h1 className="mt-8 text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-black leading-tight">
          Specialized GitHub repositories.
        </h1>

        <h2 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-gray-500 leading-tight">
          Discover what each one really does.
        </h2>

        {/* Paragraph */}
        <p className="mt-8 text-sm md:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
          RepoSpec is a directory of focused, high-signal open-source projects.
          Every repo lists the exact features it provides — no fluff.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to={"/search"}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Browse Repos
          </Link>

          <Link
            to={"/repo-detail"}
            className="px-6 py-3 border border-gray-400 rounded-lg hover:bg-gray-50 transition"
          >
            Submit a Repo
          </Link>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;