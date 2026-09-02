import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const { login, configured } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!configured) { toast.error("Supabase não configurado. Consulte frontend/.env.example."); return; }
    setSubmitting(true);
    try { await login(email, password); navigate("/dashboard"); }
    catch (error) { toast.error(error.message || "Não foi possível entrar."); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 relative">
      <div className="noise-overlay" />
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1462556791646-c201b8241a94?crop=entropy&cs=srgb&fm=jpg&q=85"
          alt="Arquitetura corporativa moderna"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/80" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <h2 className="text-3xl font-bold text-white font-display max-w-md">Gestão comercial e matrículas em um só lugar.</h2>
          <p className="text-slate-300 mt-3 max-w-sm text-sm">Painel do Revendedor · Prime Excelência em Trânsito</p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center p-8 relative z-10">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6" data-testid="login-form">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-600 text-sm font-bold text-white font-display mb-4">PE</div>
            <h1 className="text-2xl font-bold text-slate-50 font-display">Entrar no painel</h1>
            <p className="text-sm text-slate-400 mt-1">Acesso administrativo seguro com e-mail e senha.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="voce@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-900 border-slate-800 text-slate-100"
              data-testid="login-email-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-900 border-slate-800 text-slate-100"
              data-testid="login-password-input"
            />
          </div>
          <Button type="submit" disabled={submitting || !configured} className="w-full bg-indigo-600 hover:bg-indigo-500" data-testid="login-submit-button">
            {submitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
