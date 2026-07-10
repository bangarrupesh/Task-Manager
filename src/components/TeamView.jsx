import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, UserPlus, Filter, Mail,
  MoreVertical,
  Shield, Edit2, Trash2, X, Clock, CheckCircle2, XCircle, Loader2, Send, AlertCircle
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ROLES = ['All Roles', 'Admin', 'Developer', 'Designer', 'DevOps', 'QA'];

const MEMBER_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-indigo-500',
  'bg-orange-500', 'bg-rose-500', 'bg-amber-500', 'bg-teal-500'
];

// ── Status badge helper ────────────────────────────────────────────────────────
function InvitationStatusBadge({ status }) {
  const map = {
    pending: { label: 'Pending', icon: Clock, cls: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20' },
    accepted: { label: 'Accepted', icon: CheckCircle2, cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' },
    declined: { label: 'Declined', icon: XCircle, cls: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20' },
    expired: { label: 'Expired', icon: AlertCircle, cls: 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700' },
    cancelled: { label: 'Cancelled', icon: XCircle, cls: 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700' },
  };
  const { label, icon: Icon, cls } = map[status] || map.expired;
  return (
    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-black uppercase tracking-wide ${cls}`}>
      <Icon size={9} />
      {label}
    </span>
  );
}

export default function TeamView({ selectedBoard }) {
  const { user, token } = useAuth();
  const storageKey = `taskflow_team_data_${user?.email || 'guest'}`;

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'invitations'

  const handleCloseMenu = useCallback((e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setOpenMenuId(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleCloseMenu);
    return () => document.removeEventListener('mousedown', handleCloseMenu);
  }, [handleCloseMenu]);

  // teamDataState: { [boardName]: member[] }
  const [teamDataState, setTeamDataState] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Invitations state
  const [invitations, setInvitations] = useState([]);
  const [invitationsLoaded, setInvitationsLoaded] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null); // { message, type: 'success'|'error'|'info' }

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Load team data ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    setIsLoaded(false);

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') setTeamDataState(parsed);
      }
    } catch (e) {
      console.error('Failed to load team data from localStorage:', e);
    }

    const fetchTeamData = async () => {
      try {
        const response = await fetch(`${API_URL}/teams`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.teamData && typeof data.teamData === 'object') {
            setTeamDataState(data.teamData);
            try { localStorage.setItem(storageKey, JSON.stringify(data.teamData)); } catch (e) { /* ignore */ }
          }
        }
      } catch (err) {
        console.error('Failed to fetch team data from server:', err);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchTeamData();
  }, [token, storageKey]);

  // ── Save team data ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded || !token) return;
    try { localStorage.setItem(storageKey, JSON.stringify(teamDataState)); } catch (e) { /* ignore */ }
    const timer = setTimeout(async () => {
      try {
        await fetch(`${API_URL}/teams`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ teamData: teamDataState })
        });
      } catch (err) {
        console.error('Failed to sync team data to server:', err);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [teamDataState, isLoaded, token, storageKey]);

  // ── Load invitations ────────────────────────────────────────────────────────
  const fetchInvitations = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/invitations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations || []);
      }
    } catch (err) {
      console.error('Failed to fetch invitations:', err);
    } finally {
      setInvitationsLoaded(true);
    }
  }, [token]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  // ── Invite / edit modal state ───────────────────────────────────────────────
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'Developer' });
  const [formError, setFormError] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  // ── Derived members list ────────────────────────────────────────────────────
  const members = useMemo(() => {
    if (!selectedBoard?.name) return [];
    return teamDataState[selectedBoard.name] || [];
  }, [teamDataState, selectedBoard]);

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch =
        member.name.toLowerCase().includes(search.toLowerCase()) ||
        member.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'All Roles' || member.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [search, roleFilter, members]);

  // Invitations for the current board (sent by current user)
  const boardInvitations = useMemo(() => {
    if (!selectedBoard?.name) return [];
    return invitations.filter(
      inv => inv.boardName === selectedBoard.name && inv.inviterEmail === user?.email
    );
  }, [invitations, selectedBoard, user]);

  const pendingInvitationsCount = boardInvitations.filter(i => i.status === 'pending').length;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleOpenInvite = () => {
    setEditingMember(null);
    setInviteForm({ name: '', email: '', role: 'Developer' });
    setFormError('');
    setInviteModalOpen(true);
  };

  const handleOpenEdit = (member) => {
    setEditingMember(member);
    setInviteForm({ name: member.name, email: member.email, role: member.role });
    setFormError('');
    setInviteModalOpen(true);
  };

  const handleRemoveMember = (memberId) => {
    if (!selectedBoard?.name) return;
    setTeamDataState(prev => {
      const boardMembers = prev[selectedBoard.name] || [];
      return { ...prev, [selectedBoard.name]: boardMembers.filter(m => m.id !== memberId) };
    });
    setOpenMenuId(null);
  };

  // Send invitation via API
  const handleSendInvitation = async (e) => {
    e.preventDefault();
    if (!selectedBoard?.name) return;

    const normalizedEmail = inviteForm.email.trim().toLowerCase();

    // Client-side self-invite check
    if (normalizedEmail === user?.email?.toLowerCase()) {
      setFormError('You cannot invite yourself.');
      return;
    }

    // Check if already an active member
    const alreadyMember = members.some(m => m.email.toLowerCase() === normalizedEmail);
    if (alreadyMember) {
      setFormError('This person is already a member of this board.');
      return;
    }

    setIsSendingInvite(true);
    setFormError('');

    try {
      const response = await fetch(`${API_URL}/invitations/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          inviteeEmail: normalizedEmail,
          boardName: selectedBoard.name,
          role: inviteForm.role,
        }),
      });

      const data = await response.json();

      if (response.status === 409) {
        setFormError('A pending invitation for this person already exists on this board.');
        return;
      }
      if (!response.ok) {
        setFormError(data.message || 'Failed to send invitation. Please try again.');
        return;
      }

      // Success
      setInviteModalOpen(false);
      showToast(`Invitation sent to ${normalizedEmail}! Awaiting their response.`, 'success');
      // Refresh invitations list
      await fetchInvitations();
      // Switch to invitations tab to show the new pending invite
      setActiveTab('invitations');
    } catch (err) {
      setFormError('Network error. Please check your connection and try again.');
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedBoard?.name || !editingMember) return;
    setTeamDataState(prev => {
      const boardMembers = prev[selectedBoard.name] || [];
      const updated = boardMembers.map(m => {
        if (m.id !== editingMember.id) return m;
        const initials = inviteForm.name
          ? inviteForm.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
          : 'U';
        return { ...m, name: inviteForm.name, email: inviteForm.email, role: inviteForm.role, avatar: initials };
      });
      return { ...prev, [selectedBoard.name]: updated };
    });
    setInviteModalOpen(false);
  };

  const handleFormSubmit = (e) => {
    if (editingMember) return handleEditSubmit(e);
    return handleSendInvitation(e);
  };

  // Cancel a pending invitation
  const handleCancelInvitation = async (invitationId) => {
    try {
      const response = await fetch(`${API_URL}/invitations/${invitationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        showToast('Invitation cancelled.', 'info');
        await fetchInvitations();
      } else {
        const data = await response.json();
        showToast(data.message || 'Failed to cancel invitation.', 'error');
      }
    } catch (err) {
      showToast('Network error. Please try again.', 'error');
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full space-y-6 overflow-hidden">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-bold border backdrop-blur-sm
              ${toast.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300' :
                toast.type === 'error' ? 'bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300' :
                  'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'}`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={16} className="shrink-0" /> :
              toast.type === 'error' ? <XCircle size={16} className="shrink-0" /> :
                <AlertCircle size={16} className="shrink-0" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-2">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white"
            />
          </div>
          <div className="relative">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all font-bold text-slate-600 dark:text-slate-300 appearance-none cursor-pointer"
            >
              {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={handleOpenInvite}
          disabled={!selectedBoard?.name}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <Send size={16} />
          Send Invitation
        </button>
      </div>

      {/* Tabs: Members / Invitations */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-1 w-fit">
        <button
          id="tab-members"
          onClick={() => setActiveTab('members')}
          className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'members'
            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
        >
          Members
          <span className="ml-2 px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[9px] font-black">
            {members.length}
          </span>
        </button>
        <button
          id="tab-invitations"
          onClick={() => setActiveTab('invitations')}
          className={`px-5 py-2 rounded-xl text-xs font-black transition-all relative ${activeTab === 'invitations'
            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
        >
          Invitations
          {pendingInvitationsCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[9px] font-black">
              {pendingInvitationsCount} pending
            </span>
          )}
        </button>
      </div>

      {/* ── MEMBERS TAB ──────────────────────────────────────────────────────── */}
      {activeTab === 'members' && (
        <>
          {/* Loading state */}
          {!isLoaded && (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-xs text-slate-400 font-medium">Loading team members...</p>
              </div>
            </div>
          )}

          {isLoaded && (
            <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredMembers.map((member, idx) => (
                    <motion.div
                      key={member.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2, delay: idx * 0.05 }}
                      className="group relative bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="relative">
                          <div className={`w-16 h-16 rounded-2xl ${member.color} flex items-center justify-center text-xl font-black text-white shadow-inner`}>
                            {member.avatar}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 ${member.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        </div>

                        {/* Three-dot dropdown */}
                        <div className="relative" ref={openMenuId === member.id ? menuRef : null}>
                          <button
                            onClick={() => setOpenMenuId(prev => prev === member.id ? null : member.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                          >
                            <MoreVertical size={18} />
                          </button>

                          <AnimatePresence>
                            {openMenuId === member.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.92, y: -6 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92, y: -6 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl shadow-black/10 z-50 overflow-hidden py-1"
                              >
                                <button
                                  onClick={() => { setOpenMenuId(null); handleOpenEdit(member); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                  <Edit2 size={13} />
                                  Edit Member
                                </button>
                                <div className="my-1 mx-3 border-t border-slate-100 dark:border-slate-700" />
                                <button
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                >
                                  <Trash2 size={13} />
                                  Remove
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-blue-500 transition-colors">
                          {member.name}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
                          <Mail size={12} />
                          {member.email}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                          <Shield size={10} />
                          {member.role}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col gap-1 text-center border-r border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tasks</span>
                          <span className="text-xl font-black text-slate-900 dark:text-white">{member.tasks ?? 0}</span>
                        </div>
                        <div className="flex flex-col gap-1 text-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                          <span className={`text-[10px] font-black uppercase tracking-wider ${member.status === 'online' ? 'text-emerald-500' : 'text-slate-400'}`}>
                            {member.status}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Empty state */}
              {filteredMembers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                    {search || roleFilter !== 'All Roles' ? <Search size={32} /> : <UserPlus size={32} />}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                    {search || roleFilter !== 'All Roles' ? 'No members found' : 'No members yet'}
                  </h3>
                  <p className="text-sm text-slate-500 max-w-xs">
                    {search || roleFilter !== 'All Roles'
                      ? "Try adjusting your search or filter."
                      : 'Send invitations to add team members to this board.'}
                  </p>
                  {!search && roleFilter === 'All Roles' && (
                    <button
                      onClick={handleOpenInvite}
                      disabled={!selectedBoard?.name}
                      className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-black transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
                    >
                      <Send size={15} />
                      Send First Invitation
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── INVITATIONS TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'invitations' && (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
          {!invitationsLoaded ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-xs text-slate-400 font-medium">Loading invitations...</p>
              </div>
            </div>
          ) : boardInvitations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                <Send size={32} />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">No invitations sent</h3>
              <p className="text-sm text-slate-500 max-w-xs">
                Invitations you send to this board will appear here. You can track their status and cancel pending ones.
              </p>
              <button
                onClick={handleOpenInvite}
                disabled={!selectedBoard?.name}
                className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-black transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
              >
                <Send size={15} />
                Send Invitation
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-400 px-1">
                Invitations for &quot;{selectedBoard?.name}&quot;
              </p>
              <AnimatePresence mode="popLayout">
                {boardInvitations.map((inv, idx) => (
                  <motion.div
                    key={inv._id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, delay: idx * 0.04 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm hover:shadow-md transition-all"
                  >
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                      {inv.inviteeEmail.charAt(0).toUpperCase()}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {inv.inviteeEmail}
                        </span>
                        <InvitationStatusBadge status={inv.status} />
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          <Shield size={9} />
                          {inv.role}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          <Clock size={9} />
                          Sent {new Date(inv.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {inv.status === 'pending' && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                            <Clock size={9} />
                            Expires {new Date(inv.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        {inv.respondedAt && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <CheckCircle2 size={9} />
                            Responded {new Date(inv.respondedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Cancel button for pending */}
                    {inv.status === 'pending' && (
                      <button
                        id={`cancel-invite-${inv._id}`}
                        onClick={() => handleCancelInvitation(inv._id)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-500/10 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 text-xs font-black transition-all border border-slate-200 dark:border-slate-700 shrink-0"
                      >
                        <X size={12} />
                        Cancel
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* ── INVITE / EDIT MODAL ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {inviteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && !isSendingInvite && setInviteModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl flex flex-col gap-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    {editingMember ? 'Edit Member Details' : 'Send Invitation'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {editingMember
                      ? 'Update team member information'
                      : `Invite someone to join "${selectedBoard?.name || 'this board'}" — they'll receive a notification to accept or decline.`}
                  </p>
                </div>
                <button
                  onClick={() => !isSendingInvite && setInviteModalOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
                >
                  <X size={15} className="text-slate-500 dark:text-slate-400" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Error message */}
                {formError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-start gap-2">
                    <AlertCircle size={13} className="shrink-0 mt-0.5" />
                    {formError}
                  </div>
                )}

                {/* Name field — only shown when editing */}
                {editingMember && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Full Name</label>
                    <input
                      type="text"
                      required
                      value={inviteForm.name}
                      onChange={(e) => { setInviteForm({ ...inviteForm, name: e.target.value }); setFormError(''); }}
                      placeholder="Enter member's full name"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-slate-900 dark:text-white text-sm placeholder:text-slate-500 dark:placeholder:text-slate-600 transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Email Address</label>
                  <input
                    type="email"
                    required
                    value={inviteForm.email}
                    onChange={(e) => { setInviteForm({ ...inviteForm, email: e.target.value }); setFormError(''); }}
                    placeholder="member@company.com"
                    disabled={isSendingInvite}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-slate-900 dark:text-white text-sm placeholder:text-slate-500 dark:placeholder:text-slate-600 transition-all disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Role</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                    disabled={isSendingInvite}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-slate-900 dark:text-white text-sm transition-all appearance-none cursor-pointer disabled:opacity-60"
                  >
                    {ROLES.filter(r => r !== 'All Roles').map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                {/* Info note for new invitations */}
                {!editingMember && (
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-[11px] font-medium flex items-start gap-2">
                    <AlertCircle size={13} className="shrink-0 mt-0.5" />
                    The recipient must have a TaskFlow account. They'll see your invitation in their notification panel.
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => !isSendingInvite && setInviteModalOpen(false)}
                    disabled={isSendingInvite}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-black text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    id="invite-submit-btn"
                    type="submit"
                    disabled={isSendingInvite}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-xs font-black text-white shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2"
                  >
                    {isSendingInvite ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        Sending...
                      </>
                    ) : editingMember ? (
                      'Save Changes'
                    ) : (
                      <>
                        <Send size={12} />
                        Send Invitation
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
