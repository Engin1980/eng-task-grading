import type { cs } from "../cs";
import { auth } from "./auth";
import { common } from "./common";
import { courses } from "./courses";
import { errors } from "./errors";
import { home } from "./home";
import { toast } from "./toast";

export const en: typeof cs = { auth, common, courses, errors, home, toast };
