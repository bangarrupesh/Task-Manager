import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import TaskCard from "./TaskCard";

export default function KanbanColumn({
  colId, meta, tasks,
  dragOverCol, onDragStart, onDragOver, onDrop, onDragLeave,
  onAddTask, onToggleStar,
  draggedTaskId,
  onEditColumn,
  onDeleteColumn,
  currentUser,
  onEditTask,
  onDeleteTask,
  onViewTask,
}) {
  const isOver = dragOverCol === colId;

  /* ── column menu state ─────────────────────────── */
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  return (
    <div
      className="flex-shrink-0 w-[290px] flex flex-col rounded-2xl overflow-hidden
        bg-white dark:bg-transparent
        border border-slate-200/80 dark:border-transparent
        shadow-[0_2px_8px_0_rgba(15,23,42,0.06),0_8px_24px_0_rgba(15,23,42,0.04),0_1px_2px_0_rgba(15,23,42,0.08)]
        dark:shadow-none
        transition-all duration-200"
      style={{ borderTop: `3px solid ${meta.accent}` }}
      onDragOver={(e) => onDragOver(e, colId)}
      onDrop={(e) => onDrop(e, colId)}
      onDragLeave={onDragLeave}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-0 px-4 pt-4 pb-3
        border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: meta.accent, boxShadow: `0 0 6px ${meta.accent}` }}
          />
          <span className="text-sm font-black text-slate-900 dark:text-slate-200 tracking-tight">
            {meta.title}
          </span>
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: `${meta.accent}18`,
              color: meta.accent,
            }}
          >
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAddTask(colId)}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <Plus size={15} className="text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white" />
          </button>

          {/* ⋮ menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
            >
              <MoreHorizontal size={15} className="text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white" />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1.5 w-44 z-50
                    bg-white dark:bg-slate-900
                    border border-slate-200 dark:border-slate-700
                    rounded-xl shadow-xl shadow-black/10 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEditColumn(colId);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold
                      text-slate-600 dark:text-slate-300
                      hover:bg-slate-100 dark:hover:bg-slate-800
                      transition-colors"
                  >
                    <Pencil size={13} className="text-slate-400" />
                    Edit column name
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDeleteColumn(colId);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold
                      text-red-500 dark:text-red-400
                      hover:bg-red-50 dark:hover:bg-red-500/10
                      transition-colors"
                  >
                    <Trash2 size={13} />
                    Delete column
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Drop zone */}
      <div
        className={`flex-1 flex flex-col gap-3 p-3 min-h-[200px] transition-all duration-200 rounded-b-2xl ${isOver ? 'bg-transparent' : 'bg-slate-50/80 dark:bg-slate-900/40'}`}
        style={isOver ? { background: `${meta.accent}0a` } : {}}
      >
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              sourceCol={colId}
              onDragStart={onDragStart}
              isDragging={draggedTaskId === task.id}
              onToggleStar={onToggleStar}
              currentUser={currentUser}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onViewTask={onViewTask}
            />
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {tasks.length === 0 && !isOver && (
          <div className="flex-1 flex flex-col items-center justify-center py-8 text-slate-600">
            <div
              className="w-10 h-10 rounded-xl border-2 border-dashed mb-3 flex items-center justify-center"
              style={{ borderColor: meta.accent + "40" }}
            >
              <Plus size={18} style={{ color: meta.accent + "80" }} />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider">Drop tasks here</p>
          </div>
        )}

        {/* Add task button */}
        <button
          onClick={() => onAddTask(colId)}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 dark:hover:text-slate-300 dark:hover:bg-slate-800/60 transition-all text-xs font-bold group mt-1"
        >
          <span
            className="w-5 h-5 rounded-md flex items-center justify-center group-hover:bg-slate-300 dark:group-hover:bg-slate-700 transition-colors"
          >
            <Plus size={13} />
          </span>
          Add task
        </button>
      </div>
    </div>
  );
}
