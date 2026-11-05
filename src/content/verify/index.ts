import type { VerifySpec } from "../types";
import { spec as s1 } from "./m1";
import { spec as s2 } from "./m2";
import { spec as s3 } from "./m3";
import { spec as s4 } from "./m4";
import { spec as s5 } from "./m5";
import { spec as s6 } from "./m6";
import { spec as s7 } from "./m7";
import { spec as s8 } from "./m8";
import { spec as s9 } from "./m9";
import { spec as s10 } from "./m10";
import { spec as sBrain } from "./brainteasers";

export const VERIFY_SPECS: VerifySpec = {
  ...s1,
  ...s2,
  ...s3,
  ...s4,
  ...s5,
  ...s6,
  ...s7,
  ...s8,
  ...s9,
  ...s10,
  ...sBrain,
};
