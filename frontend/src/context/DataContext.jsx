import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as courseService from "@/services/courseService";
import * as studentService from "@/services/studentService";
import * as enrollmentService from "@/services/enrollmentService";
import * as campaignService from "@/services/campaignService";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshAll = useCallback(async () => {
    const [c, s, e, cmp] = await Promise.all([
      courseService.listCourses(),
      studentService.listStudents(),
      enrollmentService.listEnrollments(),
      campaignService.listCampaigns(),
    ]);
    setCourses(c);
    setStudents(s);
    setEnrollments(e);
    setCampaigns(cmp);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const createEnrollment = async (payload) => {
    const enrollment = await enrollmentService.createEnrollment(payload);
    await refreshAll();
    return enrollment;
  };

  const updateEnrollmentStatus = async (id, status) => {
    await enrollmentService.updateStatus(id, status);
    await refreshAll();
  };

  const updateEnrollmentDocuments = async (id, documents) => {
    await enrollmentService.updateDocuments(id, documents);
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

  return (
    <DataContext.Provider
      value={{
        courses,
        students,
        enrollments,
        campaigns,
        loading,
        createEnrollment,
        updateEnrollmentStatus,
        updateEnrollmentDocuments,
        updateCourse,
        updateStudentNotes,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
