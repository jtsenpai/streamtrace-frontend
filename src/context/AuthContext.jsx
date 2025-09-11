import { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin, refresh as apiRefresh, getMe } from "../lib/api";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      setReady(true);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => logout())
      .finally(() => setReady(true));
  }, []);

  function saveTokens({ access, refresh }) {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
  }

  async function login(username, password) {
    const tokens = await apiLogin(username, password);
    saveTokens(tokens);
    const me = await getMe();
    setUser(me);
    return me;
  }

  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  }

  return (
    <AuthCtx.Provider value={{ user, login, logout, ready }}>
      {children}
    </AuthCtx.Provider>
  );
}
