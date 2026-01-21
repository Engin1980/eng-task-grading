import toast from 'react-hot-toast';
import { createLogger } from '../services/log-service';

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
  | "CLOUDFLARE_TURNISTILLE_VERIFICATION_ERROR";

export const ErrorKeyMessages: Record<ErrorKey, string> = {
  INVALID_CREDENTIALS: "Neplatné přihlašovací údaje nebo přihlášení vypršelo.",
  INTERNAL_SERVER_ERROR: "Došlo k vnitřní chybě serveru. Zkuste to prosím později.",
  COURSE_DUPLICATE_CODE: "Kurz s tímto kódem již existuje (%%).",
  INVALID_TOKEN: "Platnost tokenu nebo relace vypršela. Přihlaste se znovu.",
  INVALID_STUDENT_SELF_SIGN_KEY: "Neplatný klíč pro samopřihlášení studenta.",
  DUPLICATE_FINAL_GRADE: "Student již má zapsanou finální známku k danému předmětu.",
  TEACHER_EMAIL_ALREADY_EXISTS: "Učitel s tímto e-mailem je již zaregistrován (%%).",

  NOT_FOUND_COURSE: "Kurz nebyl nalezen (%%). Zkuste obnovit stránku?",
  NOT_FOUND_STUDENT: "Student nebyl nalezen (%%). Zkuste obnovit stránku?",
  NOT_FOUND_TEACHER: "Učitel nebyl nalezen (%%). Zkuste obnovit stránku?",
  NOT_FOUND_TASK: "Úkol nebyl nalezen (%%). Zkuste obnovit stránku?",
  NOT_FOUND_ATTENDANCE: "Záznam o docházce nebyl nalezen (%%). Zkuste obnovit stránku?",
  NOT_FOUND_ATTENDANCE_DAY: "Den docházky nebyl nalezen (%%). Zkuste obnovit stránku?",
  NOT_FOUND_UNKNOWN: "Požadovaná položka neznámého typu nebyla nalezena (%%). Zkuste obnovit stránku?",

  PASSWORD_REQUIREMENTS_NOT_FULFILLED: "Zadané heslo je příliš slabé.",

  CLOUDFLARE_TURNISTILLE_VERIFICATION_ERROR: "Ověření proti botům selhalo. Zkuste to znovu.",
};

