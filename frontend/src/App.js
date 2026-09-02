import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import { Toaster } from "@/components/ui/sonner";
import Layout from "@/components/layout/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import NewEnrollment from "@/pages/enrollment-wizard/NewEnrollment";
import Enrollments from "@/pages/Enrollments";
import EnrollmentDetail from "@/pages/EnrollmentDetail";
import Students from "@/pages/Students";
import StudentDetail from "@/pages/StudentDetail";
import Courses from "@/pages/Courses";
import Campaigns from "@/pages/Campaigns";
import Reports from "@/pages/Reports";
import "@/App.css";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-950 p-8 text-sm text-slate-400">Restaurando sessão...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Toaster position="top-right" richColors />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="matriculas" element={<Enrollments />} />
              <Route path="matriculas/nova" element={<NewEnrollment />} />
              <Route path="matriculas/:id" element={<EnrollmentDetail />} />
              <Route path="alunos" element={<Students />} />
              <Route path="alunos/:id" element={<StudentDetail />} />
              <Route path="cursos" element={<Courses />} />
              <Route path="campanhas" element={<Campaigns />} />
              <Route path="relatorios" element={<Reports />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
