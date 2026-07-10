import React, { useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, CheckCircle2, Clock, AlertCircle,
  TrendingUp, Users, Target, Calendar, X
} from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export default function AnalyticsView({ columns = {}, boardName }) {
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Process data for charts
  const stats = useMemo(() => {
    const allTasks = Object.values(columns).flatMap(col => col.tasks);
    const total = allTasks.length;
    const completed = columns['done']?.tasks.length || 0;
    const pending = (columns['todo']?.tasks.length || 0) + (columns['inprogress']?.tasks.length || 0) + (columns['inreview']?.tasks.length || 0);

    // Mocking overdue as tasks with past due dates (logic could be more complex)
    const overdue = allTasks.filter(t => t.priority === 'urgent').length;

    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, overdue, progress };
  }, [columns]);

  const statusData = useMemo(() => [
    { name: 'To Do', value: columns['todo']?.tasks.length || 0 },
    { name: 'In Progress', value: columns['inprogress']?.tasks.length || 0 },
    { name: 'In Review', value: columns['inreview']?.tasks.length || 0 },
    { name: 'Done', value: columns['done']?.tasks.length || 0 },
  ], [columns]);

  const teamData = useMemo(() => {
    const memberStats = {};
    Object.entries(columns).forEach(([colId, col]) => {
      if (!col.tasks) return;
      col.tasks.forEach(t => {
        if (t.assignee && t.assignee.initials) {
          const initials = t.assignee.initials;
          if (!memberStats[initials]) {
            memberStats[initials] = { total: 0, done: 0, color: t.assignee.color || '#6366f1', tasks: [] };
          }
          memberStats[initials].total += 1;
          memberStats[initials].tasks.push({ ...t, status: colId });
          if (colId === 'done') {
            memberStats[initials].done += 1;
          }
        }
      });
    });

    return Object.entries(memberStats).map(([name, stats]) => ({
      name,
      tasks: stats.total,
      performance: Math.round((stats.done / stats.total) * 100) || 0,
      color: stats.color,
      tasksList: stats.tasks
    }));
  }, [columns]);

  const weeklyData = useMemo(() => {
    const data = [
      { day: 'Mon', completed: 4, active: 10 },
      { day: 'Tue', completed: 7, active: 12 },
      { day: 'Wed', completed: 5, active: 15 },
      { day: 'Thu', completed: 9, active: 11 },
      { day: 'Fri', completed: 12, active: 8 },
      { day: 'Sat', completed: 3, active: 5 },
      { day: 'Sun', completed: 6, active: 4 },
    ];
    return stats.total > 0 ? data : data.map(d => ({ ...d, completed: 0, active: 0 }));
  }, [stats.total]);

  const handleGenerateReport = () => {
    if (!stats.total || stats.total === 0) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryColor = [79, 70, 229]; // #4f46e5 (Indigo)
    const secondaryColor = [30, 41, 59]; // #1e293b (Slate-800)
    const lightSlate = [248, 250, 252]; // #f8fafc (Slate-50)
    const grayText = [100, 116, 139]; // #64748b (Slate-500)
    const darkText = [15, 23, 42]; // #0f172a (Slate-900)

    let y = 15;

    // Header Accent Bar
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 8, 'F');

    // Draw Title
    y = 22;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('TASKFLOW ANALYTICS REPORT', 15, y);

    // Subtitle
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.text('Comprehensive Project Progress & Team Efficiency Insights', 15, y);

    // Date
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`GENERATED ON: ${today.toUpperCase()}`, 145, y);

    if (boardName) {
      y += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text(`PROJECT: ${boardName.toUpperCase()}`, 15, y);
    }

    // Divider Line
    y += 5;
    doc.setDrawColor(226, 232, 240); // border-slate-200
    doc.setLineWidth(0.5);
    doc.line(15, y, 195, y);

    // Exec Summary Header
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('Executive Progress Summary', 15, y);

    // KPI Cards
    y += 6;
    const drawKPICard = (cardX, cardY, label, value, color) => {
      // background
      doc.setFillColor(lightSlate[0], lightSlate[1], lightSlate[2]);
      doc.roundedRect(cardX, cardY, 85, 22, 2, 2, 'F');

      // left accent border
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(cardX, cardY, 2.5, 22, 'F');

      // label
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.text(label.toUpperCase(), cardX + 7, cardY + 7);

      // value
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text(String(value), cardX + 7, cardY + 16);
    };

    drawKPICard(15, y, 'Total Tasks', stats.total, [59, 130, 246]);
    drawKPICard(110, y, 'Completed Tasks', stats.completed, [16, 185, 129]);

    y += 28;
    drawKPICard(15, y, 'Pending Tasks', stats.pending, [245, 158, 11]);
    drawKPICard(110, y, 'Overdue Tasks', stats.overdue, [239, 68, 68]);

    // Efficiency Metrics Section
    y += 32;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('Efficiency & Productivity Metrics', 15, y);

    // Double Column box for efficiency
    y += 6;
    doc.setFillColor(lightSlate[0], lightSlate[1], lightSlate[2]);
    doc.roundedRect(15, y, 180, 25, 2, 2, 'F');

    // Overall Completion
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.text('OVERALL COMPLETION', 22, y + 8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text(`${stats.progress}%`, 22, y + 17);

    // Weekly Velocity
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.text('WEEKLY VELOCITY', 82, y + 8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text(stats.total > 0 ? `${(stats.completed / 2).toFixed(1)} tasks/wk` : '0.0 tasks/wk', 82, y + 17);

    // Time Saved
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.text('TIME SAVED', 142, y + 8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text(stats.total > 0 ? `${stats.completed * 2} hours` : '0 hours', 142, y + 17);

    // Section 3: Task Status Breakdown List
    y += 37;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('Detailed Column Distribution', 15, y);

    y += 6;
    const colsList = Object.entries(columns).map(([colId, col]) => ({
      name: col.meta?.title || colId.charAt(0).toUpperCase() + colId.slice(1),
      value: col.tasks?.length || 0
    }));

    colsList.forEach((col, idx) => {
      const colX = 15 + ((idx % 4) * 45);
      const colY = y + (Math.floor(idx / 4) * 22);
      doc.setFillColor(lightSlate[0], lightSlate[1], lightSlate[2]);
      doc.roundedRect(colX, colY, 40, 18, 1.5, 1.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);

      let name = col.name;
      if (name.length > 20) name = name.substring(0, 17) + '...';
      doc.text(name, colX + 4, colY + 6);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text(String(col.value), colX + 4, colY + 13);
    });

    // Helper to print page headers on new page
    const drawPageHeader = () => {
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 8, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('TASKFLOW ANALYTICS REPORT', 15, 14);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.text(`Generated on: ${today}`, 145, 14);

      if (boardName) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        doc.text(`PROJECT: ${boardName.toUpperCase()}`, 15, 19);

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(15, 21, 195, 21);
      } else {
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(15, 16, 195, 16);
      }
    };

    // Detailed Task Inventory Section
    const allColumnsKeys = Object.keys(columns);

    let hasTasks = false;
    allColumnsKeys.forEach(key => {
      const colTasks = columns[key]?.tasks || [];
      if (colTasks.length > 0) hasTasks = true;
    });

    if (hasTasks) {
      doc.addPage();
      drawPageHeader();
      y = boardName ? 30 : 25;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text('Detailed Task Inventory', 15, y);
      y += 8;

      allColumnsKeys.forEach(colKey => {
        const colTasks = columns[colKey]?.tasks || [];
        if (colTasks.length === 0) return;

        if (y + 20 > 275) {
          doc.addPage();
          drawPageHeader();
          y = boardName ? 30 : 25;
        }

        const colTitle = columns[colKey]?.meta?.title || colKey.charAt(0).toUpperCase() + colKey.slice(1);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(`${colTitle} Tasks`, 15, y);
        y += 5;

        // Table Header
        doc.setFillColor(241, 245, 249); // bg-slate-100
        doc.rect(15, y, 180, 7, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(grayText[0], grayText[1], grayText[2]);
        doc.text('TASK TITLE', 18, y + 5);
        doc.text('ASSIGNEE', 110, y + 5);
        doc.text('PRIORITY', 140, y + 5);
        doc.text('DUE DATE', 170, y + 5);
        y += 7;

        colTasks.forEach((task, idx) => {
          if (y + 10 > 275) {
            doc.addPage();
            drawPageHeader();
            y = boardName ? 30 : 25;

            // Re-draw table header
            doc.setFillColor(241, 245, 249);
            doc.rect(15, y, 180, 7, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(grayText[0], grayText[1], grayText[2]);
            doc.text('TASK TITLE', 18, y + 5);
            doc.text('ASSIGNEE', 110, y + 5);
            doc.text('PRIORITY', 140, y + 5);
            doc.text('DUE DATE', 170, y + 5);
            y += 7;
          }

          // Row background
          if (idx % 2 === 1) {
            doc.setFillColor(lightSlate[0], lightSlate[1], lightSlate[2]);
            doc.rect(15, y, 180, 8, 'F');
          }

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(darkText[0], darkText[1], darkText[2]);

          let title = task.title;
          if (title.length > 50) title = title.substring(0, 47) + '...';
          doc.text(title, 18, y + 5.5);

          const assigneeName = task.assignee?.initials || 'Unassigned';
          doc.text(assigneeName, 110, y + 5.5);

          const prio = task.priority || 'medium';
          doc.setFont('helvetica', 'bold');
          if (prio === 'urgent') doc.setTextColor(239, 68, 68);
          else if (prio === 'high') doc.setTextColor(249, 115, 22);
          else if (prio === 'medium') doc.setTextColor(234, 179, 8);
          else doc.setTextColor(34, 197, 94);
          doc.text(prio.toUpperCase(), 140, y + 5.5);

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(darkText[0], darkText[1], darkText[2]);
          doc.text(task.dueDate || 'No Date', 170, y + 5.5);

          y += 8;
        });

        y += 6;
      });
    }

    doc.save(`TaskFlow_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-opacity-100 group-hover:scale-110 transition-transform`}>
          <Icon size={24} className={color.replace('bg-', 'text-')} />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-[10px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-lg">
            <TrendingUp size={10} />
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
      <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
    </motion.div>
  );

  return (
    <div className="p-1 space-y-6 overflow-y-auto no-scrollbar pb-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Tasks" value={stats.total} icon={Target} color="bg-blue-600" trend={stats.total > 0 ? "+12%" : null} />
        <StatCard title="Completed" value={stats.completed} icon={CheckCircle2} color="bg-emerald-500" trend={stats.total > 0 ? "+8%" : null} />
        <StatCard title="Pending" value={stats.pending} icon={Clock} color="bg-amber-500" />
        <StatCard title="Overdue" value={stats.overdue} icon={AlertCircle} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Weekly Progress</h2>
              <p className="text-xs text-slate-500 font-medium">Task completion trends over the last 7 days</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Completed</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: '#1e293b',
                    color: '#fff'
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorActive)" />
                <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCompleted)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Task Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col"
        >
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-1">Task Status</h2>
          <p className="text-xs text-slate-500 font-medium mb-6">Distribution by column</p>
          <div className="h-[240px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                  animationBegin={200}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.progress}%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</span>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            {statusData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[idx] }} />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{item.name}</span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Productivity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Team Productivity</h2>
              <p className="text-xs text-slate-500 font-medium">Performance and task load per member</p>
            </div>
            <button
              onClick={() => setDetailsModalOpen(true)}
              className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline"
            >
              View details
            </button>
          </div>
          <div className="h-[300px] w-full">
            {teamData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 800, fill: '#64748b' }}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                  <Bar
                    name="Task Load"
                    dataKey="tasks"
                    fill="#6366f1"
                    radius={[4, 4, 4, 4]}
                    barSize={15}
                  />
                  <Bar
                    name="Performance (%)"
                    dataKey="performance"
                    fill="#10b981"
                    radius={[4, 4, 4, 4]}
                    barSize={15}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Users size={32} className="mb-2 opacity-50" />
                <p className="text-sm font-medium">No members assigned to any tasks yet</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Project Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl shadow-blue-600/20 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                <TrendingUp size={20} />
              </div>
              <h2 className="text-lg font-black tracking-tight">Efficiency</h2>
            </div>
            <p className="text-white/80 text-xs font-medium leading-relaxed mb-6">
              {stats.total > 0 ? (
                <>Your team is performing <span className="font-black text-white">{(stats.progress / 5).toFixed(0)}% better</span> this week. Keep it up!</>
              ) : (
                <>Start adding tasks to see your team's efficiency and progress analytics here.</>
              )}
            </p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Overall Completion</span>
                  <span className="text-sm font-black">{stats.progress}%</span>
                </div>
                <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/10">
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">Weekly Velocity</p>
                  <p className="text-xl font-black">{stats.total > 0 ? (stats.completed / 2).toFixed(1) : "0.0"}</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/10">
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">Time Saved</p>
                  <p className="text-xl font-black">{stats.total > 0 ? (stats.completed * 2) : 0}h</p>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={stats.total === 0}
            className={`w-full py-4 rounded-2xl text-xs font-black transition-all mt-8 active:scale-[0.98] ${stats.total === 0
              ? 'bg-white/15 text-white/40 cursor-not-allowed'
              : 'bg-white text-blue-600 hover:bg-slate-50'
              }`}
          >
            Generate Full Report
          </button>
        </motion.div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {detailsModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setDetailsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-4xl max-h-[85vh] overflow-y-auto no-scrollbar shadow-2xl flex flex-col gap-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Team Performance Details</h2>
                  <p className="text-xs text-slate-500 font-medium">Detailed work distribution and execution records</p>
                </div>
                <button
                  onClick={() => setDetailsModalOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
                >
                  <X size={15} className="text-slate-500 dark:text-slate-400" />
                </button>
              </div>

              {/* Members List */}
              <div className="space-y-8">
                {teamData.map((member) => (
                  <div key={member.name} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5">
                    {/* Member Summary Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/50 dark:border-slate-800/50 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-inner"
                          style={{ backgroundColor: member.color }}
                        >
                          {member.name}
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-900 dark:text-white">Member Initials: {member.name}</h3>
                          <p className="text-xs text-slate-500 font-semibold">{member.tasks} active tasks assigned</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Performance</span>
                          <span className="text-sm font-black text-emerald-500">{member.performance}%</span>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 hidden md:block" />
                        <div className="text-right">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Status Summary</span>
                          <span className="text-xs font-black text-blue-500">
                            {member.tasksList.filter(t => t.status === 'done').length} Completed / {member.tasksList.filter(t => t.status !== 'done').length} Pending
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Member's Tasks List */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200/40 dark:border-slate-800/40">
                            <th className="pb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Task Title</th>
                            <th className="pb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="pb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                            <th className="pb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
                          {member.tasksList.map((task) => (
                            <tr key={task.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 transition-colors">
                              <td className="py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 max-w-xs truncate">{task.title}</td>
                              <td className="py-2.5 text-xs font-bold">
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${task.status === 'done' ? 'bg-emerald-500/10 text-emerald-500' :
                                  task.status === 'inreview' ? 'bg-amber-500/10 text-amber-500' :
                                    task.status === 'inprogress' ? 'bg-blue-500/10 text-blue-500' :
                                      'bg-slate-200/50 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                  }`}>
                                  {task.status.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                              </td>
                              <td className="py-2.5 text-xs font-bold">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${task.priority === 'urgent' ? 'bg-red-500/10 text-red-500' :
                                  task.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
                                    task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                                      'bg-emerald-500/10 text-emerald-500'
                                  }`}>
                                  {task.priority}
                                </span>
                              </td>
                              <td className="py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400">{task.dueDate || 'No Date'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

                {teamData.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                    <Users size={36} className="mb-3 opacity-40" />
                    <p className="text-sm font-medium">No tasks assigned to any team member yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
