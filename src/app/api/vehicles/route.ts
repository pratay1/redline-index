import { NextRequest, NextResponse } from "next/server";
import { vehicleListQuerySchema } from "@/features/vehicles/schemas";
import { listPublishedVehicles } from "@/features/vehicles/service";
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = vehicleListQuerySchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    make: searchParams.get("make") ?? undefined,
    year: searchParams.get("year") ?? undefined,
    bodyStyle: searchParams.get("bodyStyle") ?? undefined,
    fuelType: searchParams.get("fuelType") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
  });
  if (!query.success)
    return NextResponse.json(
      { error: "Invalid query parameters.", details: query.error.flatten() },
      { status: 400 },
    );
  const result = await listPublishedVehicles(query.data);
  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
