import { NextRequest, NextResponse } from "next/server";
import { scanBrands } from "@/lib/scanner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return false;
  }

  const auth = request.headers.get("authorization") || "";
  const headerSecret = request.headers.get("x-cron-secret") || "";
  const querySecret = request.nextUrl.searchParams.get("secret") || "";

  return auth === `Bearer ${secret}` || headerSecret === secret || querySecret === secret;
}

async function handleCron(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const summary = await scanBrands();
  return NextResponse.json({
    ok: summary.errors.length === 0,
    ranAt: new Date().toISOString(),
    summary,
  });
}

export async function GET(request: NextRequest) {
  return handleCron(request);
}

export async function POST(request: NextRequest) {
  return handleCron(request);
}
