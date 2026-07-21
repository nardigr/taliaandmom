"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { t } from "@/lib/i18n/sq";

export type LoginState = {
  error?: string;
};

export async function adminLoginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: t.loginFailed };
    }
    throw error;
  }

  return { error: t.loginFailed };
}
