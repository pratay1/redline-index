import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/features/auth/authorization";
import { createVehicleSchema } from "@/features/vehicles/schemas";
import { createVehicle } from "@/features/vehicles/service";
import { AppError } from "@/lib/errors";
export async function POST(request: NextRequest) {
  try {
    const payload: unknown = await request.json();
    const input = createVehicleSchema.safeParse(payload);
    if (!input.success)
      return NextResponse.json(
        { error: "Invalid vehicle payload.", details: input.error.flatten() },
        { status: 400 },
      );
    const admin = await requireAdmin();
    const vehicle = await createVehicle(input.data, admin.id);
    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (error) {
    if (error instanceof AppError)
      return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Unable to create vehicle", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
