import { NextResponse } from "next/server";
import { getCardPriceTrend } from "@/lib/pokewallet";

const UNAVAILABLE =
  "Prisudvikling er midlertidigt utilgængelig. Prøv igen senere.";

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
    console.error(
      "Price trend unavailable: POKEWALLET_KEY is not configured.",
    );
    return NextResponse.json(
      {
        ...result,
        error: "unavailable",
        message: UNAVAILABLE,
      },
      { status: 503 },
    );
  }

  return NextResponse.json(result);
}
