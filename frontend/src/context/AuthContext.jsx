import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem("crm_auth") === "true");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("crm_auth_user");
    return raw ? JSON.parse(raw) : null;
  });

  const login = (email) => {
    const fakeUser = { name: email.split("@")[0] || "Revendedor", email };
    localStorage.setItem("crm_auth", "true");
    localStorage.setItem("crm_auth_user", JSON.stringify(fakeUser));
    setUser(fakeUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("crm_auth");
    setIsAuthenticated(false);
  };

  return <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
