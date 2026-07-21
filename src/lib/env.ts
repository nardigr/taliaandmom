import {
  isEmailConfigured as checkEmailConfigured,
  isTestPaymentProviderEnabled as checkTestPaymentProvider,
  parseEnv,
  type Env,
} from "@/lib/env.schema";

export type { Env };
export { parseEnv, formatEnvError } from "@/lib/env.schema";
export { checkTestPaymentProvider as isTestPaymentProviderEnabled };

export const env = parseEnv();

export function isEmailConfigured() {
  return checkEmailConfigured(env);
}
