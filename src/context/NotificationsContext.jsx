import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const NotificationsContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function NotificationsProvider({ children }) {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [clickedNotification, setClickedNotification] = useState(null);

  const storageKey = `taskflow_notifications_${user?.email || "guest"}`;

  // Load notifications from localStorage & Server on mount/user identity change
  useEffect(() => {
    if (!token) {
      setNotifications([]);
      return;
    }

    // Load from localStorage first as local cache
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
    } catch (e) {
      setNotifications([]);
    }

    // Load from server
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data.notifications)) {
            setNotifications(data.notifications);
          }
        }
      } catch (err) {
        console.error("Failed to fetch notifications from server:", err);
      }
    };

    fetchNotifications();
  }, [token]);

  // Save to localStorage & Server whenever notifications change
  useEffect(() => {
    if (!token) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(notifications));
    } catch (e) {
      console.error("Failed to save notifications to localStorage", e);
    }

    const saveToServer = async () => {
      try {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/notifications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ notifications })
        });
      } catch (err) {
        console.error("Failed to sync notifications to server:", err);
      }
    };

    const timer = setTimeout(saveToServer, 500);
    return () => clearTimeout(timer);
  }, [notifications, token, storageKey]);

  const saveNotifications = (newNotifs) => {
    setNotifications(newNotifs);
  };

  const getNotificationCategory = (title, message, meta = {}) => {
    if (meta.category) {
      if (meta.category === "due") return "overdueReminders";
      if (meta.category === "weekly") return "weeklySummary";
      if (meta.category === "assignment") return "taskAssignments";
      if (meta.category === "system") return "systemUpdates";
      if (["weeklySummary", "taskAssignments", "overdueReminders", "systemUpdates"].includes(meta.category)) {
        return meta.category;
      }
    }

    const t = (title || "").toLowerCase();
    const m = (message || "").toLowerCase();

    if (t.includes("due") || t.includes("overdue") || t.includes("deadline") || t.includes("⏰") || t.includes("⚠️") || t.includes("⏳")) {
      return "overdueReminders";
    }
    if (t.includes("weekly") || t.includes("summary") || m.includes("weekly summary")) {
      return "weeklySummary";
    }
    if (t.includes("task") || t.includes("assign") || m.includes("assigned")) {
      return "taskAssignments";
    }
    return "systemUpdates";
  };

  const addNotification = (title, message, type = "info", meta = {}) => {
    const settings = user?.notificationSettings || {
      weeklySummary: true,
      taskAssignments: true,
      overdueReminders: true,
      systemUpdates: true,
    };
    const category = getNotificationCategory(title, message, meta);
    if (settings[category] === false) {
      return;
    }

    const newNotif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      message,
      type, // 'info' | 'success' | 'warning' | 'error'
      timestamp: Date.now(),
      read: false,
      ...meta,
    };
    saveNotifications([newNotif, ...notifications]);
  };

  const addUniqueNotification = (uniqueId, { title, message, type = "info", meta = {} }) => {
    const settings = user?.notificationSettings || {
      weeklySummary: true,
      taskAssignments: true,
      overdueReminders: true,
      systemUpdates: true,
    };
    const category = getNotificationCategory(title, message, meta);
    if (settings[category] === false) {
      return;
    }

    setNotifications((prev) => {
      // Check if notification with this unique ID already exists
      if (prev.some((n) => n.id === uniqueId)) {
        return prev;
      }
      const newNotif = {
        id: uniqueId,
        title,
        message,
        type,
        timestamp: Date.now(),
        read: false,
        ...meta,
      };
      return [newNotif, ...prev];
    });
  };

  const markAsRead = (id) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const deleteNotification = (id) => {
    const updated = notifications.filter((n) => n.id !== id);
    saveNotifications(updated);
  };

  const clearAll = () => {
    saveNotifications([]);
  };

  /**
   * Respond to an invitation notification (accept | decline).
   * Calls the server, then marks the local notification as read
   * and updates its invitationStatus so the card shows feedback.
   * Returns { ok: true } on success or { ok: false, message } on error.
   */
  const respondToInvitation = async (invitationId, action) => {
    if (!token) return { ok: false, message: 'Not authenticated' };
    try {
      const response = await fetch(`${API_URL}/invitations/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ invitationId, action }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { ok: false, message: data.message || 'Failed to respond to invitation.' };
      }
      // Update the notification in local state: mark read + record response
      setNotifications((prev) =>
        prev.map((n) => {
          if (n.invitationId === invitationId) {
            return { ...n, read: true, invitationStatus: action };
          }
          return n;
        })
      );
      return { ok: true, data };
    } catch (err) {
      console.error('respondToInvitation error:', err);
      return { ok: false, message: 'Network error.' };
    }
  };

  const syncTasks = (boardTasks) => {
    if (!boardTasks) return;
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    Object.entries(boardTasks).forEach(([boardName, columns]) => {
      if (!columns) return;
      Object.entries(columns).forEach(([colId, col]) => {
        // Skip completed tasks from reminding
        if (colId === "done") return;
        if (!col.tasks) return;

        col.tasks.forEach((task) => {
          if (!task.dueDate) return;

          // Parse dates as local midnight to compare correctly
          const dueDateObj = new Date(task.dueDate + "T00:00:00");
          const todayObj = new Date(todayStr + "T00:00:00");

          const diffTime = dueDateObj.getTime() - todayObj.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          const uniqueKey = `${task.id}_${task.dueDate}_${colId}`;

          if (diffDays < 0) {
            // Overdue
            addUniqueNotification(`task_overdue_${uniqueKey}`, {
              title: "Task Overdue ⚠️",
              message: `"${task.title}" in "${boardName}" is overdue!`,
              type: "error",
              meta: { taskId: task.id, boardName, colId, category: "due" },
            });
          } else if (diffDays === 0) {
            // Due today
            addUniqueNotification(`task_duetoday_${uniqueKey}`, {
              title: "Task Due Today ⏰",
              message: `"${task.title}" in "${boardName}" is due today.`,
              type: "warning",
              meta: { taskId: task.id, boardName, colId, category: "due" },
            });
          } else if (diffDays === 1) {
            // Due tomorrow
            addUniqueNotification(`task_duetomorrow_${uniqueKey}`, {
              title: "Task Due Soon ⏳",
              message: `"${task.title}" in "${boardName}" is due tomorrow.`,
              type: "info",
              meta: { taskId: task.id, boardName, colId, category: "due" },
            });
          }
        });
      });
    });
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        clickedNotification,
        setClickedNotification,
        addNotification,
        addUniqueNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        syncTasks,
        respondToInvitation,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return ctx;
}
