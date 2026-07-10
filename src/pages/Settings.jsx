import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import BoardHeader from "../components/BoardHeader";
import SettingsView from "../components/SettingsView";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

export default function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [boards, setBoards] = useState(
    location.state?.boards || [
      { name: "Main Project", color: "#6366f1", starred: false },
    ]
  );
  const [selectedBoard, setSelectedBoard] = useState(
    location.state?.selectedBoard || boards[0]
  );

  const handleActiveNavChange = (nav) => {
    if (nav !== "settings") {
      navigate("/board", { state: { activeNav: nav, boards, selectedBoard } });
    }
  };

  const handleToggleStarBoard = (boardName) => {
    setBoards((prev) =>
      prev.map((b) =>
        b.name === boardName ? { ...b, starred: !b.starred } : b
      )
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate("/signin", { replace: true });
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans transition-colors">
      <Sidebar
        activeNav="settings"
        setActiveNav={handleActiveNavChange}
        user={user}
        onLogout={handleLogout}
        boards={boards}
        onNewBoard={() => navigate("/board", { state: { activeNav: "board", boards, selectedBoard, openNewBoardModal: true } })}
        selectedBoard={selectedBoard}
        onSelectBoard={(board) => navigate("/board", { state: { activeNav: "board", boards, selectedBoard: board } })}
        onToggleStarBoard={handleToggleStarBoard}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <BoardHeader
          boardName="Settings"
          theme={theme}
          setTheme={toggleTheme}
          activeNav="settings"
        />

        <main className="flex-1 overflow-x-auto overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35 }}
            className="h-full"
          >
            <SettingsView
              user={user}
              theme={theme}
              toggleTheme={toggleTheme}
            />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
