import type { errors as cs } from "../cs/errors";

export const errors: typeof cs = {
  INVALID_CREDENTIALS: "Invalid credentials or the login has expired.",
  INTERNAL_SERVER_ERROR: "An internal server error occurred. Please try again later.",
  COURSE_DUPLICATE_CODE: "A course with this code already exists ({{param}}).",
  INVALID_TOKEN: "The token or session has expired. Please log in again.",
  INVALID_STUDENT_SELF_SIGN_KEY: "Invalid student self-sign key.",
  DUPLICATE_FINAL_GRADE: "The student already has a final grade recorded for this course.",
  TEACHER_EMAIL_ALREADY_EXISTS: "A teacher with this e-mail is already registered ({{param}}).",
  DUPLICATE_ATTENDANCE_DAY_SELF_SIGN: "The attendance day already contains a self-sign record for this student.",
  ATTENDANCE_SELF_SIGN_ALREADY_VERIFIED: "The self-sign record has already been verified and cannot be verified again.",
  STUDENT_NOT_IN_COURSE: "The student is not enrolled in this course ({{param}}).",
  NOT_FOUND_COURSE: "Course not found ({{param}}). Try refreshing the page?",
  NOT_FOUND_STUDENT: "Student not found ({{param}}). Try refreshing the page?",
  NOT_FOUND_TEACHER: "Teacher not found ({{param}}). Try refreshing the page?",
  NOT_FOUND_TASK: "Task not found ({{param}}). Try refreshing the page?",
  NOT_FOUND_ATTENDANCE: "Attendance not found ({{param}}). Try refreshing the page?",
  NOT_FOUND_ATTENDANCE_DAY: "Attendance day not found ({{param}}). Try refreshing the page?",
  NOT_FOUND_UNKNOWN: "The requested item of unknown type was not found ({{param}}). Try refreshing the page?",
  PASSWORD_REQUIREMENTS_NOT_FULFILLED: "The password is too weak.",
  CLOUDFLARE_TURNISTILLE_VERIFICATION_ERROR: "Bot verification failed. Please try again.",
};
