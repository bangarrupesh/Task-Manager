import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  deleteUser
} from "firebase/auth";

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync user with backend
  const syncWithBackend = async (firebaseUser, token) => {
    try {
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to sync user with backend");
      }

      setUser(data);
      setToken(token);
      localStorage.setItem("taskflow_token", token);
      localStorage.setItem("taskflow_user", JSON.stringify(data));
      return data;
    } catch (error) {
      console.error("Backend sync error:", error);
      // Fallback: use local storage if available, otherwise construct dummy user
      const stored = localStorage.getItem("taskflow_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setToken(token);
        return parsed;
      } else {
        const fallbackUser = {
          _id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
          email: firebaseUser.email,
          notificationSettings: {
            weeklySummary: true,
            taskAssignments: true,
            overdueReminders: true,
            systemUpdates: true,
          }
        };
        setUser(fallbackUser);
        setToken(token);
        return fallbackUser;
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        await syncWithBackend(firebaseUser, idToken);
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem("taskflow_token");
        localStorage.removeItem("taskflow_user");
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    return await syncWithBackend(userCredential.user, idToken);
  };

  const signup = async (fullName, email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: fullName });
    const idToken = await userCredential.user.getIdToken();
    return await syncWithBackend(userCredential.user, idToken);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const idToken = await userCredential.user.getIdToken();
    return await syncWithBackend(userCredential.user, idToken);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const deleteAccount = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      if (user?.email) {
        localStorage.removeItem(`taskflow_team_data_${user.email}`);
      }
      localStorage.removeItem("taskflow_user");
      localStorage.removeItem("taskflow_token");
      localStorage.removeItem("taskflow_team_data");
      setUser(null);
      setToken(null);
      await deleteUser(currentUser);
    }
  };

  const updateUser = async (updatedFields) => {
    if (!token) return;
    try {
      // If display name is updated, update it in Firebase auth profile too
      if (updatedFields.name && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: updatedFields.name });
      }

      const response = await fetch(`${API_URL}/auth/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFields),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update user profile");
      }

      setUser(data);
      localStorage.setItem("taskflow_user", JSON.stringify(data));
    } catch (error) {
      console.error("Update user error:", error);
      setUser((prev) => {
        if (!prev) return null;
        const next = { ...prev, ...updatedFields };
        localStorage.setItem("taskflow_user", JSON.stringify(next));
        return next;
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, loginWithGoogle, logout, deleteAccount, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
