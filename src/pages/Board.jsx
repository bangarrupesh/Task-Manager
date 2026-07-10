import React, { useState, useRef, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, CheckSquare, Calendar, BarChart2,
  Users, Settings, LogOut, Plus, Search, Bell,
  Filter, Layout, Hash, Zap, Star,
  Sun, Moon, X, ChevronDown, Trash2, Pencil,
  Flag, Tag, AlignLeft
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { SEED_DATA, COL_META, PRIORITY, LABEL_META } from "../data/boardData";
import KanbanColumn from "../components/board/KanbanColumn";
import AddTaskModal from "../components/board/AddTaskModal";
import AddColumnModal from "../components/board/AddColumnModal";
import CalendarView from "../components/CalendarView";
import AnalyticsView from "../components/AnalyticsView";
import TeamView from "../components/TeamView";
import MyTasksView from "../components/MyTasksView";
import SettingsView from "../components/SettingsView";
import ViewTaskModal from "../components/board/ViewTaskModal";
import Sidebar from "../components/Sidebar";
import BoardHeader from "../components/BoardHeader";
import { useNotifications } from "../context/NotificationsContext";

/* ── helpers ──────────────────────────────────────────────── */
function buildColumns(seed) {
  const out = {};
  for (const id of seed.columnOrder) {
    out[id] = { id, meta: COL_META[id], tasks: [...seed.columns[id].tasks] };
  }
  return out;
}

function buildEmptyColumns() {
  const out = {};
  const order = ["todo", "inprogress", "inreview", "done"];
  for (const id of order) {
    if (!COL_META[id]) {
      out[id] = { id, meta: { title: id.charAt(0).toUpperCase() + id.slice(1), accent: "#94a3b8" }, tasks: [] };
    } else {
      out[id] = { id, meta: COL_META[id], tasks: [] };
    }
  }
  return out;
}



/* ── Color palette for new boards ───────────────────────── */
const BOARD_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#10b981", "#06b6d4", "#3b82f6",
];

