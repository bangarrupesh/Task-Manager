import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Zap, X, Play, Pause,
  ChevronLeft, ChevronRight,
  Layout, CheckSquare, BarChart2, Bell, Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Demo slide definitions ──────────────────────────────── */
const DEMO_SLIDES = [
  {
    icon: Layout,
    color: "from-blue-500 to-indigo-600",
    bg: "bg-blue-500/10",
    iconColor: "text-blue-500",
    title: "Visual Kanban Board",
    desc: "Drag & drop tasks across columns — To Do, In Progress, In Review, and Done. Each task shows priority, labels, due dates, and assignee avatars at a glance.",
    Preview: () => (
      <div className="flex gap-2 w-full">
        {["To Do", "In Progress", "Done"].map((col, ci) => (
          <div key={ci} className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{col}</p>
            {[0, 1].map((ti) => (
              <div
                key={ti}
                className={`bg-white dark:bg-slate-700 rounded-lg p-2 mb-1.5 border-l-2 ${
                  ci === 0 ? "border-blue-500" : ci === 1 ? "border-amber-500" : "border-emerald-500"
                }`}
              >
                <div className="h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full mb-1" style={{ width: `${60 + ti * 20}%` }} />
                <div className="h-1 bg-slate-100 dark:bg-slate-600 rounded-full" style={{ width: "50%" }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: CheckSquare,
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-500/10",
    iconColor: "text-violet-500",
    title: "My Tasks View",
    desc: "See all tasks assigned to you in one place. Filter by status, sort by priority or due date, and track your personal progress with visual progress bars.",
    Preview: () => (
      <div className="w-full space-y-1.5">
        {[
          { label: "Design system audit", p: "Urgent", pColor: "text-red-500 bg-red-500/10", w: "90%" },
          { label: "API integration",      p: "High",   pColor: "text-orange-500 bg-orange-500/10", w: "60%" },
          { label: "Database schema",      p: "Medium", pColor: "text-amber-500 bg-amber-500/10",  w: "35%" },
        ].map((t, i) => (
          <div key={i} className="bg-white dark:bg-slate-700 rounded-xl p-2 flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full mb-1" style={{ width: t.w }} />
              <div className="h-1 bg-slate-100 dark:bg-slate-600 rounded-full" style={{ width: "50%" }} />
            </div>
            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md flex-shrink-0 ${t.pColor}`}>{t.p}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: BarChart2,
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    title: "Analytics & Insights",
    desc: "Track team velocity, completion rates, and workload distribution. Get actionable insights on project health with beautiful, real-time charts.",
    Preview: () => (
      <div className="w-full flex items-end gap-1.5 h-16">
        {[45, 70, 55, 85, 60, 90, 75].map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
            className="flex-1 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-md opacity-80"
          />
        ))}
      </div>
    ),
  },
  {
    icon: Bell,
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-500/10",
    iconColor: "text-amber-500",
    title: "Smart Notifications",
    desc: "Stay on top of deadlines with overdue alerts, due-today reminders, and task updates. Configure exactly which notifications you want to receive.",
    Preview: () => (
      <div className="w-full space-y-1.5">
        {[
          { t: "Task Overdue ⚠️",  m: '"API integration" is overdue!',  c: "border-red-400",   dot: "bg-red-500" },
          { t: "Task Due Today ⏰", m: '"Schema design" is due today.',   c: "border-amber-400", dot: "bg-amber-500" },
          { t: "Task Due Soon ⏳",  m: '"Audit docs" is due tomorrow.',   c: "border-blue-400",  dot: "bg-blue-500" },
        ].map((n, i) => (
          <div key={i} className={`bg-white dark:bg-slate-700 rounded-xl p-2 flex items-start gap-2 border-l-2 ${n.c}`}>
            <div className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${n.dot}`} />
            <div>
              <div className="text-[9px] font-black text-slate-700 dark:text-slate-200">{n.t}</div>
              <div className="text-[8px] text-slate-400">{n.m}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Users,
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-500/10",
    iconColor: "text-pink-500",
    title: "Team Collaboration",
    desc: "Manage your team, assign tasks, and track who's working on what. Each member gets a personalised view of their own workload and responsibilities.",
    Preview: () => (
      <div className="w-full grid grid-cols-3 gap-2">
        {[
          { init: "JD", color: "bg-blue-600",    tasks: 4 },
          { init: "AS", color: "bg-indigo-600",  tasks: 6 },
          { init: "RK", color: "bg-emerald-600", tasks: 3 },
        ].map((m, i) => (
          <div key={i} className="bg-white dark:bg-slate-700 rounded-xl p-2 text-center">
            <div className={`w-8 h-8 rounded-xl ${m.color} text-white text-[10px] font-black flex items-center justify-center mx-auto mb-1`}>
              {m.init}
            </div>
            <div className="text-[8px] text-slate-400 font-bold">{m.tasks} tasks</div>
            <div className="h-1 bg-slate-100 dark:bg-slate-600 rounded-full mt-1 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(m.tasks / 8) * 100}%` }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.6 }}
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
              />
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

/* ── Demo Modal ──────────────────────────────────────────── */
function DemoModal({ onClose }) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const intervalRef = useRef(null);

  const startTimer = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => {
        if (prev === DEMO_SLIDES.length - 1) {
          setPlaying(false);
          clearInterval(intervalRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, 4000);
  };

  useEffect(() => {
    if (playing) startTimer();
    else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const goTo = (idx) => {
    setCurrent(idx);
    if (playing) startTimer();
  };

  const slide = DEMO_SLIDES[current];
  const SlideIcon = slide.icon;
  const SlidePreview = slide.Preview;
  const isLast = current === DEMO_SLIDES.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden"
      >
        {/* Gradient accent bar */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${slide.color} transition-all duration-500`} />

        <div className="p-7">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl ${slide.bg} flex items-center justify-center ${slide.iconColor}`}>
                <SlideIcon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Feature {current + 1} of {DEMO_SLIDES.length}
                </p>
                <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                  {slide.title}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
            >
              <X size={15} className="text-slate-500" />
            </button>
          </div>

          {/* Animated preview */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
              className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-4 mb-5 min-h-[120px] flex items-center justify-center"
            >
              <SlidePreview />
            </motion.div>
          </AnimatePresence>

          {/* Description */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`desc-${current}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6"
            >
              {slide.desc}
            </motion.p>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 justify-center mb-5">
            {DEMO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? `w-6 h-2 bg-gradient-to-r ${slide.color}`
                    : "w-2 h-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"
                }`}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => goTo(Math.max(0, current - 1))}
              disabled={current === 0}
              className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={() => setPlaying((v) => !v)}
              className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-sm font-black text-white transition-all active:scale-95 bg-gradient-to-r ${slide.color} shadow-lg`}
            >
              {playing ? <Pause size={15} /> : <Play size={15} />}
              {playing ? "Pause" : "Resume"}
            </button>

            <button
              onClick={() => isLast ? onClose() : goTo(current + 1)}
              className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              {isLast ? <X size={16} /> : <ChevronRight size={18} />}
            </button>
          </div>

          {/* Final CTA */}
          {isLast && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3"
            >
              <Link
                to="/signup"
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-black text-center transition-all shadow-lg shadow-blue-600/25 active:scale-95"
              >
                Get Started Free →
              </Link>
              <button
                onClick={() => { setCurrent(0); setPlaying(true); }}
                className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Restart
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Hero ────────────────────────────────────────────────── */
export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const cards = [
    {
      id: 1,
      title: "Designsystem audit and documentation",
      desc: "Review all existing UI components and document current usage patterns.",
      status: "To Do",
      statusColor: "bg-blue-500/10 text-blue-500",
      progress: 60,
      user: "JD",
      userColor: "bg-blue-600",
    },
    {
      id: 2,
      title: "API integration for analytics dashboard",
      desc: "Connect backend REST APIs to the new analytics module.",
      status: "In Progress",
      statusColor: "bg-amber-500/10 text-amber-500",
      progress: 75,
      user: "AS",
      userColor: "bg-indigo-600",
    },
    {
      id: 3,
      title: "Database schema design",
      desc: "Finalized postgreSQL schema for users, projects, and tasks.",
      status: "Done",
      statusColor: "bg-emerald-500/10 text-emerald-500",
      progress: 100,
      user: "RK",
      userColor: "bg-emerald-600",
    },
  ];

  return (
    <>
      <main className="px-6 md:px-12 py-12 md:py-24 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-slate-900 text-slate-50 dark:bg-blue-50 dark:text-blue-600 px-3 py-1 rounded-full text-xs font-semibold mb-6 uppercase tracking-wider">
              <Zap className="h-3 w-3" />
              <span>Next-gen Productivity</span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8 text-slate-900 dark:text-slate-100">
              Organize <br />
              <span className="text-blue-600 italic">everything</span> <br />
              with ease.
            </h1>

            {/* Description */}
            <p className="text-lg text-slate-500 dark:text-slate-300 mb-10 max-w-md">
              TaskFlow combines the power of visual Kanban boards with intuitive task management.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/signup"
                className="bg-blue-600 text-white px-8 py-4 rounded-full font-semibold flex items-center gap-2 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                Get Started <ArrowRight className="h-5 w-5" />
              </Link>

              <button
                onClick={() => setDemoOpen(true)}
                className="group border-2 border-slate-200 dark:border-slate-700 px-8 py-4 rounded-full font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all active:scale-95 flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300"
              >
                <Play className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform fill-blue-500" />
                Watch Demo
              </button>
            </div>
          </motion.div>

          {/* RIGHT UI */}
          <div className="relative h-[600px] flex items-center justify-center lg:justify-end perspective-1000">
            <div className="relative w-full max-w-[400px] h-[340px]">
              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

              <AnimatePresence mode="popLayout">
                {cards.map((card, index) => {
                  const position = (index - activeIndex + 3) % 3;
                  const variants = {
                    0: { x: 0,    y: 0,   scale: 1,    zIndex: 30, opacity: 1,   rotateY: 0,   rotate: 0  },
                    1: { x: 120,  y: 20,  scale: 0.85, zIndex: 20, opacity: 0.6, rotateY: -25, rotate: 2  },
                    2: { x: -120, y: -20, scale: 0.85, zIndex: 10, opacity: 0.3, rotateY: 25,  rotate: -2 },
                  };

                  return (
                    <motion.div
                      key={card.id}
                      layout
                      initial={variants[2]}
                      animate={variants[position]}
                      exit={variants[2]}
                      transition={{ type: "spring", stiffness: 200, damping: 25, opacity: { duration: 0.3 } }}
                      style={{ transformStyle: "preserve-3d" }}
                      className="absolute inset-0 bg-white dark:bg-[#0f172a] p-8 rounded-[2.5rem] border-2 border-blue-600 shadow-[0_32px_64px_-12px_rgba(37,99,235,0.2)] flex flex-col justify-between transition-colors duration-300"
                    >
                      <div className="flex justify-between items-center mb-8">
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${card.statusColor} shadow-sm`}>
                          {card.status}
                        </div>
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-blue-600/10 text-blue-600">
                          <Zap className="h-5 w-5 fill-current" />
                        </div>
                      </div>

                      <h4 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100 leading-tight tracking-tight">
                        {card.title}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
                        {card.desc}
                      </p>

                      <div className="mt-auto">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl ${card.userColor} flex items-center justify-center text-white font-black text-xs shadow-lg`}>
                              {card.user}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{card.user}</div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Verified Contributor</div>
                            </div>
                          </div>
                          <div className="text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">{card.progress}%</div>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${card.progress}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </main>

      {/* Demo Modal */}
      <AnimatePresence>
        {demoOpen && <DemoModal onClose={() => setDemoOpen(false)} />}
      </AnimatePresence>
    </>
  );
}