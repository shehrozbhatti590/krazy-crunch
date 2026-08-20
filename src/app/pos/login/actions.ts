"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface LoginState {
  error: string;
}

export async function verifyPin(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const pin = String(formData.get("pin") ?? "").trim();
  const correctPin = process.env.POS_PIN;
  const sessionSecret = process.env.POS_SESSION_SECRET;

  if (!correctPin || !sessionSecret) {
    return {
      error:
        "POS is not configured yet. Set POS_PIN and POS_SESSION_SECRET in your environment.",
    };
  }

  if (pin !== correctPin) {
    return { error: "Incorrect PIN. Try again." };
  }

  const cookieStore = await cookies();
  cookieStore.set("pos_session", sessionSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/pos");
}
