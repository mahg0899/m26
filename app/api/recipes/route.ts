import { NextRequest, NextResponse } from "next/server";
import { getPublishedRecipesPaginated } from "@/lib/pocketbase";
import type { TimeFilter, FlavorFilter } from "@/lib/pocketbase";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page    = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const perPage = Math.min(20, Math.max(1, Number(searchParams.get("perPage") ?? "10")));

  const timeRaw   = searchParams.get("time");
  const flavorRaw = searchParams.get("flavor");

  const VALID_TIME:   TimeFilter[]   = ["lt15", "lt30", "gte60"];
  const VALID_FLAVOR: FlavorFilter[] = ["dulce", "salado", "mixto"];

  const timeFilter   = VALID_TIME.includes(timeRaw as TimeFilter)
    ? (timeRaw as TimeFilter) : null;
  const flavorFilter = VALID_FLAVOR.includes(flavorRaw as FlavorFilter)
    ? (flavorRaw as FlavorFilter) : null;

  const data = await getPublishedRecipesPaginated(page, perPage, { timeFilter, flavorFilter });
  return NextResponse.json(data);
}
