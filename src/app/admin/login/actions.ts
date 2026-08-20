"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface LoginState {
  error: string;
}

export async function verifyAdminPin(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const pin = String(formData.get("pin") ?? "").trim();
  const correctPin = process.env.ADMIN_PIN;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!correctPin || !sessionSecret) {
    return {
      error:
        "Admin panel is not configured yet. Set ADMIN_PIN and ADMIN_SESSION_SECRET in your environment.",
    };
  }

  if (pin !== correctPin) {
    return { error: "Incorrect PIN. Try again." };
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_session", sessionSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/admin");
}
