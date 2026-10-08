import toast from 'react-hot-toast';
import { createLogger } from '../services/log-service';
import i18n from '../i18n';

type ErrorKey =
  | "INVALID_CREDENTIALS"
  | "INTERNAL_SERVER_ERROR"
  | "COURSE_DUPLICATE_CODE"
  | "INVALID_TOKEN"
  | "INVALID_STUDENT_SELF_SIGN_KEY"
  | "DUPLICATE_FINAL_GRADE"
  | "TEACHER_EMAIL_ALREADY_EXISTS"
  | "NOT_FOUND_COURSE"
  | "NOT_FOUND_STUDENT"
  | "NOT_FOUND_TEACHER"
  | "NOT_FOUND_TASK"
  | "NOT_FOUND_ATTENDANCE"
  | "NOT_FOUND_ATTENDANCE_DAY"
  | "NOT_FOUND_UNKNOWN"
  | "PASSWORD_REQUIREMENTS_NOT_FULFILLED"
  | "DUPLICATE_ATTENDANCE_DAY_SELF_SIGN"
  | "ATTENDANCE_SELF_SIGN_ALREADY_VERIFIED"
  | "STUDENT_NOT_IN_COURSE"
  | "CLOUDFLARE_TURNISTILLE_VERIFICATION_ERROR";

const ERROR_KEYS: readonly ErrorKey[] = [
  "INVALID_CREDENTIALS",
  "INTERNAL_SERVER_ERROR",
  "COURSE_DUPLICATE_CODE",
  "INVALID_TOKEN",
  "INVALID_STUDENT_SELF_SIGN_KEY",
  "DUPLICATE_FINAL_GRADE",
  "TEACHER_EMAIL_ALREADY_EXISTS",
  "NOT_FOUND_COURSE",
  "NOT_FOUND_STUDENT",
  "NOT_FOUND_TEACHER",
  "NOT_FOUND_TASK",
  "NOT_FOUND_ATTENDANCE",
  "NOT_FOUND_ATTENDANCE_DAY",
  "NOT_FOUND_UNKNOWN",
  "PASSWORD_REQUIREMENTS_NOT_FULFILLED",
  "DUPLICATE_ATTENDANCE_DAY_SELF_SIGN",
  "ATTENDANCE_SELF_SIGN_ALREADY_VERIFIED",
  "STUDENT_NOT_IN_COURSE",
  "CLOUDFLARE_TURNISTILLE_VERIFICATION_ERROR",
];

function isErrorCode(code: string): code is ErrorKey {
  return (ERROR_KEYS as readonly string[]).includes(code);
}

function toErrorCode(code: string | null | undefined): ErrorKey | undefined {
  if (code && isErrorCode(code)) {
    return code;
  }
  return undefined;
}

function toToastErrorMessageId(x: any): ToastErrorMessageId | null {
  // Pokud x je přímo klíč (např. "STUDENT_IMPORT_FAILED")
  if (typeof x === 'string' && x in TOAST_ERROR_MESSAGES) {
    return TOAST_ERROR_MESSAGES[x as keyof typeof TOAST_ERROR_MESSAGES];
  }
  if (typeof x === 'number' && Object.values(TOAST_ERROR_MESSAGES).includes(x as ToastErrorMessageId)) {
    return x as ToastErrorMessageId;
  }
  return null;
}

const TOAST_SUCCESS_MESSAGES = {
  LOGIN_SUCCESSFUL: 1,
  LOGOUT_SUCCESSFUL: 2,
  ITEM_CREATED: 3,
  ITEM_UPDATED: 4,
  ITEM_DELETED: 5,
  STUDENTS_IMPORTED: 6,
  SELFSIGN_KEY_SET: 7,
  SELFSIGN_KEY_DELETED: 8,
  SELFSIGN_KEY_RESOLVED: 9,
  REGISTRATION_SUCCESS: 10,
  ALL_LOGINS_REVOKED: 11,
  PASSWORD_RESET_SUCCESS: 12,
} as const;

