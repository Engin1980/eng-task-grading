import type { cs } from "../cs";
import { admin } from "./admin";
import { attendances } from "./attendances";
import { auth } from "./auth";
import { common } from "./common";
import { courses } from "./courses";
import { errors } from "./errors";
import { grades } from "./grades";
import { home } from "./home";
import { student } from "./student";
import { tasks } from "./tasks";
import { toast } from "./toast";

export const en: typeof cs = { admin, attendances, auth, common, courses, errors, grades, home, student, tasks, toast };
