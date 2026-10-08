import type { toast as cs } from "../cs/toast";

export const toast: typeof cs = {
  unknownErrorWithKey: "An unknown error occurred ({{key}})",
  warn: {
    CAPTCHA_COMPLETION_NEEDED: "Please complete the captcha verification",
    TASK_TITLE_REQUIRED: "The task title is required.",
    PASSWORDS_DO_NOT_MATCH: "The passwords do not match.",
    COURSE_FINAL_GRADE_VALUE_INVALID: "The final grade value must be a number between 0 and 100.",
    unknown: "Unknown toast message",
  },
  success: {
    LOGIN_SUCCESSFUL: "Login successful.",
    LOGOUT_SUCCESSFUL: "Logout successful.",
    ITEM_CREATED: "The item was created successfully.",
    ITEM_UPDATED: "The item was updated successfully.",
    ITEM_DELETED: "The item was deleted successfully.",
    STUDENTS_IMPORTED: "Students were imported successfully.",
    SELFSIGN_KEY_SET: "The self-sign key was set successfully.",
    SELFSIGN_KEY_DELETED: "The self-sign key was deleted successfully.",
    SELFSIGN_KEY_RESOLVED: "The self-sign was resolved successfully.",
    REGISTRATION_SUCCESS: "Registration successful. You can now log in.",
    ALL_LOGINS_REVOKED: "All logins were revoked successfully.",
    PASSWORD_RESET_SUCCESS: "The password was reset successfully.",
    unknown: "An unknown operation completed successfully.",
  },
  error: {
    STUDENTS_IMPORT_FAILED: "Error while importing students.",
    STUDENTS_IMPORT_ANALYSIS_FAILED: "Error while analysing the text for student import.",
    SELFSIGN_KEY_EMPTY: "The key must not be empty.",
    EMAIL_MUST_END_WITH_OSU_CZ: "The email must end with @osu.cz.",
    PASSWORD_MIN_LENGTH: "The password must be at least 8 characters long.",
    LOGIN_EXPIRED: "Your login has expired. Please log in again.",
    REQUEST_TIMEOUT: "The request timed out. Please try again later; or report the problem to your teacher.",
    NETWORK_ERROR: "A network error occurred. Check your internet connection and try again; or report the problem to your teacher.",
    unknown: "An unknown error occurred.",
  },
};
