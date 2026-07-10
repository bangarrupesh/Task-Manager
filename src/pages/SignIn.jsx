import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout, ArrowLeft, Lock, Mail, Eye, EyeOff, AlertCircle, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

export default function SignIn() {
  const { login, loginWithGoogle } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await login(formData.email, formData.password);
        navigate("/board", { replace: true });
      } catch (err) {
        setErrors(prev => ({ ...prev, general: err.message }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
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
        
        {/* Left Column: Visual Section */}
        <div className="hidden md:flex flex-1 bg-blue-600 overflow-hidden relative items-center justify-center p-12">
          {/* Decorative Circles */}
          <div className="absolute top-0 left-0 w-full h-full">
             <div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] border-[1px] border-white/20 rounded-full"></div>
             <div className="absolute top-[10%] left-[5%] w-[550px] h-[550px] border-[1px] border-white/10 rounded-full"></div>
             <div className="absolute top-[30%] left-[25%] w-[250px] h-[250px] border-[1px] border-white/30 rounded-full"></div>
          </div>
          
          <div className="max-w-md relative z-10 text-white text-center flex flex-col items-center">
             <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.5 }}
               className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl mb-12 flex items-center justify-center shadow-inner border border-white/20"
             >
                <Layout size={40} className="text-white" />
             </motion.div>
             <h2 className="text-4xl font-extrabold mb-6 tracking-tight leading-tight">Organize everything with ease.</h2>
             <p className="text-blue-100 text-lg font-medium opacity-80 leading-relaxed mb-12">
               TaskFlow combines the power of visual Kanban boards with intuitive task management.
             </p>

             {/* Carousel Pills */}
             <div className="flex gap-2.5">
                <div className="h-1.5 w-14 bg-white rounded-full"></div>
                <div className="h-1.5 w-4 bg-white/30 rounded-full"></div>
                <div className="h-1.5 w-4 bg-white/30 rounded-full"></div>
             </div>
          </div>
        </div>

        {/* Right Column: Form Section */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-20 py-12 relative bg-white dark:bg-[#0f172a]">
          <Link to="/" className="absolute top-10 left-10 md:left-20 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-[10px] uppercase tracking-widest">Back to home</span>
          </Link>

          <div className="max-w-md w-full mx-auto mt-24 md:mt-12">
            <div className="mb-12">
              <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">Welcome back.</h1>
              <p className="text-slate-500 text-sm font-medium">Log in to your dashboard to continue your progress.</p>
            </div>

            <form className="space-y-7" onSubmit={handleSubmit} noValidate>
              {errors.general && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{errors.general}</span>
                </div>
              )}
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
                  <Mail className={`absolute left-6 top-1/2 -translate-y-1/2 ${errors.email ? 'text-red-500' : 'text-slate-400 dark:text-slate-700'} h-5 w-5`} />
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
              
              <div className="space-y-2.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[12px] font-black text-slate-400 tracking-widest uppercase">Password</label>
                  <button type="button" className="text-[11px] font-black text-blue-500 hover:text-blue-400 tracking-widest uppercase transition-colors" tabIndex="-1">Forgot?</button>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••" 
                    className={`w-full pl-14 pr-14 py-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border ${errors.password ? 'border-red-500 ring-1 ring-red-500/20' : 'border-slate-200 dark:border-slate-800'} focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600`}
                  />
                  <Lock className={`absolute left-6 top-1/2 -translate-y-1/2 ${errors.password ? 'text-red-500' : 'text-slate-400 dark:text-slate-700'} h-5 w-5`} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors focus:outline-none"
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
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800/50"></div></div>
              <div className="relative flex justify-center text-[11px] uppercase font-black"><span className="bg-white dark:bg-[#0f172a] px-4 text-slate-500 dark:text-slate-600 tracking-widest">Or sign in with</span></div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all font-black text-[12px] tracking-widest uppercase text-slate-700 dark:text-white shadow-sm active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Sign in with Google</span>
            </button>

            <p className="text-center mt-12 text-sm font-medium text-slate-500">
              New to TaskFlow? <Link to="/signup" className="text-blue-500 font-bold hover:text-blue-400 transition-colors">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
