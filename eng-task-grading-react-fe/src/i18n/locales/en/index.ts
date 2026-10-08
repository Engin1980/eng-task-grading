import type { cs } from "../cs";
import { auth } from "./auth";
import { common } from "./common";
import { courses } from "./courses";
import { errors } from "./errors";
import { grades } from "./grades";
import { home } from "./home";
import { tasks } from "./tasks";
import { toast } from "./toast";

export const en: typeof cs = { auth, common, courses, errors, grades, home, tasks, toast };
