import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flag, AlignLeft, Calendar, Tag } from "lucide-react";
import { PRIORITY, LABEL_META } from "../../data/boardData";
import { useAuth } from "../../context/AuthContext";

const LABELS = Object.keys(LABEL_META);
const PRIORITIES = Object.keys(PRIORITY);

export default function AddTaskModal({ defaultColumn, columns, onClose, onAdd, initialDate }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    label: "Engineering",
    dueDate: initialDate || "",
    column: defaultColumn || "todo",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    // Generate initials from current user
    const initials = user?.name 
      ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() 
      : 'U';

    onAdd({
      id: `t${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      label: form.label,
      assignee: { initials, color: "#6366f1" },
      dueDate: form.dueDate || null,
      attachments: 0,
      starred: false,
      createdBy: user?.email || null,
    }, form.column);
    onClose();
  };

  const inputCls = "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-slate-900 dark:text-white text-sm placeholder:text-slate-500 dark:placeholder:text-slate-600 transition-all";
  const labelCls = "text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5";

  return (
    <AnimatePresence>
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
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 w-full max-w-lg shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-7">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">New Task</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
            >
              <X size={15} className="text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className={labelCls}><AlignLeft size={12} /> Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="What needs to be done?"
                className={inputCls}
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}><AlignLeft size={12} /> Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Add more context..."
                rows={3}
                className={inputCls + " resize-none"}
              />
            </div>

            {/* Priority & Label row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}><Flag size={12} /> Priority</label>
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
                <label className={labelCls}><Tag size={12} /> Label</label>
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

            {/* Column & Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}><Tag size={12} /> Column</label>
                <select
                  value={form.column}
                  onChange={(e) => setForm({ ...form, column: e.target.value })}
                  className={inputCls + " cursor-pointer"}
                >
                  {Object.keys(columns).map((id) => (
                    <option key={id} value={id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {columns[id].meta.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}><Calendar size={12} /> Due Date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className={inputCls + " cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
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
                Create Task
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
