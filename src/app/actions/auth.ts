"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

export type LoginState = { error?: string };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Neteisingas el. paštas arba slaptažodis" };
    }
    throw error; // successful sign-in redirects by throwing
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
