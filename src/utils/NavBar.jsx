import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCodeBranch,
  faHome,
  faChartBar,
  faCompass,
  faBook,
  faUsers,
  faMagnifyingGlassChart,
  faFileAlt,
  faHeadset,
  faSignOutAlt,
  faSignInAlt,
  faUserPlus,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const TOP_NAV = [
  { icon: faHome,     label: "Home",      href: "/" },
  { icon: faChartBar, label: "Analytics", href: "/analytics" },
  { icon: faCompass,  label: "Discovery", href: "/search" },
  { icon: faBook,     label: "My Repos",  href: "/my-repos" },
  { icon: faUsers,    label: "Community", href: "/community" },
];

const BOTTOM_NAV = [
  { icon: faMagnifyingGlassChart, label: "Analyze Repo", href: "/analyze" },
  { icon: faFileAlt,              label: "Docs",          href: "/docs" },
  { icon: faHeadset,              label: "Support",       href: "/support" },
];

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (href) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  return (
    <aside className="w-52 flex-shrink-0 h-screen bg-white border-r border-slate-100 flex flex-col justify-between py-4 px-2 shadow-sm sticky top-0 z-20">

      {/* ── Logo ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 mb-2 font-bold text-slate-900 text-sm no-underline"
        >
          <div className="w-7 h-7 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
            <FontAwesomeIcon icon={faCodeBranch} className="text-white text-xs" />
          </div>
          RepoSpec
        </Link>

        <div className="h-px bg-slate-100 mx-1 mb-2" />

        {/* ── Top nav items ──────────────────────────────────── */}
        {TOP_NAV.map(({ icon, label, href }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              to={href}
              className={[
                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all no-underline",
                active
                  ? "bg-green-50 text-green-700 font-semibold"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium",
              ].join(" ")}
            >
              <FontAwesomeIcon icon={icon} className="w-3.5 flex-shrink-0" />
              {label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </div>

      {/* ── Bottom section ─────────────────────────────────── */}
      <div className="flex flex-col gap-1">

        {/* Bottom nav items */}
        {BOTTOM_NAV.map(({ icon, label, href, accent }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              to={href}
              className={[
                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all no-underline",
                accent
                  ? "bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-200"
                  : active
                    ? "bg-green-50 text-green-700"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50",
              ].join(" ")}
            >
              <FontAwesomeIcon icon={icon} className="w-3.5 flex-shrink-0" />
              {label}
            </Link>
          );
        })}

        <div className="h-px bg-slate-100 mx-1 my-2" />

        {/* ── Auth section ───────────────────────────────────── */}
        {user ? (
          /* Logged-in: show user chip + logout */
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon={faUser} className="text-white text-[9px]" />
              </div>
              <span className="text-xs font-semibold text-slate-700 truncate">
                {user.username}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer border-0 bg-transparent w-full text-left"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="w-3.5 flex-shrink-0" />
              Logout
            </button>
          </div>
        ) : (
          /* Logged-out: show Login + Register */
          <div className="flex flex-col gap-1">
            <Link
              to="/login"
              className={[
                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all no-underline",
                isActive("/login")
                  ? "bg-green-50 text-green-700 font-semibold"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50",
              ].join(" ")}
            >
              <FontAwesomeIcon icon={faSignInAlt} className="w-3.5 flex-shrink-0" />
              Login
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-all no-underline shadow-sm shadow-green-200"
            >
              <FontAwesomeIcon icon={faUserPlus} className="w-3.5 flex-shrink-0" />
              Register
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};

export default NavBar;