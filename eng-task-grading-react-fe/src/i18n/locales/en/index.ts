import type { cs } from "../cs";
import { auth } from "./auth";
import { common } from "./common";
import { errors } from "./errors";
import { toast } from "./toast";

export const en: typeof cs = { auth, common, errors, toast };
