import React, { useState, useMemo } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isToday,
  parseISO
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MoreHorizontal,
  Plus
} from 'lucide-react';
import { PRIORITY, LABEL_META } from '../data/boardData';

export default function CalendarView({ tasks = [], user = {}, onViewTask, onNewTaskDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Flatten tasks from all columns and ensure they have valid dates
  const allTasks = useMemo(() => {
    // In our seed data, dates are like "Apr 30". 
    // For a real calendar, we'd want proper ISO dates.
    // Let's mock some dates if they aren't properly formatted for the current year.
    const year = currentMonth.getFullYear();
    
    // Help helper to convert "Apr 30" to a Date object
    const parseTaskDate = (dateStr) => {
      if (!dateStr) return null;
      try {
        // Simple parser for "Month Day" format like "Apr 30"
        const months = { 
          Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, 
          Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 
        };
        const [mStr, dStr] = dateStr.split(' ');
        if (months[mStr] !== undefined) {
          return new Date(year, months[mStr], parseInt(dStr));
        }
        return parseISO(dateStr);
      } catch (e) {
        return null;
      }
    };

    return tasks.map(t => ({
      ...t,
      parsedDate: parseTaskDate(t.dueDate)
    })).filter(t => t.parsedDate);
  }, [tasks, currentMonth]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-600/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              {allTasks.length} Scheduled Tasks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentMonth(new Date())}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-700 mr-2"
          >
            Today
          </button>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button 
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Weekdays Row */}
      <div className="grid grid-cols-7 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
        {weekDays.map((day) => (
          <div key={day} className="py-4 text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 overflow-auto no-scrollbar">
        {calendarDays.map((day, idx) => {
          const dayTasks = allTasks.filter(t => isSameDay(t.parsedDate, day));
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isTodayDay = isToday(day);

          return (
            <div 
              key={day.toString()}
              onClick={() => setSelectedDate(day)}
              className={`min-h-[120px] p-2 border-r border-b border-slate-100 dark:border-slate-800 group transition-colors cursor-pointer
                ${!isCurrentMonth ? 'bg-slate-50/30 dark:bg-slate-900/10' : 'bg-white dark:bg-slate-900'}
                ${isSelected ? 'bg-blue-50/30 dark:bg-blue-600/5' : ''}
                hover:bg-slate-50 dark:hover:bg-slate-800/50
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`
                  w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black transition-all
                  ${isTodayDay 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : isCurrentMonth 
                      ? 'text-slate-700 dark:text-slate-300' 
                      : 'text-slate-300 dark:text-slate-600'}
                  ${isSelected && !isTodayDay ? 'border border-blue-500 text-blue-600 dark:text-blue-400' : ''}
                `}>
                  {format(day, 'd')}
                </span>
                
                <div className="flex items-center gap-1">
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mr-1">
                      {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                  )}
                  {onNewTaskDate && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onNewTaskDate(format(day, 'yyyy-MM-dd')); }}
                      className="opacity-0 group-hover:opacity-100 p-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-500/20 dark:hover:bg-blue-500/40 text-blue-600 dark:text-blue-400 rounded-lg transition-all"
                    >
                      <Plus size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 h-full max-h-[85px] overflow-hidden">
                {dayTasks.slice(0, 3).map((task) => {
                  const priority = PRIORITY[task.priority] || PRIORITY.medium;
                  const isOwner = task.createdBy && user?.email ? task.createdBy === user.email : false;
                  
                  const handleTaskClick = (e) => {
                    e.stopPropagation();
                    if (onViewTask) {
                      onViewTask(task, task.status); // task.status contains colId mapped from Board
                    }
                  };
                  
                  return (
                    <motion.div 
                      key={task.id}
                      onClick={handleTaskClick}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 hover:border-blue-400 dark:hover:border-blue-500/50 shadow-sm flex flex-col gap-0.5 group/item transition-all overflow-hidden cursor-pointer`}
                      title="Click to view details"
                    >
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <div 
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: priority.color }}
                        />
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate leading-tight">
                          {task.title}
                        </span>
                      </div>
                      {task.label && (
                        <span 
                          className="text-[8px] font-black uppercase tracking-wider px-1 rounded bg-slate-200/50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 w-fit"
                        >
                          {task.label}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
                {dayTasks.length > 3 && (
                  <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 pl-1">
                    + {dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
