import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("admin-access-token", "", { maxAge: 0, path: "/" });
  res.cookies.set("admin-refresh-token", "", { maxAge: 0, path: "/" });
  return res;
}
