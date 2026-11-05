import type { VerifySpec } from "../types";
import { spec as a } from "./brainteasersA";
import { spec as b } from "./brainteasersB";

export const spec: VerifySpec = { ...a, ...b };
