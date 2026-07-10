import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Check, X, Clock, Shield, Mail } from 'lucide-react';

/**
 * Rendered inside the notifications panel for notifications with
 * invitationType === 'invite'. Shows Accept / Decline action buttons.
 */
export default function InvitationNotificationCard({ notif, onRespond, onDelete }) {
  const [loading, setLoading] = useState(null); // 'accept' | 'decline' | null
  const [responded, setResponded] = useState(
    notif.invitationStatus ? notif.invitationStatus : null
  );

  const handleAction = async (action) => {
    if (loading || responded) return;
    setLoading(action);
    try {
      const result = await onRespond(notif.invitationId, action);
      if (result?.ok) {
        setResponded(action);
      }
    } finally {
      setLoading(null);
    }
  };

  // Time formatter (replicates BoardHeader's formatTime)
  const formatTime = (ts) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'just now';
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 group relative transition-colors ${
        !notif.read ? 'bg-indigo-50/30 dark:bg-indigo-500/5' : ''
      }`}
    >
      {/* Header row */}
      <div className="flex items-start gap-3 mb-3">
        {/* Icon */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-500">
          <UserPlus size={14} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <p className={`text-xs truncate ${!notif.read ? 'font-black text-slate-900 dark:text-white' : 'font-semibold text-slate-800 dark:text-slate-200'}`}>
              {notif.title}
            </p>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 shrink-0 mt-0.5">
              {formatTime(notif.timestamp)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
            {notif.message}
          </p>
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(notif.id); }}
          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 mt-0.5"
          title="Dismiss"
        >
          <X size={10} />
        </button>
      </div>

      {/* Meta pills */}
      <div className="flex items-center gap-2 mb-3 pl-12 flex-wrap">
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
          <Shield size={9} />
          {notif.role}
        </span>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400">
          <Mail size={9} />
          {notif.inviterEmail}
        </span>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400">
          <Clock size={9} />
          Expires in 7 days
        </span>
      </div>

      {/* Action buttons */}
      <div className="pl-12 flex items-center gap-2">
        {responded === 'accept' ? (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
            <Check size={10} /> Accepted
          </span>
        ) : responded === 'decline' ? (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 text-[10px] font-black">
            <X size={10} /> Declined
          </span>
        ) : (
          <>
            <button
              id={`invite-accept-${notif.invitationId}`}
              onClick={() => handleAction('accept')}
              disabled={!!loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white text-[10px] font-black transition-all active:scale-95 shadow-sm shadow-emerald-500/30"
            >
              {loading === 'accept' ? (
                <div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Check size={10} />
              )}
              Accept
            </button>
            <button
              id={`invite-decline-${notif.invitationId}`}
              onClick={() => handleAction('decline')}
              disabled={!!loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-500/10 text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 disabled:opacity-60 text-[10px] font-black transition-all active:scale-95 border border-slate-200 dark:border-slate-700"
            >
              {loading === 'decline' ? (
                <div className="w-3 h-3 border border-slate-400/40 border-t-slate-500 rounded-full animate-spin" />
              ) : (
                <X size={10} />
              )}
              Decline
            </button>
          </>
        )}
      </div>

      {/* Unread dot */}
      {!notif.read && (
        <span className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-indigo-500" />
      )}
    </motion.div>
  );
}
