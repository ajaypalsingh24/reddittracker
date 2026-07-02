import { NextRequest, NextResponse } from "next/server";
import { scanBrands } from "@/lib/scanner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const summary = await scanBrands(body.brandId);
  return NextResponse.json({ ok: summary.errors.length === 0, summary });
}
