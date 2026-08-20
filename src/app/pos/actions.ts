"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutPos() {
  const cookieStore = await cookies();
  cookieStore.delete("pos_session");
  redirect("/pos/login");
}
