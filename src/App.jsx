import Landing from "./pages/Landing";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Board from "./pages/Board";
import Settings from "./pages/Settings";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { NotificationsProvider } from "./context/NotificationsContext";
import { Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/board" element={<Board />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </ThemeProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}