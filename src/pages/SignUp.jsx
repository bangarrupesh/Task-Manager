import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout, ArrowLeft, CheckCircle2, AlertCircle, Zap, Sun, Moon, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function SignUp() {
  const navigate = useNavigate();
  const { signup, loginWithGoogle } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const cards = [
    {
      id: 1,
      title: "Design system audit & documentation",
      desc: "Review all existing UI components and document current usage patterns.",
      status: "To Do",
      statusColor: "bg-blue-500/10 text-blue-500",
      progress: 40,
      user: "JD",
      userColor: "bg-blue-600",
      accent: "border-blue-600"
    },
    {
      id: 2,
      title: "Authentication flow & security",
      desc: "JWT refresh tokens and OAuth2 integration complete for review.",
      status: "In Progress",
      statusColor: "bg-amber-500/10 text-amber-500",
      progress: 80,
      user: "AS",
      userColor: "bg-indigo-600",
      accent: "border-slate-200"
    },
    {
      id: 3,
      title: "Project scaffolding & setup",
      desc: "Initialized React app with Vite, configured routing and base styles.",
      status: "Done",
      statusColor: "bg-emerald-500/10 text-emerald-500",
      progress: 100,
      user: "RK",
      userColor: "bg-emerald-600",
      accent: "border-slate-200"
    }
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await signup(formData.fullName, formData.email, formData.password);
        navigate("/board", { replace: true });
      } catch (err) {
        setErrors(prev => ({ ...prev, general: err.message }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleGoogleSignUp = async () => {
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      navigate("/board", { replace: true });
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name] || errors.general) {
      setErrors(prev => ({ ...prev, [name]: "", general: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] dark:bg-[#020617] font-sans flex items-center justify-center p-4 md:p-8 transition-colors duration-300 relative">
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 md:top-8 md:right-8 p-3 rounded-full bg-white dark:bg-slate-800 shadow-md text-slate-700 dark:text-slate-200 hover:scale-105 transition-transform z-50"
      >
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Main Container Card */}
      <div className="w-full max-w-6xl bg-white dark:bg-[#0f172a] rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[700px] border border-slate-200 dark:border-slate-800">

        {/* Left Column: Form Section */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-20 py-12 relative bg-white dark:bg-[#0f172a]">
          <Link to="/" className="absolute top-10 left-10 md:left-20 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-[10px] uppercase tracking-widest">Back to home</span>
          </Link>

          <div className="max-w-md w-full mx-auto mt-24 md:mt-12">
            <div className="mb-12">
              <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter leading-tight">Organize everything with ease.</h1>
              <p className="text-slate-500 text-sm font-medium">TaskFlow combines the power of visual Kanban boards with intuitive task management.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {errors.general && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-800 text-red-500 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{errors.general}</span>
                </div>
              )}
              {/* Full Name */}
              <div className="space-y-2.5">
                <label className="text-[12px] font-black text-slate-400 tracking-widest uppercase ml-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border ${errors.fullName ? 'border-red-500 ring-1 ring-red-500/20' : 'border-slate-200 dark:border-slate-800'} focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600`}
                  />
                  <User className={`absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 ${errors.fullName ? 'text-red-500' : 'text-slate-400 dark:text-slate-700'}`} />
                </div>
                <AnimatePresence>
                  {errors.fullName && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-500 text-[10px] font-bold uppercase tracking-wider ml-1 mt-1 flex items-center gap-1"
                    >
                      <AlertCircle size={12} />
                      {errors.fullName}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Email */}
              <div className="space-y-2.5">
                <label className="text-[12px] font-black text-slate-400 tracking-widest uppercase ml-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    className={`w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border ${errors.email ? 'border-red-500 ring-1 ring-red-500/20' : 'border-slate-200 dark:border-slate-800'} focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600`}
                  />
                  <Mail className={`absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 ${errors.email ? 'text-red-500' : 'text-slate-400 dark:text-slate-700'}`} />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-500 text-[10px] font-bold uppercase tracking-wider ml-1 mt-1 flex items-center gap-1"
                    >
                      <AlertCircle size={12} />
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password */}
              <div className="space-y-2.5">
                <label className="text-[12px] font-black text-slate-400 tracking-widest uppercase ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-14 pr-14 py-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border ${errors.password ? 'border-red-500 ring-1 ring-red-500/20' : 'border-slate-200 dark:border-slate-800'} focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600`}
                  />
                  <Lock className={`absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 ${errors.password ? 'text-red-500' : 'text-slate-400 dark:text-slate-700'}`} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-500 text-[10px] font-bold uppercase tracking-wider ml-1 mt-1 flex items-center gap-1"
                    >
                      <AlertCircle size={12} />
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] mt-4 tracking-wide disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800/50"></div></div>
              <div className="relative flex justify-center text-[11px] uppercase font-black"><span className="bg-white dark:bg-[#0f172a] px-4 text-slate-500 dark:text-slate-600 tracking-widest">Or continue with</span></div>
            </div>

            {/* Social Sign Up */}
            <div className="mb-8">
              <button 
                type="button"
                onClick={handleGoogleSignUp}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all font-black text-[12px] uppercase tracking-widest text-slate-700 dark:text-white shadow-sm active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            <p className="text-center mt-8 text-sm font-medium text-slate-500">
              Already have an account? <Link to="/signin" className="text-blue-500 font-bold hover:text-blue-400 transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
        {/* Right Column: Visual Section */}
        <div className="hidden md:flex flex-1 bg-slate-100 dark:bg-slate-900 overflow-hidden relative items-center justify-center p-12 border-l border-slate-200 dark:border-slate-800 perspective-1000">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] -mr-64 -mt-64"></div>

          <div className="max-w-md w-full relative flex flex-col items-center gap-8">
            <div className="relative w-full h-[360px] mb-20 transform-style-3d">
              <AnimatePresence mode="popLayout">
                {cards.map((card, index) => {
                  const position = (index - activeIndex + 3) % 3;

                  // Vertical stacking logic
                  const variants = {
                    0: { y: 0, z: 0, scale: 1, zIndex: 30, opacity: 1, rotateX: 0 },
                    1: { y: 120, z: -100, scale: 0.85, zIndex: 20, opacity: 0.6, rotateX: -15 },
                    2: { y: -120, z: -100, scale: 0.85, zIndex: 10, opacity: 0.3, rotateX: 15 },
                  };

                  return (
                    <motion.div
                      key={card.id}
                      layout
                      initial={variants[2]}
                      animate={variants[position]}
                      exit={variants[2]}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 25,
                        opacity: { duration: 0.3 }
                      }}
                      className={`absolute inset-0 bg-white dark:bg-[#0f172a] p-8 rounded-[2.5rem] border-2 border-blue-600 shadow-[0_32px_64px_-12px_rgba(37,99,235,0.2)] flex flex-col justify-between transition-colors duration-300`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-6">
                          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${card.statusColor}`}>
                            {card.status}
                          </div>
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-blue-600/10 text-blue-600`}>
                            <Zap className="h-5 w-5 fill-current" />
                          </div>
                        </div>

                        <h4 className="text-xl font-bold mb-3 text-slate-900 dark:text-white leading-tight">
                          {card.title}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                          {card.desc}
                        </p>
                      </div>

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
                            className={`h-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="w-full space-y-6 px-4">
              <div className="flex items-start gap-5">
                <div className="h-10 w-10 shrink-0 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 border border-blue-500/10 shadow-sm">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base tracking-tight mb-1">Scale your vision</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Join 10,000+ teams who have optimized their delivery process with TaskFlow.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