const TOAST_WARN_MESSAGES = {
  CAPTCHA_COMPLETION_NEEDED: 0,
  TASK_TITLE_REQUIRED: 1,
  PASSWORDS_DO_NOT_MATCH: 2,
  COURSE_FINAL_GRADE_VALUE_INVALID: 3,
} as const;

const TOAST_ERROR_MESSAGES = {
  STUDENTS_IMPORT_FAILED: 0,
  STUDENTS_IMPORT_ANALYSIS_FAILED: 1,
  SELFSIGN_KEY_EMPTY: 2,
  EMAIL_MUST_END_WITH_OSU_CZ: 3,
  PASSWORD_MIN_LENGTH: 4,
  LOGIN_EXPIRED: 5,
  REQUEST_TIMEOUT: 6,
  NETWORK_ERROR: 7,
} as const;

export type ToastSuccessMessageId = typeof TOAST_SUCCESS_MESSAGES[keyof typeof TOAST_SUCCESS_MESSAGES];
export type ToastWarnMessageId = typeof TOAST_WARN_MESSAGES[keyof typeof TOAST_WARN_MESSAGES];
export type ToastErrorMessageId = typeof TOAST_ERROR_MESSAGES[keyof typeof TOAST_ERROR_MESSAGES];


export function useToast() {
  const logger = createLogger("useToast");

  const keyOf = <T extends Record<string, number>>(map: T, id: number): keyof T | undefined =>
    (Object.keys(map) as (keyof T)[]).find((k) => map[k] === id);

  const convertToastWarnMessageIdToMessage = (messageId: ToastWarnMessageId): string =>
    i18n.t(`toast:warn.${keyOf(TOAST_WARN_MESSAGES, messageId) ?? "unknown"}`);

  const convertToastSuccessMessageIdToMessage = (messageId: ToastSuccessMessageId): string =>
    i18n.t(`toast:success.${keyOf(TOAST_SUCCESS_MESSAGES, messageId) ?? "unknown"}`);

  const convertToastErrorMessageIdToMessage = (messageId: ToastErrorMessageId): string =>
    i18n.t(`toast:error.${keyOf(TOAST_ERROR_MESSAGES, messageId) ?? "unknown"}`);

  const convertErrorMessageToMessage = (errorKeyString: string | undefined, errorParam: string | undefined): string => {
    const errorKey: ErrorKey | undefined =
      !errorKeyString ? undefined : toErrorCode(errorKeyString);

    if (!errorKey) {
      return i18n.t("toast:unknownErrorWithKey", { key: errorKeyString });
    }
    return i18n.t(`errors:${errorKey}`, { param: errorParam || "???" });
  }

  const warning = (messageId: ToastWarnMessageId) => {
    const msg = convertToastWarnMessageIdToMessage(messageId);
    toast.loading(msg);
  };

  const success = (messageId: ToastSuccessMessageId) => {
    const msg = convertToastSuccessMessageIdToMessage(messageId);
    toast.success(msg);
  };

  const error = (error: ToastErrorMessageId | any) => {
    logger.debug("Toast error called with:", JSON.stringify(error));
    const toastErrorMessageId = toToastErrorMessageId(error);
    if (toastErrorMessageId) {
      logger.debug("Recognized toast error message id:", toastErrorMessageId);
      const msg = convertToastErrorMessageIdToMessage(error);
      toast.error(msg);
    }
    else if (typeof error === "string") {
      logger.debug("Toast error called as string:", error);
      toast.error(error);
    }
    else {
      logger.debug("Toast error called as unknown object:", JSON.stringify(error));
      const key = (error as any)?.errorKey;
      const errorParam = (error as any)?.param;
      const msg = convertErrorMessageToMessage(key, errorParam);
      toast.error(msg);
    }
  }

  const WRN = TOAST_WARN_MESSAGES;
  const SUC = TOAST_SUCCESS_MESSAGES;
  const ERR = TOAST_ERROR_MESSAGES;

  return { warning, success, error, WRN, SUC, ERR };
}