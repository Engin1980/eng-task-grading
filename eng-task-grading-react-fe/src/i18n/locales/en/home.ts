import type { home as cs } from "../cs/home";

export const home: typeof cs = {
  title: "Grading and attendance system",
  subtitle: "A platform for managing courses, grading students and tracking attendance",
  teachers: {
    title: "For teachers",
    features: [
      "Managing courses and students",
      "Creating tasks and entering grades",
      "Recording and managing attendance",
      "Overviews and statistics of results",
    ],
    login: "Log in as a teacher",
    register: "Register a new teacher",
  },
  students: {
    title: "For students",
    features: [
      "Overview of all your courses",
      "Tracking grades and evaluation",
      "Attendance overview",
      "Verification of your identity and results",
    ],
    login: "Log in as a student",
  },
  warningTitle: "💡 Warning",
  warningText: "In the evening hours (23:00 - 05:00) the system may be partially unavailable due to maintenance.",
  helpTitle: "💡 Help",
  helpText: "If you do not have login credentials, contact your teacher or the system administrator (Marek Vajgl).",
};
