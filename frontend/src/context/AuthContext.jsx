import { createContext, useContext, useEffect, useState } from "react";
import { isSupabaseConfigured, requireSupabase } from "@/lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return undefined; }
    const client = requireSupabase();
    client.auth.getSession().then(({ data: { session } }) => { setUser(session?.user || null); setIsAuthenticated(Boolean(session)); setLoading(false); });
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => { setUser(session?.user || null); setIsAuthenticated(Boolean(session)); setLoading(false); });
    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password });
    if (error) throw error;
    setUser(data.user); setIsAuthenticated(true);
  };

  const logout = async () => {
    const { error } = await requireSupabase().auth.signOut();
    if (error) throw error;
    setUser(null); setIsAuthenticated(false);
  };

  return <AuthContext.Provider value={{ isAuthenticated, user, loading, configured: isSupabaseConfigured, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