/* ── EditBoardModal ─────────────────────────────────────── */
function EditBoardModal({ isOpen, onClose, board, onSave }) {
  const [name, setName] = React.useState(board?.name || "");
  const [desc, setDesc] = React.useState(board?.description || "");
  const [color, setColor] = React.useState(board?.color || BOARD_COLORS[0]);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (board) {
      setName(board.name || "");
      setDesc(board.description || "");
      setColor(board.color || BOARD_COLORS[0]);
      setError("");
    }
  }, [board]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) { setError("Board name is required."); return; }
    onSave({ ...board, name: name.trim(), description: desc.trim(), color });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md"
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 12 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center">
                  <Pencil size={16} className="text-blue-500" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">Edit Board</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Rename or recolor this board</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Board Name <span className="text-red-500">*</span></label>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  placeholder="e.g. Product Roadmap"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                />
                {error && <p className="text-[11px] text-red-500 mt-1.5 font-medium">{error}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description <span className="text-slate-400 font-normal">(optional)</span></label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="What is this board for?"
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Board Color</label>
                <div className="flex gap-2 flex-wrap">
                  {BOARD_COLORS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setColor(c)}
                      className="w-7 h-7 rounded-lg transition-all border-2 flex items-center justify-center"
                      style={{
                        background: c,
                        borderColor: color === c ? "#1e293b" : "transparent",
                        boxShadow: color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : "none",
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 flex items-center gap-2.5 border border-slate-100 dark:border-slate-700">
                <Hash size={13} style={{ color }} />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                  {name || "Board Preview"}
                </span>
              </div>
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-black transition-all shadow-lg shadow-blue-600/25 active:scale-[0.97]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── DeleteBoardModal ────────────────────────────────────── */
function DeleteBoardModal({ isOpen, onClose, board, onConfirm }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl w-full max-w-sm shadow-2xl shadow-black/20 overflow-hidden"
          >
            <div className="h-1 w-full bg-gradient-to-r from-red-500 to-rose-600" />
            <div className="p-7">
              <div className="flex items-start gap-4 mb-5">
                <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center">
                  <Trash2 size={20} className="text-red-500" />
                </div>
                <div className="flex-1 pt-0.5">
                  <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                    Delete Board
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 rounded-2xl px-4 py-3.5 mb-6">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  You're about to permanently delete the{" "}
                  <span className="font-black text-slate-900 dark:text-white">
                    "{board?.name}"
                  </span>{" "}
                  board along with all its tasks and columns.
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
                  className="flex-1 py-3 rounded-xl text-sm font-black text-white bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 shadow-lg shadow-red-500/30 active:scale-[0.97] transition-all"
                >
                  Delete Board
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── NewBoardModal ───────────────────────────────────────── */
function NewBoardModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [color, setColor] = useState(BOARD_COLORS[0]);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) { setError("Board name is required."); return; }
    onCreate({ name: name.trim(), description: desc.trim(), color, starred: false });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md"
          initial={{ scale: 0.95, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 12 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">New Board</h2>
              <p className="text-xs text-slate-500 mt-0.5">Create a new project board</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            {/* Board Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Board Name <span className="text-red-500">*</span></label>
              <input
                autoFocus
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                placeholder="e.g. Product Roadmap"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
              />
              {error && <p className="text-[11px] text-red-500 mt-1.5 font-medium">{error}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description <span className="text-slate-400 font-normal">(optional)</span></label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="What is this board for?"
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Board Color</label>
              <div className="flex gap-2 flex-wrap">
                {BOARD_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-7 h-7 rounded-lg transition-all border-2 flex items-center justify-center"
                    style={{
                      background: c,
                      borderColor: color === c ? "#1e293b" : "transparent",
                      boxShadow: color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : "none",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 flex items-center gap-2.5 border border-slate-100 dark:border-slate-700">
              <Hash size={13} style={{ color }} />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                {name || "Board Preview"}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-black transition-all shadow-lg shadow-blue-600/25 active:scale-[0.97]"
              >
                Create Board
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── EditColumnModal ─────────────────────────────────────── */

/* ── EditColumnModal ─────────────────────────────────────── */
function EditColumnModal({ isOpen, onClose, currentTitle, onSave }) {
  const [title, setTitle] = React.useState(currentTitle);

  // Sync if the column being edited changes
  React.useEffect(() => { setTitle(currentTitle); }, [currentTitle]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title.trim());
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-500/30 dark:bg-slate-950/80 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 w-full max-w-sm shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Edit Column</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
              >
                <X size={15} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Column Name</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Column name..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-slate-900 dark:text-white text-sm placeholder:text-slate-500 dark:placeholder:text-slate-600 transition-all"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-black transition-all shadow-lg shadow-blue-600/25 active:scale-[0.98]"
                >
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── DeleteColumnModal ───────────────────────────────────── */
function DeleteColumnModal({ isOpen, onClose, columnTitle, taskCount, onConfirm }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl w-full max-w-sm shadow-2xl shadow-black/20 overflow-hidden"
          >
            {/* Red accent top strip */}
            <div className="h-1 w-full bg-gradient-to-r from-red-500 to-rose-600" />

            <div className="p-7">
              {/* Icon + heading */}
              <div className="flex items-start gap-4 mb-5">
                <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center">
                  <Trash2 size={20} className="text-red-500" />
                </div>
                <div className="flex-1 pt-0.5">
                  <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                    Delete Column
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              {/* Confirmation body */}
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 rounded-2xl px-4 py-3.5 mb-6">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  You're about to permanently delete the{" "}
                  <span className="font-black text-slate-900 dark:text-white">
                    "{columnTitle}"
                  </span>{" "}
                  column
                  {taskCount > 0 ? (
                    <>
                      {" "}along with{" "}
                      <span className="font-black text-red-500">
                        {taskCount} {taskCount === 1 ? "task" : "tasks"}
                      </span>{" "}
                      inside it.
                    </>
                  ) : (
                    <>.</>
                  )}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700
                    text-slate-600 dark:text-slate-300 text-sm font-bold
                    hover:bg-slate-100 dark:hover:bg-slate-800
                    active:scale-[0.97] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 py-3 rounded-xl text-sm font-black text-white
                    bg-gradient-to-br from-red-500 to-rose-600
                    hover:from-red-400 hover:to-rose-500
                    shadow-lg shadow-red-500/30
                    active:scale-[0.97] transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── EditTaskModal ────────────────────────────────────────── */
const LABELS = Object.keys(LABEL_META);
const PRIORITIES = Object.keys(PRIORITY);

function EditTaskModal({ isOpen, onClose, task, onSave }) {
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    priority: "medium",
    label: "Engineering",
    dueDate: ""
  });

  React.useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "medium",
        label: task.label || "Engineering",
        dueDate: task.dueDate || ""
      });
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({
      ...task,
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      label: form.label,
      dueDate: form.dueDate || null
    });
    onClose();
  };

  const inputCls = "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-slate-900 dark:text-white text-sm placeholder:text-slate-500 dark:placeholder:text-slate-600 transition-all";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-500/30 dark:bg-slate-950/80 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 w-full max-w-md shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center">
                  <Pencil size={16} className="text-blue-500" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Edit Task</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Update your task details</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
              >
                <X size={15} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><AlignLeft size={12} /> Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Task title..."
                  className={inputCls}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><AlignLeft size={12} /> Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Add more context..."
                  rows={3}
                  className={inputCls + " resize-none"}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Flag size={12} /> Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className={inputCls + " cursor-pointer"}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {PRIORITY[p].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Tag size={12} /> Label</label>
                  <select
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    className={inputCls + " cursor-pointer"}
                  >
                    {LABELS.map((l) => (
                      <option key={l} value={l} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{l}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Calendar size={12} /> Due Date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className={inputCls + " cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-black transition-all shadow-lg shadow-blue-600/25 active:scale-[0.98]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── DeleteTaskModal ─────────────────────────────────────── */
function DeleteTaskModal({ isOpen, onClose, taskTitle, onConfirm }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl w-full max-w-sm shadow-2xl shadow-black/20 overflow-hidden"
          >
            <div className="h-1 w-full bg-gradient-to-r from-red-500 to-rose-600" />
            <div className="p-7">
              <div className="flex items-start gap-4 mb-5">
                <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center">
                  <Trash2 size={20} className="text-red-500" />
                </div>
                <div className="flex-1 pt-0.5">
                  <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Delete Task</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">This action cannot be undone</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 rounded-2xl px-4 py-3.5 mb-6">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  You're about to permanently delete{" "}
                  <span className="font-black text-slate-900 dark:text-white">"{taskTitle}"</span>.
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
                  className="flex-1 py-3 rounded-xl text-sm font-black text-white bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 shadow-lg shadow-red-500/30 active:scale-[0.97] transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN BOARD PAGE
══════════════════════════════════════════════════════════ */
export default function Board() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { addNotification, syncTasks, clickedNotification, setClickedNotification } = useNotifications();

  // Fetch board data from backend on mount or when user/token updates
  React.useEffect(() => {
    if (!token) return;

    const fetchBoardData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/boards`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data.boards) && data.boards.length > 0) {
            setBoards(data.boards);
            if (data.boardTasks) setBoardTasks(data.boardTasks);
            if (data.projectColumnOrders) setProjectColumnOrders(data.projectColumnOrders);
            if (data.selectedBoard) setSelectedBoard(data.selectedBoard);
          }
        }
      } catch (err) {
        console.error("Error fetching board data from server:", err);
      }
    };

    fetchBoardData();
  }, [token]);

  /* ── localStorage persistence key (per user) ─────────────── */
  const boardStorageKey = `taskflow_board_data_${user?.email || "guest"}`;

  const [activeNav, setActiveNav] = useState(location.state?.activeNav || "board");
  const [boards, setBoards] = useState(() => {
    try {
      const saved = localStorage.getItem(boardStorageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (Array.isArray(data.boards) && data.boards.length > 0) return data.boards;
      }
    } catch (e) { /* ignore */ }
    return location.state?.boards || [{ name: "Main Project", color: "#6366f1", starred: false }];
  });
  const [newBoardOpen, setNewBoardOpen] = useState(location.state?.openNewBoardModal || false);
  const [selectedBoard, setSelectedBoard] = useState(() => {
    try {
      const saved = localStorage.getItem(boardStorageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.selectedBoard) return data.selectedBoard;
        if (Array.isArray(data.boards) && data.boards.length > 0) return data.boards[0];
      }
    } catch (e) { /* ignore */ }
    return location.state?.selectedBoard || location.state?.boards?.[0] || { name: "Main Project", color: "#6366f1", starred: false };
  });

  const handleActiveNavChange = (nav) => {
    if (nav === "settings") {
      navigate("/settings", { state: { boards, selectedBoard } });
    } else {
      setActiveNav(nav);
    }
  };
  const handleToggleStarBoard = (boardName) => {
    setBoards((prev) =>
      prev.map((b) =>
        b.name === boardName ? { ...b, starred: !b.starred } : b
      )
    );
  };

  /* ── edit board ─────────────────────────────────────────── */
  const [editBoardOpen, setEditBoardOpen] = useState(false);
  const [editBoardTarget, setEditBoardTarget] = useState(null);

  const handleOpenEditBoard = (board) => {
    setEditBoardTarget(board);
    setEditBoardOpen(true);
  };

  const handleSaveBoard = (updatedBoard) => {
    const oldName = editBoardTarget.name;
    const newName = updatedBoard.name;

    setBoards((prev) =>
      prev.map((b) => (b.name === oldName ? updatedBoard : b))
    );

    // Re-key boardTasks and columnOrders if the name changed
    if (oldName !== newName) {
      setBoardTasks((prev) => {
        const next = { ...prev };
        if (next[oldName]) {
          next[newName] = next[oldName];
          delete next[oldName];
        }
        return next;
      });
      setProjectColumnOrders((prev) => {
        const next = { ...prev };
        if (next[oldName]) {
          next[newName] = next[oldName];
          delete next[oldName];
        }
        return next;
      });
      if (selectedBoard?.name === oldName) {
        setSelectedBoard(updatedBoard);
      }
    } else {
      if (selectedBoard?.name === oldName) {
        setSelectedBoard(updatedBoard);
      }
    }
    addNotification(
      "Board Updated",
      `Project settings for "${newName}" have been updated.`,
      "success"
    );
    setEditBoardTarget(null);
  };

  /* ── delete board ───────────────────────────────────────── */
  const [deleteBoardOpen, setDeleteBoardOpen] = useState(false);
  const [deleteBoardTarget, setDeleteBoardTarget] = useState(null);

  const handleOpenDeleteBoard = (board) => {
    setDeleteBoardTarget(board);
    setDeleteBoardOpen(true);
  };

  const handleConfirmDeleteBoard = () => {
    if (!deleteBoardTarget) return;
    const name = deleteBoardTarget.name;
    setBoards((prev) => {
      const remaining = prev.filter((b) => b.name !== name);
      // If the deleted board was selected, fall back to first remaining
      if (selectedBoard?.name === name) {
        setSelectedBoard(remaining[0] || null);
      }
      return remaining;
    });
    setBoardTasks((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setProjectColumnOrders((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    addNotification(
      "Board Deleted",
      `Project "${name}" was deleted.`,
      "info"
    );
    setDeleteBoardOpen(false);
    setDeleteBoardTarget(null);
  };

  const handleCreateBoard = (board) => {
    setBoards((prev) => [...prev, board]);
    // Initialize blank task data for the new board
    setBoardTasks(prev => ({
      ...prev,
      [board.name]: buildEmptyColumns()
    }));
    setProjectColumnOrders(prev => ({
      ...prev,
      [board.name]: ["todo", "inprogress", "inreview", "done"]
    }));
    addNotification(
      "Board Created",
      `New project "${board.name}" has been created.`,
      "success"
    );
  };



  const [boardTasks, setBoardTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(boardStorageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.boardTasks && Object.keys(data.boardTasks).length > 0) return data.boardTasks;
      }
    } catch (e) { /* ignore */ }
    return { "Main Project": buildColumns(SEED_DATA) };
  });

  const [projectColumnOrders, setProjectColumnOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(boardStorageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.projectColumnOrders && Object.keys(data.projectColumnOrders).length > 0) return data.projectColumnOrders;
      }
    } catch (e) { /* ignore */ }
    return { "Main Project": SEED_DATA.columnOrder };
  });

  /* ── Persist board data to localStorage & server whenever it changes ── */
  React.useEffect(() => {
    // 1. Save to local storage
    try {
      localStorage.setItem(boardStorageKey, JSON.stringify({
        boards,
        boardTasks,
        projectColumnOrders,
        selectedBoard,
      }));
    } catch (e) {
      console.error("Failed to save board data to localStorage", e);
    }

    // 2. Save to server
    if (!token) return;
    const saveToServer = async () => {
      try {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/boards`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            boards,
            boardTasks,
            projectColumnOrders,
            selectedBoard
          })
        });
      } catch (err) {
        console.error("Failed to sync board data to server:", err);
      }
    };

    const timer = setTimeout(saveToServer, 500);
    return () => clearTimeout(timer);
  }, [boards, boardTasks, projectColumnOrders, selectedBoard, token]);

  const currentColumnOrder = selectedBoard ? (projectColumnOrders[selectedBoard.name] || ["todo", "inprogress", "inreview", "done"]) : [];

  const columns = selectedBoard ? (boardTasks[selectedBoard.name] || buildColumns(SEED_DATA)) : {};

  const setColumns = (updater) => {
    if (!selectedBoard) return;
    setBoardTasks(prev => {
      const currentTasks = prev[selectedBoard.name] || buildColumns(SEED_DATA);
      const nextTasks = typeof updater === 'function' ? updater(currentTasks) : updater;
      return {
        ...prev,
        [selectedBoard.name]: nextTasks
      };
    });
  };

  const handleAddColumn = (title, accent) => {
    if (!selectedBoard) return;
    const id = title.toLowerCase().replace(/\s+/g, "");

    // update columns storage
    setColumns(prev => ({
      ...prev,
      [id]: { id, meta: { title, accent }, tasks: [] }
    }));

    // update project-specific order
    setProjectColumnOrders(prev => ({
      ...prev,
      [selectedBoard.name]: [...(prev[selectedBoard.name] || []), id]
    }));
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [modalCol, setModalCol] = useState("todo");
  const [modalDate, setModalDate] = useState("");
  const [addColumnModalOpen, setAddColumnModalOpen] = useState(false);
  const [dragOverCol, setDragOverCol] = useState(null);
  const dragRef = useRef({ taskId: null, sourceCol: null });
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  // Clear filters when switching between views/pages
  React.useEffect(() => {
    setSearch("");
    setFilterPriority("");
  }, [activeNav]);

  // Sync due date notifications when boardTasks change
  React.useEffect(() => {
    if (boardTasks) {
      syncTasks(boardTasks);
    }
  }, [boardTasks]);

  // Handle notification click deep linking
  React.useEffect(() => {
    if (clickedNotification) {
      const { taskId, boardName, colId } = clickedNotification;

      const targetBoard = boards.find((b) => b.name === boardName);
      if (targetBoard) {
        setSelectedBoard(targetBoard);
        setActiveNav("board");

        // Find the task to view
        const targetCols = boardTasks[boardName];
        if (targetCols && targetCols[colId]) {
          const task = targetCols[colId].tasks.find((t) => t.id === taskId);
          if (task) {
            setViewTask({ task, colId });
            setViewTaskModalOpen(true);
          }
        }
      }
      setClickedNotification(null);
    }
  }, [clickedNotification, boards, boardTasks]);

  /* ── view task ─────────────────────────────── */
  const [viewTask, setViewTask] = useState(null);       // { task, colId }
  const [viewTaskModalOpen, setViewTaskModalOpen] = useState(false);

  const handleOpenViewTask = (task, colId) => {
    setViewTask({ task, colId });
    setViewTaskModalOpen(true);
  };

  /* ── edit / delete task ─────────────────────────────── */
  const [editTask, setEditTask] = useState(null);       // { task, colId }
  const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
  const [deleteTask, setDeleteTask] = useState(null);   // { task, colId }
  const [deleteTaskModalOpen, setDeleteTaskModalOpen] = useState(false);

  const handleOpenEditTask = (task, colId) => {
    setEditTask({ task, colId });
    setEditTaskModalOpen(true);
  };

  const handleSaveTask = (updatedTask) => {
    setColumns((prev) => {
      const next = structuredClone(prev);
      const col = next[editTask.colId];
      if (col) {
        const idx = col.tasks.findIndex((t) => t.id === updatedTask.id);
        if (idx !== -1) col.tasks[idx] = updatedTask;
      }
      return next;
    });
    addNotification(
      "Task Updated",
      `"${updatedTask.title}" has been updated.`,
      "success",
      { taskId: updatedTask.id, boardName: selectedBoard?.name, colId: editTask.colId }
    );
    setEditTask(null);
  };

  const handleOpenDeleteTask = (task, colId) => {
    setDeleteTask({ task, colId });
    setDeleteTaskModalOpen(true);
  };

  const handleConfirmDeleteTask = () => {
    if (!deleteTask) return;
    const taskTitle = deleteTask.task.title;
    setColumns((prev) => {
      const next = structuredClone(prev);
      const col = next[deleteTask.colId];
      if (col) col.tasks = col.tasks.filter((t) => t.id !== deleteTask.task.id);
      return next;
    });
    addNotification(
      "Task Deleted",
      `"${taskTitle}" was removed.`,
      "info"
    );
    setDeleteTaskModalOpen(false);
    setDeleteTask(null);
  };

  /* ── edit / delete column ───────────────────────────── */
  const [editColumnId, setEditColumnId] = useState(null);
  const [editColumnModalOpen, setEditColumnModalOpen] = useState(false);

  const handleOpenEditColumn = (colId) => {
    setEditColumnId(colId);
    setEditColumnModalOpen(true);
  };

  const handleSaveColumnName = (newTitle) => {
    setColumns((prev) => {
      const next = structuredClone(prev);
      if (next[editColumnId]) {
        next[editColumnId].meta = { ...next[editColumnId].meta, title: newTitle };
      }
      return next;
    });
    setEditColumnId(null);
  };

  // Delete confirmation state
  const [deleteColumnId, setDeleteColumnId] = useState(null);
  const [deleteColumnModalOpen, setDeleteColumnModalOpen] = useState(false);

  const handleOpenDeleteColumn = (colId) => {
    setDeleteColumnId(colId);
    setDeleteColumnModalOpen(true);
  };

  const handleConfirmDeleteColumn = () => {
    if (!deleteColumnId || !selectedBoard) return;
    // Remove column from tasks map
    setColumns((prev) => {
      const next = { ...prev };
      delete next[deleteColumnId];
      return next;
    });
    // Remove column from order
    setProjectColumnOrders((prev) => ({
      ...prev,
      [selectedBoard.name]: (prev[selectedBoard.name] || []).filter((id) => id !== deleteColumnId),
    }));
    setDeleteColumnModalOpen(false);
    setDeleteColumnId(null);
  };

  /* ── derived: filtered tasks per column ─────────────── */
  const filteredColumns = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const out = {};
    for (const id of currentColumnOrder) {
      let tasks = columns[id]?.tasks || [];
      if (q) {
        tasks = tasks.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            (t.description && t.description.toLowerCase().includes(q)) ||
            (t.label && t.label.toLowerCase().includes(q))
        );
      }
      if (filterPriority) {
        tasks = tasks.filter((t) => t.priority === filterPriority);
      }
      out[id] = { ...columns[id], tasks };
    }
    return out;
  }, [columns, search, filterPriority, selectedBoard]);

  const totalFilteredTasks = React.useMemo(
    () => currentColumnOrder.reduce((acc, id) => acc + (filteredColumns[id]?.tasks?.length || 0), 0),
    [filteredColumns, currentColumnOrder]
  );

  /* redirect if not logged in */
  React.useEffect(() => {
    if (!user) navigate("/signin", { replace: true });
  }, [user, navigate]);

  /* ── drag handlers ──────────────────────────────────── */
  const handleDragStart = (e, taskId, sourceCol) => {
    dragRef.current = { taskId, sourceCol };
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(colId);
  };

  const handleDragLeave = () => setDragOverCol(null);

  const handleDrop = (e, targetCol) => {
    e.preventDefault();
    const { taskId, sourceCol } = dragRef.current;
    setDragOverCol(null);
    setDraggedTaskId(null);
    if (!taskId || sourceCol === targetCol) return;

    const srcColTasks = columns[sourceCol]?.tasks || [];
    const task = srcColTasks.find((t) => t.id === taskId);
    const taskTitle = task ? task.title : "Task";
    const targetColTitle = columns[targetCol]?.meta?.title || targetCol;

    setColumns((prev) => {
      const next = structuredClone(prev);
      const srcTasks = next[sourceCol].tasks;
      const idx = srcTasks.findIndex((t) => t.id === taskId);
      if (idx === -1) return prev;
      const [movedTask] = srcTasks.splice(idx, 1);
      next[targetCol].tasks.push(movedTask);
      return next;
    });
    addNotification(
      "Task Moved",
      `"${taskTitle}" was moved to "${targetColTitle}".`,
      "info",
      { taskId, boardName: selectedBoard?.name, colId: targetCol }
    );
    dragRef.current = { taskId: null, sourceCol: null };
  };

  /* ── add task ───────────────────────────────────────── */
  const openModal = (colId, date = "") => { setModalCol(colId); setModalDate(date); setModalOpen(true); };

  const handleAddTask = (task, colId) => {
    setColumns((prev) => {
      const next = structuredClone(prev);
      next[colId].tasks.push(task);
      return next;
    });
    const colName = columns[colId]?.meta?.title || colId;
    addNotification(
      "Task Created",
      `"${task.title}" has been added to column "${colName}".`,
      "success",
      { taskId: task.id, boardName: selectedBoard?.name, colId }
    );
  };

  /* ── star toggle ───────────────────────────────────── */
  const handleToggleStar = (taskId, colId) => {
    setColumns((prev) => {
      const next = structuredClone(prev);
      const task = next[colId].tasks.find((t) => t.id === taskId);
      if (task) task.starred = !task.starred;
      return next;
    });
  };

  /* ── logout ─────────────────────────────────────────── */
  const handleLogout = () => { logout(); navigate("/"); };

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans transition-colors">
      <Sidebar
        activeNav={activeNav}
        setActiveNav={handleActiveNavChange}
        user={user}
        onLogout={handleLogout}
        boards={boards}
        onNewBoard={() => setNewBoardOpen(true)}
        selectedBoard={selectedBoard}
        onSelectBoard={setSelectedBoard}
        onToggleStarBoard={handleToggleStarBoard}
        onEditBoard={handleOpenEditBoard}
        onDeleteBoard={handleOpenDeleteBoard}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <BoardHeader
          search={search}
          setSearch={setSearch}
          filterPriority={filterPriority}
          setFilterPriority={setFilterPriority}
          totalTasks={totalFilteredTasks}
          boardName={
            activeNav === "board" ? (selectedBoard?.name || "No Board Selected") :
              activeNav === "tasks" ? "My Tasks" :
                activeNav === "calendar" ? "Calendar" :
                  activeNav === "analytics" ? "Project Analytics" :
                    activeNav === "team" ? "Team Management" :
                      activeNav === "settings" ? "Settings" : "TaskFlow"
          }
          theme={theme}
          setTheme={toggleTheme}
          activeNav={activeNav}
          onNewTask={() => openModal("todo")}
        />

        {/* Board area */}
        <main className="flex-1 overflow-x-auto overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {!selectedBoard && activeNav !== "settings" ? (
              <motion.div
                key="no-board"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-100 dark:border-blue-500/20">
                  <LayoutDashboard size={32} className="text-blue-500 animate-pulse" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">No Projects Yet</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
                  Start by creating a new board to manage your columns, track tasks, and collaborate with your team.
                </p>
                <button
                  onClick={() => setNewBoardOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-black transition-all shadow-lg shadow-blue-600/25 active:scale-95 flex items-center gap-2"
                >
                  <Plus size={16} />
                  Create First Board
                </button>
              </motion.div>
            ) : activeNav === "board" ? (
              <motion.div
                key="board-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="flex gap-5 min-h-full pb-6"
                style={{ minWidth: "max-content" }}
              >
                {currentColumnOrder.map((colId) => (
                  <KanbanColumn
                    key={colId}
                    colId={colId}
                    meta={filteredColumns[colId]?.meta}
                    tasks={filteredColumns[colId]?.tasks || []}
                    dragOverCol={dragOverCol}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragLeave={handleDragLeave}
                    onAddTask={openModal}
                    onToggleStar={handleToggleStar}
                    draggedTaskId={draggedTaskId}
                    onEditColumn={handleOpenEditColumn}
                    onDeleteColumn={handleOpenDeleteColumn}
                    currentUser={user}
                    onViewTask={handleOpenViewTask}
                    onEditTask={handleOpenEditTask}
                    onDeleteTask={handleOpenDeleteTask}
                  />
                ))}

                {/* Add column button */}
                <div className="flex-shrink-0 w-[290px]">
                  <button
                    onClick={() => setAddColumnModalOpen(true)}
                    className="w-full h-12 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 flex items-center justify-center gap-2 text-slate-500 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-400 text-sm font-bold transition-all mt-10"
                  >
                    <Plus size={16} />
                    Add Column
                  </button>
                </div>
              </motion.div>
            ) : activeNav === "tasks" ? (
              <motion.div
                key="tasks-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
                className="h-full"
              >
                <MyTasksView
                  columns={columns}
                  user={user}
                  onNewTask={() => openModal("todo")}
                  onEditTask={handleOpenEditTask}
                  onDeleteTask={handleOpenDeleteTask}
                />
              </motion.div>
            ) : activeNav === "calendar" ? (
              <motion.div
                key="calendar-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35 }}
                className="h-full"
              >
                <CalendarView
                  tasks={Object.entries(columns).flatMap(([colId, col]) => col.tasks.map(t => ({ ...t, status: colId })))}
                  user={user}
                  onViewTask={handleOpenViewTask}
                  onEditTask={handleOpenEditTask}
                  onDeleteTask={handleOpenDeleteTask}
                  onNewTaskDate={(date) => openModal("todo", date)}
                />
              </motion.div>
            ) : activeNav === "analytics" ? (
              <motion.div
                key="analytics-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
                className="h-full"
              >
                <AnalyticsView columns={columns} boardName={selectedBoard?.name} />
              </motion.div>
            ) : activeNav === "team" ? (
              <motion.div
                key="team-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35 }}
                className="h-full"
              >
                <TeamView selectedBoard={selectedBoard} />
              </motion.div>
            ) : activeNav === "settings" ? (
              <motion.div
                key="settings-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                className="h-full"
              >
                <SettingsView
                  user={user}
                  theme={theme}
                  toggleTheme={toggleTheme}
                />
              </motion.div>
            ) : (
              <motion.div
                key="other-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-full text-slate-400 font-bold"
              >
                {activeNav.charAt(0).toUpperCase() + activeNav.slice(1)} view coming soon...
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Add Task Modal */}
      {modalOpen && (
        <AddTaskModal
          defaultColumn={modalCol}
          columns={columns}
          initialDate={modalDate}
          onClose={() => { setModalOpen(false); setModalDate(""); }}
          onAdd={handleAddTask}
        />
      )}

      <AddColumnModal
        isOpen={addColumnModalOpen}
        onClose={() => setAddColumnModalOpen(false)}
        onAdd={handleAddColumn}
      />

      <EditColumnModal
        isOpen={editColumnModalOpen}
        onClose={() => { setEditColumnModalOpen(false); setEditColumnId(null); }}
        currentTitle={editColumnId && columns[editColumnId]?.meta?.title || ""}
        onSave={handleSaveColumnName}
      />

      <DeleteColumnModal
        isOpen={deleteColumnModalOpen}
        onClose={() => { setDeleteColumnModalOpen(false); setDeleteColumnId(null); }}
        columnTitle={deleteColumnId && columns[deleteColumnId]?.meta?.title || ""}
        taskCount={deleteColumnId ? (columns[deleteColumnId]?.tasks?.length ?? 0) : 0}
        onConfirm={handleConfirmDeleteColumn}
      />

      <EditTaskModal
        isOpen={editTaskModalOpen}
        onClose={() => { setEditTaskModalOpen(false); setEditTask(null); }}
        task={editTask?.task || null}
        onSave={handleSaveTask}
      />

      <DeleteTaskModal
        isOpen={deleteTaskModalOpen}
        onClose={() => { setDeleteTaskModalOpen(false); setDeleteTask(null); }}
        taskTitle={deleteTask?.task?.title || ""}
        onConfirm={handleConfirmDeleteTask}
      />

      <ViewTaskModal
        isOpen={viewTaskModalOpen}
        onClose={() => { setViewTaskModalOpen(false); setViewTask(null); }}
        task={viewTask?.task || null}
        columnName={viewTask?.colId && columns[viewTask.colId]?.meta?.title}
      />

      {/* New Board Modal */}
      {newBoardOpen && (
        <NewBoardModal
          onClose={() => setNewBoardOpen(false)}
          onCreate={handleCreateBoard}
        />
      )}

      {/* Edit Board Modal */}
      <EditBoardModal
        isOpen={editBoardOpen}
        onClose={() => { setEditBoardOpen(false); setEditBoardTarget(null); }}
        board={editBoardTarget}
        onSave={handleSaveBoard}
      />

      {/* Delete Board Modal */}
      <DeleteBoardModal
        isOpen={deleteBoardOpen}
        onClose={() => { setDeleteBoardOpen(false); setDeleteBoardTarget(null); }}
        board={deleteBoardTarget}
        onConfirm={handleConfirmDeleteBoard}
      />

    </div>
  );
}
