import { NextResponse } from "next/server";
import { getPickupPoints } from "@/lib/shipping/pickup-points";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider");
  if (provider !== "OMNIVA" && provider !== "LP_EXPRESS") {
    return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
  }
  const points = await getPickupPoints(provider);
  return NextResponse.json(points, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
