import React, { useState } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, CheckSquare, Calendar, BarChart2,
  Users, Settings, LogOut, Plus, ChevronDown, Layout, Star, Hash,
  Pencil, Trash2
} from "lucide-react";

const NAV = [
  { icon: LayoutDashboard, label: "Board", id: "board" },
  { icon: CheckSquare, label: "My Tasks", id: "tasks" },
  { icon: Calendar, label: "Calendar", id: "calendar" },
  { icon: BarChart2, label: "Analytics", id: "analytics" },
  { icon: Users, label: "Team", id: "team" },
];

export default function Sidebar({
  activeNav,
  setActiveNav,
  user,
  onLogout,
  boards = [],
  onNewBoard,
  selectedBoard = {},
  onSelectBoard,
  onToggleStarBoard,
  onEditBoard,
  onDeleteBoard
}) {
  const [isBoardsExpanded, setIsBoardsExpanded] = useState(true);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false);
  const favoriteBoards = boards.filter(b => b.starred);

  return (
    <motion.aside
      animate={{ width: isNavHidden ? 80 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex-shrink-0 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0 overflow-hidden"
    >
      {/* Logo */}
      <div
        onClick={() => setIsNavHidden(!isNavHidden)}
        className={`h-[73px] border-b border-slate-200 dark:border-slate-800 cursor-pointer select-none transition-all flex items-center ${isNavHidden ? 'px-0 justify-center' : 'px-5'}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 flex-shrink-0">
            <Layout size={16} className="text-white" />
          </div>
          {!isNavHidden && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="flex items-center gap-2.5 overflow-hidden whitespace-nowrap"
            >
              <span className="text-slate-900 dark:text-white font-black tracking-tight text-lg">TaskFlow</span>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!isNavHidden && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col min-h-0 whitespace-nowrap overflow-hidden"
          >
            {/* Nav */}
            <nav className="px-3 flex-1 overflow-y-auto no-scrollbar scroll-smooth">
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-3 mb-2 mt-3">Main</p>
              {NAV.map(({ icon: Icon, label, id }) => (
                <button
                  key={id}
                  onClick={() => setActiveNav(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold mb-1 transition-all ${activeNav === id
                    ? "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-600/15 dark:text-blue-400 dark:border-blue-500/20"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                    }`}
                >
                  <Icon size={16} />
                  {label}
                  {activeNav === id && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </button>
              ))}

              {/* Favorites Section */}
              {favoriteBoards.length > 0 && (
                <div className="mb-4">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-3 mb-2 mt-5">Favorites</p>
                  {favoriteBoards.map((b) => (
                    <button
                      key={`fav-${b.name}`}
                      onClick={() => onSelectBoard && onSelectBoard(b)}
                      className={`w-full group flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold mb-1 transition-all ${selectedBoard?.name === b.name
                        ? "text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-600/15 border border-blue-200 dark:border-blue-500/20"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                        }`}
                    >
                      <Hash size={13} style={{ color: b.color }} />
                      <span className="flex-1 text-left truncate">{b.name}</span>
                      <span className="flex items-center gap-0.5 ml-auto">
                        <span
                          onClick={(e) => { e.stopPropagation(); onEditBoard && onEditBoard(b); }}
                          className="w-5 h-5 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all"
                          title="Edit board"
                        >
                          <Pencil size={10} className="text-slate-400 hover:text-blue-500" />
                        </span>
                        <span
                          onClick={(e) => { e.stopPropagation(); onDeleteBoard && onDeleteBoard(b); }}
                          className="w-5 h-5 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
                          title="Delete board"
                        >
                          <Trash2 size={10} className="text-slate-400 hover:text-red-500" />
                        </span>
                        <Star
                          size={11}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleStarBoard && onToggleStarBoard(b.name);
                          }}
                          className="fill-amber-400 text-amber-400 opacity-100 transition-opacity ml-0.5"
                        />
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* My boards */}
              <div className="flex items-center justify-between px-3 mb-1 mt-5">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Boards</p>
                <button
                  onClick={() => setIsBoardsExpanded(!isBoardsExpanded)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <motion.div
                    animate={{ rotate: isBoardsExpanded ? 0 : -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={12} />
                  </motion.div>
                </button>
              </div>

              <AnimatePresence initial={false}>
                {isBoardsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-y-auto no-scrollbar scroll-smooth max-h-[40vh]"
                  >
                    {boards.map((b) => (
                      <button
                        key={b.name}
                        onClick={() => onSelectBoard && onSelectBoard(b)}
                        className={`w-full group flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold mb-1 transition-all ${selectedBoard?.name === b.name
                          ? "text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-600/15 border border-blue-200 dark:border-blue-500/20"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                          }`}
                      >
                        <Hash size={13} style={{ color: b.color }} />
                        <span className="flex-1 text-left truncate">{b.name}</span>
                        <span className="flex items-center gap-0.5 ml-auto">
                          <span
                            onClick={(e) => { e.stopPropagation(); onEditBoard && onEditBoard(b); }}
                            className="w-5 h-5 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all"
                            title="Edit board"
                          >
                            <Pencil size={10} className="text-slate-400 hover:text-blue-500" />
                          </span>
                          <span
                            onClick={(e) => { e.stopPropagation(); onDeleteBoard && onDeleteBoard(b); }}
                            className="w-5 h-5 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
                            title="Delete board"
                          >
                            <Trash2 size={10} className="text-slate-400 hover:text-red-500" />
                          </span>
                          <Star
                            size={11}
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleStarBoard && onToggleStarBoard(b.name);
                            }}
                            className={`transition-all ml-0.5 ${b.starred
                              ? "fill-amber-400 text-amber-400 opacity-100"
                              : "text-slate-400 opacity-0 group-hover:opacity-100 hover:text-amber-400"
                              }`}
                          />
                        </span>
                      </button>
                    ))}
                    {/* New Board button */}
                    <button
                      onClick={onNewBoard}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold mb-1 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all border border-dashed border-blue-200 dark:border-blue-500/20 mt-1"
                    >
                      <Plus size={13} />
                      New Board
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </nav>

            <div className="border-t border-slate-200 dark:border-slate-800 p-3 space-y-1">
              <button
                onClick={() => setActiveNav("settings")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${activeNav === "settings"
                  ? "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-600/15 dark:text-blue-400 dark:border-blue-500/20"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                  }`}
              >
                <Settings size={15} />
                Settings
              </button>
              <button
                onClick={() => setSignOutConfirmOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-100 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-all"
              >
                <LogOut size={15} />
                Sign out
              </button>
              {/* User */}
              <div className="flex items-center gap-2.5 px-3 pt-2 mt-1 border-t border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-[11px] font-black text-white overflow-hidden flex-shrink-0">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="User avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.name ? user.name[0].toUpperCase() : "U"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name || "User"}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.email || ""}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <SignOutModal
        isOpen={signOutConfirmOpen}
        onClose={() => setSignOutConfirmOpen(false)}
        onConfirm={() => {
          setSignOutConfirmOpen(false);
          onLogout();
        }}
      />
    </motion.aside>
  );
}

/* ── SignOutModal ────────────────────────────────────────── */
function SignOutModal({ isOpen, onClose, onConfirm }) {
  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl w-full max-w-sm shadow-2xl shadow-black/20 overflow-hidden"
          >
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-600" />
            <div className="p-7">
              <div className="flex items-start gap-4 mb-5">
                <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center">
                  <LogOut size={20} className="text-blue-500" />
                </div>
                <div className="flex-1 pt-0.5">
                  <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Sign Out</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Are you sure you want to log out?</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 rounded-2xl px-4 py-3.5 mb-6">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  You will need to enter your credentials again to access your project boards, tasks, and team settings.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.97] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 py-3 rounded-xl text-sm font-black text-white bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 shadow-lg shadow-blue-600/30 active:scale-[0.97] transition-all"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
