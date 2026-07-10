import React, { useState, useRef } from "react";
import { Search, Filter, Bell, Sun, Moon, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationsContext";
import InvitationNotificationCard from "./InvitationNotificationCard";

const PRIORITY_OPTIONS = [
  { value: "all", label: "All Priorities", color: null },
  { value: "urgent", label: "Urgent", color: "#ef4444" },
  { value: "high", label: "High", color: "#f97316" },
  { value: "medium", label: "Medium", color: "#eab308" },
  { value: "low", label: "Low", color: "#22c55e" },
];

function formatTime(timestamp) {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return "just now";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function BoardHeader({
  onNewTask,
  search,
  setSearch,
  filterPriority,
  setFilterPriority,
  totalTasks,
  boardName,
  theme,
  setTheme,
  activeNav
}) {
  const navigate = useNavigate();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    setClickedNotification,
    respondToInvitation,
  } = useNotifications();

  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  /* close dropdown on outside click */
  React.useEffect(() => {
    function handle(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  /* close notifications on outside click */
  React.useEffect(() => {
    function handle(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotifClick = (notif) => {
    markAsRead(notif.id);
    setNotifOpen(false);

    if (notif.taskId && notif.boardName && notif.colId) {
      setClickedNotification({
        taskId: notif.taskId,
        boardName: notif.boardName,
        colId: notif.colId
      });
      if (activeNav !== "board") {
        navigate("/board", { state: { activeNav: "board" } });
      }
    } else if (notif.boardName) {
      setClickedNotification({
        boardName: notif.boardName
      });
      if (activeNav !== "board") {
        navigate("/board", { state: { activeNav: "board" } });
      }
    }
  };

  const activeFilter = PRIORITY_OPTIONS.find(
    (o) => (filterPriority === "" ? o.value === "all" : o.value === filterPriority)
  );

  const isBoardView = activeNav === "board";

  return (
    <header className="h-[73px] flex items-center gap-4 px-8 border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm sticky top-0 z-10 transition-colors">
      <div className="flex-1 flex flex-col justify-center">
        <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{boardName}</h1>
        {isBoardView && <p className="text-xs text-slate-500 font-medium">Kanban Board · {totalTasks} tasks</p>}
      </div>

      {isBoardView && (
        <>
          {/* Search */}
          <div className="relative hidden md:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 w-52 transition-all"
            />
          </div>
          {/* Priority Filter */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${filterPriority
                ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10"
                : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600"
                }`}
            >
              <Filter size={13} />
              {activeFilter?.label ?? "Filter"}
              {filterPriority && (
                <span
                  className="ml-1 text-[9px] bg-blue-500 text-white rounded-full px-1.5 py-0.5 font-black"
                >
                  {totalTasks}
                </span>
              )}
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl shadow-black/10 z-50 overflow-hidden">
                {PRIORITY_OPTIONS.map((opt) => {
                  const isActive =
                    opt.value === "all" ? filterPriority === "" : filterPriority === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setFilterPriority(opt.value === "all" ? "" : opt.value);
                        setFilterOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold transition-colors ${isActive
                        ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                    >
                      {opt.color ? (
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: opt.color }}
                        />
                      ) : (
                        <span className="w-2 h-2 rounded-full flex-shrink-0 border border-slate-300 dark:border-slate-600" />
                      )}
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      

      {/* Theme Toggle */}
      <button
        onClick={setTheme}
        className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-all ml-auto"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
      </button>
      {/* Bell Notification Icon & Dropdown */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setNotifOpen((v) => !v)}
          className="relative w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors focus:outline-none"
          aria-label="Notifications"
        >
          <Bell size={16} className="text-slate-500 dark:text-slate-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[16px] h-4 rounded-full bg-blue-500 text-white text-[9px] font-black flex items-center justify-center border border-white dark:border-slate-800 animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[480px]">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
              <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                Notifications
              </span>
              <div className="flex gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-[10px] text-slate-500 dark:text-slate-400 font-bold hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 max-h-[350px]">
              {notifications.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                    <Bell size={18} className="text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">All caught up!</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">No new notifications.</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  // ── Invitation notifications get the interactive card ──
                  if (notif.invitationType === 'invite') {
                    return (
                      <InvitationNotificationCard
                        key={notif.id}
                        notif={notif}
                        onRespond={async (invitationId, action) => {
                          markAsRead(notif.id);
                          return await respondToInvitation(invitationId, action);
                        }}
                        onDelete={deleteNotification}
                      />
                    );
                  }

                  // ── Regular notifications ──
                  const typeColor =
                    notif.type === "error"
                      ? "text-red-500 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20"
                      : notif.type === "warning"
                      ? "text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20"
                      : notif.type === "success"
                      ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20"
                      : "text-blue-500 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20";

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={`px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors relative group ${
                        !notif.read ? "bg-blue-50/10 dark:bg-blue-500/5" : ""
                      }`}
                    >
                      {/* Indicator Icon */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${typeColor}`}>
                        <Bell size={13} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className={`text-xs text-slate-800 dark:text-slate-200 truncate ${!notif.read ? "font-black text-slate-900 dark:text-white" : "font-semibold"}`}>
                            {notif.title}
                          </p>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 shrink-0 mt-0.5">
                            {formatTime(notif.timestamp)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>

                      {/* Right actions (unread dot & clear) */}
                      <div className="flex flex-col justify-between items-end shrink-0 min-h-[32px]">
                        {!notif.read ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        ) : (
                          <div className="w-1.5 h-1.5" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 mt-1"
                          title="Remove notification"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
