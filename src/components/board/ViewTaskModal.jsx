import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Flag, Tag, AlignLeft, User, MessageSquare, Paperclip, CheckSquare } from "lucide-react";
import { PRIORITY, LABEL_META } from "../../data/boardData";

export default function ViewTaskModal({ isOpen, onClose, task, columnName }) {
  if (!task) return null;

  const pri = PRIORITY[task.priority] || PRIORITY.medium;
  const lbl = LABEL_META[task.label] || { text: "#94a3b8", bg: "rgba(148,163,184,0.15)" };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-500/30 dark:bg-slate-950/80 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col gap-2 pr-4">
                <div className="flex items-center gap-3">
                  <span
                    className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md"
                    style={{ color: lbl.text, background: lbl.bg }}
                  >
                    {task.label}
                  </span>
                  {columnName && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {columnName}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                  {task.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 shrink-0 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
              >
                <X size={16} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 overflow-y-auto no-scrollbar flex flex-col gap-8">
              {/* Top Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2 text-slate-400">
                    <Flag size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Priority</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: pri.color }} />
                    <span className="text-sm font-black text-slate-900 dark:text-white" style={{ color: pri.color }}>
                      {pri.label}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2 text-slate-400">
                    <Calendar size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Due Date</span>
                  </div>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {task.dueDate || "No date"}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2 text-slate-400">
                    <User size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Assignee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-sm"
                      style={{ background: task.assignee?.color || '#6366f1' }}
                    >
                      {task.assignee?.initials || 'U'}
                    </div>
                    <span className="text-sm font-black text-slate-900 dark:text-white truncate">
                      {task.createdBy || (task.assignee?.initials ? "Assigned" : "Unassigned")}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hidden sm:block">
                  <div className="flex items-center gap-2 mb-2 text-slate-400">
                    <CheckSquare size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Starred</span>
                  </div>
                  <span className={`text-sm font-black ${task.starred ? "text-amber-500" : "text-slate-500"}`}>
                    {task.starred ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              {/* Description Content */}
              <div>
                <div className="flex items-center gap-2 mb-4 text-slate-600 dark:text-slate-400">
                  <AlignLeft size={16} />
                  <h3 className="text-xs font-black uppercase tracking-wider">Description</h3>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 min-h-[100px]">
                  {task.description ? (
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {task.description}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                      No description provided for this task.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
