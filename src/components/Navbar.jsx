import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkBase =
  "px-3 py-2 rounded-lg text-sm font-medium transition";
const linkInactive = "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50";
const linkActive = "text-indigo-600 bg-indigo-50";

export default function Navbar() {
  const { logout, user } = useAuth();

  return (
    <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white grid place-items-center font-bold">
            F
          </div>
          <span className="font-semibold text-gray-900 hidden sm:inline">FinanceTracker</span>
        </div>

        <div className="flex items-center gap-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/transactions"
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
          >
            Transactions
          </NavLink>
          <NavLink
            to="/budgets"
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
          >
            Budgets
          </NavLink>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-sm text-gray-500 truncate max-w-[160px]">
            {user?.email}
          </span>
          <button
            onClick={logout}
            className="px-3 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}
