import type { common as cs } from "../cs/common";

export const common: typeof cs = {
  appName: "Eng Task Grading",
  language: "Language",
  languageName: { cs: "Čeština", en: "English" },
  cancel: "Cancel",
  close: "Close",
  loading: "Loading...",
  loadingError: "Error while loading data",
  retry: "Try again",
  deletePermanently: "Delete permanently",
  deleteVerifyPrompt: "To delete, enter <code>`{{verification}}`</code> and confirm the form:",
  deleteVerifyPlaceholder: "Fill in to confirm...",
  nav: {
    courses: "Courses",
    teacherLogin: "Teacher login",
    studentLogin: "Student login",
    loginManagement: "Login management",
    logout: "Log out",
  },
  rootError: {
    title: "Something went wrong",
    description: "An unexpected error occurred. Please try again.",
    details: "Technical details",
    reload: "Reload page",
    back: "Back",
  },
};
