// app/api/webhooks/clerk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    // Sử dụng verifyWebhook của Clerk thay vì Svix trực tiếp
    const evt = await verifyWebhook(req);
    
    const { id } = evt.data;
    const eventType = evt.type;

    switch (eventType) {
      case "user.created":
        await handleUserCreated(evt.data);
        break;
      case "user.updated":
        await handleUserUpdated(evt.data);
        break;
      case "user.deleted":
        await handleUserDeleted(evt.data);
        break;
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Error verifying webhook" }, { status: 400 });
  }
}

async function handleUserCreated(userData: any) {
  const { id, email_addresses, first_name, last_name, public_metadata } = userData;
  const email = email_addresses[0]?.email_address;
  const fullName = `${first_name || ""} ${last_name || ""}`.trim() || "Unknown";
  const role = (public_metadata?.role || "USER").toUpperCase();

  await db
    .insert(users)
    .values({
      clerkId: id,
      fullName,
      email,
      role,
      status: "PENDING",
      lastActivityDate: new Date(),
      createdAt: new Date(),
      isActive: true,
    })
    .onConflictDoNothing({ target: users.clerkId });

  console.log(`User created: ${email}`);
}

async function handleUserUpdated(userData: any) {
  const { id, email_addresses, first_name, last_name, public_metadata } = userData;
  const email = email_addresses[0]?.email_address;
  const fullName = `${first_name || ""} ${last_name || ""}`.trim() || "Unknown";
  const role = (public_metadata?.role || "USER").toUpperCase();

  await db
    .update(users)
    .set({
      fullName,
      email,
      role,
      updatedAt: new Date(),
    })
    .where(eq(users.clerkId, id));

  console.log(`User updated: ${email}`);
}

async function handleUserDeleted(userData: any) {
  const { id } = userData;

  await db
    .update(users)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(users.clerkId, id));

  console.log(`User deleted: ${id}`);
}