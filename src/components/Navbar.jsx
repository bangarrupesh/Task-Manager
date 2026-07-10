import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Layout, Sun, Moon } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";

export default function Navbar() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <nav className="flex items-center justify-between px-6 py-6 md:px-12 bg-white dark:bg-slate-900">
      <div className="flex items-center gap-2 group cursor-pointer">
        <div className="bg-blue-700 p-2 rounded-lg group-hover:rotate-12 transition-transform text-white">
          <Layout size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">TaskFlow</span>
      </div>

      <div className="flex items-center gap-4">
        <button
          aria-label="Toggle theme"
          onClick={toggleTheme}
          className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <Link to="/signin" className="text-sm font-medium hover:text-accent transition-colors text-slate-700 dark:text-slate-200">Sign in</Link>

        <Link to="/signup" className="bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-blue-700 transition-all hover:shadow-lg active:scale-95 shadow-md shadow-blue-200">
          Sign up
        </Link>
      </div>
    </nav>
  );
}