function isErrorCode(code: string): code is ErrorKey {
  return code in ErrorKeyMessages;
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
  if (typeof x === 'number' && Object.values(TOAST_ERROR_MESSAGES).includes(x)) {
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

  const convertToastWarnMessageIdToMessage = (messageId: ToastWarnMessageId): string => {
    var ret;
    switch (messageId) {
      case TOAST_WARN_MESSAGES.CAPTCHA_COMPLETION_NEEDED:
        ret = "Prosím dokončete ověření captcha";
        break;
      case TOAST_WARN_MESSAGES.TASK_TITLE_REQUIRED:
        ret = "Název úkolu je povinný.";
        break;
      case TOAST_WARN_MESSAGES.PASSWORDS_DO_NOT_MATCH:
        ret = "Zadaná hesla se neshodují.";
        break;
      case TOAST_WARN_MESSAGES.COURSE_FINAL_GRADE_VALUE_INVALID:
        ret = "Hodnota finální známky musí být číslo mezi 0 a 100.";
        break;
      default:
        ret = "Neznámá toast zpráva";
        break;
    }
    return ret;
  };

  const convertToastSuccessMessageIdToMessage = (messageId: ToastSuccessMessageId): string => {
    var ret;
    switch (messageId) {
      case TOAST_SUCCESS_MESSAGES.LOGIN_SUCCESSFUL:
        ret = "Přihlášení proběhlo úspěšně.";
        break;
      case TOAST_SUCCESS_MESSAGES.LOGOUT_SUCCESSFUL:
        ret = "Odhlášení proběhlo úspěšně.";
        break;
      case TOAST_SUCCESS_MESSAGES.ITEM_CREATED:
        ret = "Položka byla úspěšně vytvořena.";
        break;
      case TOAST_SUCCESS_MESSAGES.ITEM_DELETED:
        ret = "Položka byla úspěšně smazána.";
        break;
      case TOAST_SUCCESS_MESSAGES.ITEM_UPDATED:
        ret = "Položka byla úspěšně upravena.";
        break;
      case TOAST_SUCCESS_MESSAGES.STUDENTS_IMPORTED:
        ret = "Studenti byli úspěšně importováni.";
        break;
      case TOAST_SUCCESS_MESSAGES.SELFSIGN_KEY_SET:
        ret = "Klíč pro samo-zápis byl úspěšně nastaven.";
        break;
      case TOAST_SUCCESS_MESSAGES.SELFSIGN_KEY_DELETED:
        ret = "Klíč pro samo-zápis byl úspěšně smazán.";
        break;
      case TOAST_SUCCESS_MESSAGES.SELFSIGN_KEY_RESOLVED:
        ret = "Samo-zápis byl úspěšně vyřízen.";
        break;
      case TOAST_SUCCESS_MESSAGES.REGISTRATION_SUCCESS:
        ret = "Registrace byla úspěšná. Nyní se můžete přihlásit.";
        break;
      case TOAST_SUCCESS_MESSAGES.ALL_LOGINS_REVOKED:
        ret = "Všechna přihlášení byla úspěšně zrušena.";
        break;
      case TOAST_SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS:
        ret = "Heslo bylo úspěšně resetováno.";
        break;
      default:
        ret = "Neznámá operace byla dokončena úspěšně.";
        break;
    }
    return ret;
  };

  const convertToastErrorMessageIdToMessage = (messageId: ToastErrorMessageId): string => {
    var ret;
    switch (messageId) {
      case TOAST_ERROR_MESSAGES.STUDENTS_IMPORT_FAILED:
        ret = "Chyba při importu studentů.";
        break;
      case TOAST_ERROR_MESSAGES.STUDENTS_IMPORT_ANALYSIS_FAILED:
        ret = "Chyba při analýze textu pro import studentů.";
        break;
      case TOAST_ERROR_MESSAGES.SELFSIGN_KEY_EMPTY:
        ret = "Klíč nesmí být prázdný.";
        break;
      case TOAST_ERROR_MESSAGES.EMAIL_MUST_END_WITH_OSU_CZ:
        ret = "Email musí končit na @osu.cz.";
        break;
      case TOAST_ERROR_MESSAGES.PASSWORD_MIN_LENGTH:
        ret = "Heslo musí mít alespoň 8 znaků.";
        break;
      case TOAST_ERROR_MESSAGES.LOGIN_EXPIRED:
        ret = "Přihlášení vypršelo. Prosím přihlaste se znovu.";
        break;
      case TOAST_ERROR_MESSAGES.REQUEST_TIMEOUT:
        ret = "Vypršel časový limit požadavku. Zkuste to prosím znovu později; případně nahlašte chybu vyučujícímu.";
        break;
      case TOAST_ERROR_MESSAGES.NETWORK_ERROR:
        ret = "Došlo k síťové chybě. Zkontrolujte své připojení k internetu a zkuste to znovu; případně nahlašte chybu vyučujícímu.";
        break;
      default:
        ret = "Došlo k neznámé chybě.";
        break;
    }
    return ret;
  };

  const convertErrorMessageToMessage = (errorKeyString: string | undefined, errorParam: string | undefined): string => {
    let ret;
    const errorKey: ErrorKey | undefined =
      !errorKeyString ? undefined : toErrorCode(errorKeyString);

    if (!errorKey) {
      ret = `Došlo k neznámé chybě (${errorKeyString})`;
    }
    else {
      const msg: string = ErrorKeyMessages[errorKey];
      if (errorParam) {
        ret = msg.replace("%%", errorParam);
      } else {
        ret = msg.replace("%%", "???");
      }
    }
    return ret;
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