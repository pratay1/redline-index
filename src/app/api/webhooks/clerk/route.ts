import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";
import { getClerkEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
function getUserProfile(data: {
  email_addresses: { email_address: string; id: string }[];
  first_name: string | null;
  last_name: string | null;
  primary_email_address_id: string | null;
}) {
  const primaryEmail = data.email_addresses.find(
    (email) => email.id === data.primary_email_address_id,
  );
  const name = [data.first_name, data.last_name].filter(Boolean).join(" ");
  return { email: primaryEmail?.email_address ?? null, name: name || null };
}
export async function POST(request: NextRequest) {
  try {
    const event = await verifyWebhook(request, {
      signingSecret: getClerkEnv().CLERK_WEBHOOK_SIGNING_SECRET,
    });
    if (event.type === "user.created" || event.type === "user.updated") {
      const profile = getUserProfile(event.data);
      await prisma.user.upsert({
        where: { clerkId: event.data.id },
        create: { clerkId: event.data.id, ...profile },
        update: { ...profile, deletedAt: null },
      });
    }
    if (event.type === "user.deleted" && event.data.id)
      await prisma.user.updateMany({
        where: { clerkId: event.data.id },
        data: { deletedAt: new Date(), email: null, name: null },
      });
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Clerk webhook verification failed", error);
    return NextResponse.json({ error: "Invalid webhook." }, { status: 400 });
  }
}
