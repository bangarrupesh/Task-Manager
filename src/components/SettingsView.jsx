import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Lock, Bell, Moon, Sun,
  Globe, Shield, Trash2, Camera, ChevronRight,
  Monitor, Smartphone, Check, Eye, EyeOff,
  Calendar, Clock
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export default function SettingsView({ user = {}, theme, toggleTheme }) {
  const { updateUser, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [username, setUsername] = useState(user?.name || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpdatePassword = () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }
    if (!newPassword) {
      setPasswordError('New password is required.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }

    const storedPassword = user?.password || 'password123';
    if (currentPassword !== storedPassword) {
      setPasswordError('Current password is incorrect.');
      return;
    }

    if (updateUser) {
      updateUser({ password: newPassword });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
    }
  };

  useEffect(() => {
    if (user?.name) {
      setUsername(user.name);
    }
    if (user?.hasOwnProperty('profileImage')) {
      setProfileImage(user.profileImage);
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Moon },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full gap-8 overflow-hidden">
      {/* Sidebar Tabs */}
      <div className="w-full lg:w-64 space-y-1">
        <h2 className="px-4 mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Account Settings</h2>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === tab.id
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400'
              }`}
          >
            <tab.icon size={18} />
            {tab.label}
            {activeTab === tab.id && <ChevronRight size={14} className="ml-auto opacity-50" />}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
        <div className="max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 lg:p-10 shadow-sm relative overflow-hidden">
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] -mr-32 -mt-32 rounded-full pointer-events-none" />

          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">Profile Details</h3>
                  <p className="text-sm text-slate-500">Update your photo and personal information.</p>
                </div>

                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-blue-600/20 overflow-hidden">
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        user?.name?.[0]?.toUpperCase() || 'U'
                      )}
                    </div>
                    <button
                      onClick={() => setIsCameraOpen(true)}
                      className="absolute -bottom-2 -right-2 p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-all cursor-pointer group-hover:scale-110"
                    >
                      <Camera size={16} />
                    </button>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2">Profile Picture</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-blue-600/20"
                      >
                        Upload New
                      </button>
                      <button
                        onClick={() => setProfileImage(null)}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-black hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black capitalize text-slate-400 ml-1">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black capitalize text-slate-400 ml-1">Email Address</label>
                    <input
                      type="email"
                      value={user?.email || 'user@example.com'}
                      disabled
                      className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-75 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-4">
                  <button
                    onClick={() => {
                      if (updateUser) {
                        updateUser({
                          name: username,
                          profileImage: profileImage
                        });
                        setSaveSuccess(true);
                        setTimeout(() => setSaveSuccess(false), 3000);
                      }
                    }}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-black transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                  >
                    Save Changes
                  </button>
                  <AnimatePresence>
                    {saveSuccess && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="text-emerald-500 font-bold text-sm flex items-center gap-1.5"
                      >
                        <Check size={16} />
                        Profile updated successfully!
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">Appearance</h3>
                  <p className="text-sm text-slate-500">Customize how TaskFlow looks for you.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => theme === 'dark' && toggleTheme()}
                    className={`relative p-4 rounded-3xl border-2 transition-all text-left ${theme !== 'dark'
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10'
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'
                      }`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
                      <Sun size={20} />
                    </div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">Light Mode</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Default Clean Look</p>
                    {theme !== 'dark' && <div className="absolute top-4 right-4 text-blue-500"><Check size={18} /></div>}
                  </button>

                  <button
                    onClick={() => theme !== 'dark' && toggleTheme()}
                    className={`relative p-4 rounded-3xl border-2 transition-all text-left ${theme === 'dark'
                      ? 'border-blue-500 bg-blue-600/10'
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'
                      }`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                      <Moon size={20} />
                    </div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">Dark Mode</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Protects your eyes</p>
                    {theme === 'dark' && <div className="absolute top-4 right-4 text-blue-500"><Check size={18} /></div>}
                  </button>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">Language Selection</h4>
                  <div className="relative">
                    <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-10 py-4 text-sm font-bold text-slate-700 dark:text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500">
                      <option>English (US)</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">Security & Login</h3>
                  <p className="text-sm text-slate-500">Manage your password and authentication methods.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black capitalize text-slate-400 ml-1">Current Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                          setPasswordError('');
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-12 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(prev => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                      >
                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black capitalize text-slate-400 ml-1">New Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPasswordError('');
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-12 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(prev => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {passwordError && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex gap-3 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-wider items-center">
                      <AlertCircle size={16} className="text-red-500 shrink-0" />
                      {passwordError}
                    </div>
                  )}

                  <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl flex gap-3">
                    <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-500 leading-relaxed">
                      Make sure your new password is at least 8 characters long.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-4">
                  <button
                    onClick={handleUpdatePassword}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-black transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                  >
                    Update Password
                  </button>
                  <AnimatePresence>
                    {passwordSuccess && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="text-emerald-500 font-bold text-sm flex items-center gap-1.5"
                      >
                        <Check size={16} />
                        Password updated successfully!
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">Notification Settings</h3>
                  <p className="text-sm text-slate-500">Choice how and when you want to be notified.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'weeklySummary', label: 'Weekly Summary', desc: 'Get a summary of your team productivity every Monday.', icon: Calendar },
                    { key: 'taskAssignments', label: 'Task Assignments', desc: 'Notify me when someone assigns a task to me.', icon: User },
                    { key: 'overdueReminders', desc: 'Remind me about tasks that are nearing their deadline.', icon: Clock, label: 'Overdue Reminders' },
                    { key: 'systemUpdates', label: 'System Updates', desc: 'Notify me about system updates, maintenance, and features.', icon: Bell },
                  ].map((notif) => {
                    const settings = user?.notificationSettings || {
                      weeklySummary: true,
                      taskAssignments: true,
                      overdueReminders: true,
                      systemUpdates: true,
                    };
                    return (
                      <div key={notif.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800/50 hover:border-blue-500/30 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                            <notif.icon size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{notif.label}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{notif.desc}</p>
                          </div>
                        </div>
                        <NotifToggle
                          checked={settings[notif.key] !== false}
                          onChange={(checked) => {
                            if (updateUser) {
                              updateUser({
                                notificationSettings: {
                                  ...settings,
                                  [notif.key]: checked,
                                },
                              });
                            }
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'privacy' && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">Privacy & Data</h3>
                  <p className="text-sm text-slate-500">Manage how your data is handled and who can see your profile.</p>
                </div>

                <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-3xl">
                  <div className="flex items-center gap-3 text-red-600 mb-4">
                    <Trash2 size={20} />
                    <h4 className="font-black">Danger Zone</h4>
                  </div>
                  <p className="text-xs text-red-700 dark:text-red-500/80 mb-6 leading-relaxed">
                    Once you delete your account, there is no going back. Please be certain. All your projects, tasks, and team history will be permanently removed.
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-black transition-all shadow-lg shadow-red-600/20 active:scale-95"
                  >
                    Delete Account
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(img) => { setProfileImage(img); setIsCameraOpen(false); }}
      />

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
            onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md"
            >
              {/* Modal Header */}
              <div className="p-6 pb-0">
                <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                  <Trash2 size={24} className="text-red-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Delete Account</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  This action is <span className="font-bold text-red-600">permanent and irreversible</span>. All your projects, tasks, team history, and settings will be permanently deleted.
                </p>
              </div>

              {/* Confirm Input */}
              <div className="p-6">
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">
                  Type <span className="text-red-600">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:border-red-500 transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  autoFocus
                />
              </div>

              {/* Modal Footer */}
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                  className="flex-1 px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirmText === 'DELETE') {
                      setIsDeleting(true);
                      setTimeout(() => {
                        deleteAccount();
                        navigate('/signin');
                      }, 600);
                    }
                  }}
                  disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                  className={`flex-1 px-5 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 ${deleteConfirmText === 'DELETE' && !isDeleting
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 cursor-pointer'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    }`}
                >
                  {isDeleting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Deleting...
                    </span>
                  ) : 'Delete Forever'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotifToggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0 ${checked
        ? 'bg-blue-500 dark:bg-violet-500'
        : 'bg-slate-300 dark:bg-slate-600'
        }`}
    >
      <span
        className={`inline-block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0.5'
          }`}
      />
    </button>
  );
}

const AlertCircle = ({ size, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

function CameraModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Camera access denied or unavailabe: ", err);
          alert("Could not access the camera. Please ensure permissions are granted.");
          onClose();
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      onCapture(dataUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-black text-slate-900 dark:text-white">Take Profile Picture</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="relative bg-black aspect-video flex-1 flex items-center justify-center">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        </div>
        <div className="p-6 flex justify-center bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleCapture}
            className="w-16 h-16 rounded-full bg-blue-600 border-[4px] border-blue-200 dark:border-blue-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all outline-none"
          >
            <Camera size={24} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
