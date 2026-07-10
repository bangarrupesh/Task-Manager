import React from "react";
import { Link } from "react-router-dom";
import { Layout, CheckCircle, ArrowRight, Kanban, Shield, Zap } from "lucide-react";

export default function Features() {
  return (
      <section className="bg-slate-50 dark:bg-slate-900 py-24 px-6 md:px-12 mt-24 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white transition-colors underline decoration-blue-500/30 underline-offset-8">Everything you need to ship faster</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto transition-colors">Focus on the work that matters, not the management overhead.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="bg-blue-100 dark:bg-blue-900/40 w-12 h-12 rounded-xl flex items-center justify-center text-accent mb-6 mx-auto md:mx-0">
                <Kanban size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white transition-colors">Visual Kanban</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed transition-colors">
                Drag and drop tasks between columns and see your project's progress at a glance.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="bg-indigo-100 dark:bg-indigo-900/40 w-12 h-12 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 mx-auto md:mx-0">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white transition-colors">Task Filtering</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed transition-colors">
                Powerful sorting and filtering to find exactly what you're looking for when it matters.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="bg-purple-100 dark:bg-purple-900/40 w-12 h-12 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 mx-auto md:mx-0">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white transition-colors">Secure & Robust</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed transition-colors">
                Enterprise-grade security and reliability to keep your team's data safe.
              </p>
            </div>
          </div>
        </div>
      </section>
  );
}