import { NextResponse } from "next/server";
import { getCardPrints } from "@/lib/scryfall";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ data: [] as Awaited<ReturnType<typeof getCardPrints>> });
  }

  const data = await getCardPrints(q);
  return NextResponse.json({ data });
}
