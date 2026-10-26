import { NextResponse } from "next/server";
import { autocompleteCardNames } from "@/lib/scryfall";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ data: [] as string[] });
  }

  const data = await autocompleteCardNames(q);
  return NextResponse.json({ data });
}
