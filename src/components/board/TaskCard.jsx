import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Paperclip, MoreHorizontal, Pencil, Trash2, Lock } from "lucide-react";
import { PRIORITY, LABEL_META } from "../../data/boardData";

export default function TaskCard({
  task, sourceCol, onDragStart, isDragging, onToggleStar,
  currentUser, onEditTask, onDeleteTask, onViewTask
}) {
  const pri = PRIORITY[task.priority];
  const lbl = LABEL_META[task.label] || { text: "#94a3b8", bg: "rgba(148,163,184,0.15)" };

  /* ── ownership check ─────────────────────────── */
  const isOwner = task.createdBy && currentUser?.email
    ? task.createdBy === currentUser.email
    : false;

  /* ── ⋮ menu state ────────────────────────────── */
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isDragging ? 0.4 : 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      draggable
      onDragStart={(e) => onDragStart(e, task.id, sourceCol)}
      onClick={() => onViewTask && onViewTask(task, sourceCol)}
      className="group relative bg-white dark:bg-slate-800/70 rounded-xl p-4 cursor-pointer select-none transition-all duration-200
        border border-slate-200/90 dark:border-slate-700/50
        shadow-[0_1px_3px_0_rgba(15,23,42,0.06),0_4px_12px_0_rgba(15,23,42,0.05)]
        dark:shadow-none
        hover:shadow-[0_4px_16px_0_rgba(15,23,42,0.10),0_1px_4px_0_rgba(15,23,42,0.08)]
        dark:hover:shadow-black/20
        hover:-translate-y-0.5
        dark:hover:border-slate-600 dark:hover:bg-slate-800"
      style={{ borderLeft: `3px solid ${pri.color}` }}
    >
      {/* Top row: label + star + menu */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
          style={{ color: lbl.text, background: lbl.bg }}
        >
          {task.label}
        </span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Star */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleStar(task.id, sourceCol); }}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Star
              size={13}
              className={task.starred ? "fill-amber-400 text-amber-400" : "text-slate-500"}
            />
          </button>

          {/* ⋮ menu — only rendered if task has a createdBy */}
          {task.createdBy !== undefined && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <MoreHorizontal size={13} className="text-slate-500" />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-1.5 z-50 w-48
                      bg-white dark:bg-slate-900
                      border border-slate-200 dark:border-slate-700
                      rounded-xl shadow-xl shadow-black/10 overflow-hidden"
                  >
                    {isOwner ? (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEditTask(task, sourceCol); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold
                            text-slate-600 dark:text-slate-300
                            hover:bg-slate-100 dark:hover:bg-slate-800
                            transition-colors"
                        >
                          <Pencil size={13} className="text-slate-400" />
                          Edit task
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDeleteTask(task, sourceCol); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold
                            text-red-500 dark:text-red-400
                            hover:bg-red-50 dark:hover:bg-red-500/10
                            transition-colors"
                        >
                          <Trash2 size={13} />
                          Delete task
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2.5 px-4 py-3 text-xs text-slate-400 dark:text-slate-500">
                        <Lock size={12} className="flex-shrink-0" />
                        <span className="font-medium leading-tight">
                          Only the task owner can edit or delete this task.
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Always-visible star when starred & not hovering */}
        {task.starred && (
          <Star size={13} className="fill-amber-400 text-amber-400 group-hover:hidden" />
        )}
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug mb-2 line-clamp-2">
        {task.title}
      </h4>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Priority badge */}
      <div className="flex items-center gap-1 mb-4">
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1"
          style={{ color: pri.color, background: pri.bg }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ background: pri.color }}
          />
          {pri.label}
        </span>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-slate-500">

          {task.attachments > 0 && (
            <span className="flex items-center gap-1 text-[11px]">
              <Paperclip size={12} />
              {task.attachments}
            </span>
          )}
          {task.dueDate && (
            <span className="text-[11px]">{task.dueDate}</span>
          )}
        </div>

        {/* Assignee avatar */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-md ring-2 ring-white dark:ring-slate-900"
          style={{ background: task.assignee.color }}
        >
          {task.assignee.initials}
        </div>
      </div>
    </motion.div>
  );
}
