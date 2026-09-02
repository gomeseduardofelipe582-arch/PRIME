import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as courseService from "@/services/courseService";
import * as studentService from "@/services/studentService";
import * as enrollmentService from "@/services/enrollmentService";
import * as campaignService from "@/services/campaignService";
import * as sourceService from "@/services/sourceService";
import * as settingsService from "@/services/settingsService";
import { useAuth } from "@/context/AuthContext";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { isAuthenticated, configured } = useAuth();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [leadSources, setLeadSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schoolWhatsapp, setSchoolWhatsapp] = useState("5548996726611");

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
    const [c, s, e, cmp, sources, schoolSetting] = await Promise.all([
      courseService.listCourses(),
      studentService.listStudents(),
      enrollmentService.listEnrollments(),
      campaignService.listCampaigns(),
      sourceService.listLeadSources(),
      settingsService.getAppSetting("school_whatsapp"),
    ]);
    setCourses(c);
    setStudents(s);
    setEnrollments(e);
    setCampaigns(cmp);
    setLeadSources(sources);
    const configuredPhone = typeof schoolSetting === "string" ? schoolSetting : schoolSetting?.phone;
    if (configuredPhone) setSchoolWhatsapp(String(configuredPhone).replace(/\D/g, ""));
    } catch (nextError) {
      setError(nextError);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!configured || !isAuthenticated) { setLoading(false); return; }
    refreshAll();
  }, [configured, isAuthenticated, refreshAll]);

  const createEnrollment = async (payload) => {
    const enrollment = await enrollmentService.createEnrollment(payload);
    await refreshAll();
    return enrollment;
  };

  const updateEnrollmentStatus = async (id, status) => {
    await enrollmentService.updateStatus(id, status);
    await refreshAll();
  };

  const updateEnrollmentDocuments = async (id, documents, documentRecords) => {
    await enrollmentService.updateDocuments(id, documents, documentRecords);
    await refreshAll();
  };

  const updateCourse = async (id, patch) => {
    await courseService.updateCourse(id, patch);
    await refreshAll();
  };

  const updateStudentNotes = async (id, notes) => {
    await studentService.updateStudent(id, { notes });
    await refreshAll();
  };

  const findStudentByCpf = (cpf) => studentService.findStudentByCpf(cpf);

  return (
    <DataContext.Provider
      value={{
        courses,
        students,
        enrollments,
        campaigns,
        leadSources,
        schoolWhatsapp,
        loading,
        error,
        refreshAll,
        createEnrollment,
        updateEnrollmentStatus,
        updateEnrollmentDocuments,
        updateCourse,
        updateStudentNotes,
        findStudentByCpf,
      }}
    >
      {error && <div role="alert" className="fixed right-4 top-4 z-50 max-w-md rounded-lg border border-rose-400/30 bg-rose-950 px-4 py-3 text-sm text-rose-100 shadow-xl">{error.message || "Não foi possível carregar os dados. Tente entrar novamente."}</div>}
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
