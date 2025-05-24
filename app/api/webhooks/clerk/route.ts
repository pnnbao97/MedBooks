// app/api/webhooks/clerk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";

// Thêm phương thức GET để Vercel có thể kiểm tra endpoint
export async function GET() {
  return NextResponse.json({ message: "Clerk webhook endpoint is active" });
}

export async function POST(req: NextRequest) {
  try {
    // Log để debug
    console.log("Webhook received:", req.method);
    
    // Lấy headers để debug
    const headers = Object.fromEntries(req.headers.entries());
    console.log("Headers:", headers);

    // Sử dụng verifyWebhook của Clerk thay vì Svix trực tiếp
    const evt = await verifyWebhook(req);
    
    const { id } = evt.data;
    const eventType = evt.type;

    console.log(`Processing event: ${eventType} for user: ${id}`);

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

    return NextResponse.json({ success: true, eventType });
  } catch (error) {
    console.error("Error processing webhook:", error);
    
    // Log chi tiết lỗi để debug
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    return NextResponse.json(
      { 
        error: "Error verifying webhook",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 400 }
    );
  }
}

async function handleUserCreated(userData: any) {
  try {
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

    console.log(`User created successfully: ${email}`);
  } catch (error) {
    console.error("Error in handleUserCreated:", error);
    throw error;
  }
}

async function handleUserUpdated(userData: any) {
  try {
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

    console.log(`User updated successfully: ${email}`);
  } catch (error) {
    console.error("Error in handleUserUpdated:", error);
    throw error;
  }
}

async function handleUserDeleted(userData: any) {
  try {
    const { id } = userData;

    await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.clerkId, id));

    console.log(`User deleted successfully: ${id}`);
  } catch (error) {
    console.error("Error in handleUserDeleted:", error);
    throw error;
  }
}