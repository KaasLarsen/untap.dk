import { NextResponse } from "next/server";
import { getCardPriceTrend } from "@/lib/pokewallet";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json(
      {
        configured: true,
        query: q,
        cardName: null,
        setName: null,
        points: [],
        error: "query_too_short",
        message: "Søg med mindst 2 tegn.",
      },
      { status: 400 },
    );
  }

  const result = await getCardPriceTrend(q);

  if (!result.configured) {
    return NextResponse.json(
      {
        ...result,
        error: "missing_key",
        message: "Pristrends er midlertidigt utilgængelige.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json(result);
}
