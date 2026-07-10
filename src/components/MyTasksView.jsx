import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Calendar, Clock,
  CheckCircle2, AlertCircle, ArrowUpRight,
  MoreHorizontal, ChevronDown, SortAsc, SortDesc, Plus,
  Pencil, Trash2, Lock
} from 'lucide-react';
import { PRIORITY } from '../data/boardData';

export default function MyTasksView({ columns = {}, user = {}, onNewTask, onEditTask, onDeleteTask }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, completed, overdue
  const [sortBy, setSortBy] = useState('date'); // date, priority
  const [sortOrder, setSortOrder] = useState('asc');

  // Helper to determine if a date is overdue
  const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    try {
      if (dateStr.includes('-')) {
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return parsed < today;
        }
      }
      const year = new Date().getFullYear();
      const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
      const [mStr, dStr] = dateStr.split(' ');
      const dueDate = new Date(year, months[mStr], parseInt(dStr));
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dueDate < today && !dateStr.includes('Done'); // Simplified check
    } catch (e) { return false; }
  };

  const allUserTasks = useMemo(() => {
    const userInitials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'RK';

    // Flatten and filter for user tasks
    const tasks = [];
    Object.entries(columns).forEach(([colId, col]) => {
      col.tasks.forEach(task => {
        if (task.assignee?.initials === userInitials) {
          tasks.push({ ...task, status: colId });
        }
      });
    });

    return tasks;
  }, [columns, user]);

  const filteredTasks = useMemo(() => {
    let result = allUserTasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());

      let matchesStatus = true;
      if (statusFilter === 'completed') matchesStatus = task.status === 'done';
      if (statusFilter === 'pending') matchesStatus = task.status !== 'done';
      if (statusFilter === 'overdue') matchesStatus = isOverdue(task.dueDate) && task.status !== 'done';

      return matchesSearch && matchesStatus;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'priority') {
        const pMap = { urgent: 4, high: 3, medium: 2, low: 1 };
        const diff = pMap[b.priority] - pMap[a.priority];
        return sortOrder === 'asc' ? diff : -diff;
      }
      // Simple date sort (needs better date parsing for real production)
      const dateA = a.dueDate || '';
      const dateB = b.dueDate || '';
      return sortOrder === 'asc'
        ? dateA.localeCompare(dateB)
        : dateB.localeCompare(dateA);
    });

    return result;
  }, [allUserTasks, search, statusFilter, sortBy, sortOrder]);

  const stats = useMemo(() => {
    return {
      total: allUserTasks.length,
      completed: allUserTasks.filter(t => t.status === 'done').length,
      pending: allUserTasks.filter(t => t.status !== 'done').length,
      overdue: allUserTasks.filter(t => isOverdue(t.dueDate) && t.status !== 'done').length,
    };
  }, [allUserTasks]);

  return (
    <div className="flex flex-col h-full space-y-6 overflow-hidden pb-10">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: stats.total, icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center gap-4"
          >
            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 items-center gap-3 w-full">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search your tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
            {['all', 'pending', 'completed', 'overdue'].map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-black capitalize transition-all ${statusFilter === f
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1 shrink-0">
          <div className="flex items-center px-3 border-r border-slate-100 dark:border-slate-800">
            <SortAsc size={14} className="text-slate-400 mr-2" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
            >
              <option value="date" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Date</option>
              <option value="priority" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Priority</option>
            </select>
          </div>
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
          >
            {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
          </button>
        </div>

        <button
          onClick={onNewTask}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all shadow-lg shadow-blue-600/25 active:scale-[0.97]"
        >
          <Plus size={16} />
          New Task
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto no-scrollbar pr-2">
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task, idx) => (
              <TaskRow
                key={task.id}
                task={task}
                idx={idx}
                isOverdue={isOverdue}
                user={user}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
              />
            ))}
          </AnimatePresence>

          {filteredTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-slate-900/50 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 mb-6 scale-125">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">You're all caught up!</h3>
              <p className="text-sm text-slate-500 max-w-xs font-medium">No tasks found matching your current filters. Take a break or start something new.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task, idx, isOverdue, user, onEditTask, onDeleteTask }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpen]);

  // Ownership check: Note all tasks here are assigned to the user, but createdBy defines ownership
  const isOwner = task.createdBy && user?.email ? task.createdBy === user.email : false;
  // Fallback for seed data: if no createdBy, hide edit fields, exactly like TaskCard does.

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, delay: idx * 0.03 }}
      className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 hover:border-blue-400 dark:hover:border-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-500/5 cursor-pointer relative"
    >
      <div className="flex items-start gap-5">
        <div className={`mt-1 p-2.5 rounded-2xl ${task.status === 'done' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
          <CheckCircle2 size={20} className={task.status === 'done' ? 'fill-emerald-500/20' : ''} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 mb-3">
            <h3 className="text-base font-black text-slate-900 dark:text-white truncate group-hover:text-blue-500 transition-colors">
              {task.title}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${task.priority === 'urgent' ? 'bg-red-500/10 text-red-500' :
                  task.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
                    task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-emerald-500/10 text-emerald-500'
                }`}>
                {task.priority}
              </span>
              <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400`}>
                {task.status.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mb-4">
            {task.description || 'No description provided for this task.'}
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-slate-400" />
              <span className={`text-[11px] font-bold ${isOverdue(task.dueDate) && task.status !== 'done' ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                {task.dueDate}
              </span>
            </div>

            <div className="flex-1 min-w-[200px] max-w-xs">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Progress</span>
                <span className="text-[10px] font-black text-slate-900 dark:text-white">{task.status === 'done' ? '100%' : '35%'}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: task.status === 'done' ? '100%' : '35%' }}
                  className={`h-full ${task.status === 'done' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Menu Menu */}
        {task.createdBy !== undefined && (
          <div className="relative" ref={menuRef}>
            <button 
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              <MoreHorizontal size={20} />
            </button>
            
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-2 z-50 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-black/5 overflow-hidden"
                >
                  {isOwner ? (
                    <div className="p-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEditTask(task, task.status); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <Pencil size={15} className="text-slate-400" />
                        Edit Task
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDeleteTask(task, task.status); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors mt-1"
                      >
                        <Trash2 size={15} />
                        Delete Task
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50">
                      <div className="w-8 h-8 rounded-full bg-slate-200/50 dark:bg-slate-800 flex items-center justify-center mb-3">
                        <Lock size={14} className="text-slate-500" />
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug mb-1">Editing Locked</p>
                      <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                        Only the original creator can edit or delete this task.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
