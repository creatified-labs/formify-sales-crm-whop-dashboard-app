import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { validateToken } from "@whop-apps/sdk";

export async function GET() {
  try {
    const h = headers();
    const headerObj = Object.fromEntries(h.entries());
    const result = await validateToken({ headers: headerObj });
    const userId = (result as any)?.userId ?? null;

    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    return NextResponse.json({ authenticated: true, userId });
  } catch (e) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
}
