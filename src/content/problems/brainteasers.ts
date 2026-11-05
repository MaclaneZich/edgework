import type { Problem } from "../types";
import { problems as a } from "./brainteasersA";
import { problems as b } from "./brainteasersB";

/** Brainteaser bank (kind: "brainteaser", module 9). */
export const problems: Problem[] = [...a, ...b];
