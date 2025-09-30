import { createContext, useContext } from "react";
import type { StudentViewCourseDto } from "../model/student-view-dto";

export const StudentViewDataContext = createContext<StudentViewCourseDto | null>(null);
export const useStudentViewData = () => useContext(StudentViewDataContext);