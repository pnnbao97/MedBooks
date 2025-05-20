// app/api/upload-auth/route.ts
import { getUploadAuthParams } from "@imagekit/next/server";
import { NextResponse } from "next/server";
import config from "@/lib/config";

export async function GET() {
  try {
    // Logic xác thực người dùng (nếu cần)
    // Ví dụ: kiểm tra session, token, v.v.

    const { token, expire, signature } = getUploadAuthParams({
      privateKey: config.env.imagekit.privateKey,
      publicKey: config.env.imagekit.publicKey,
    });

    return NextResponse.json({
      token,
      expire,
      signature,
      publicKey: config.env.imagekit.publicKey,
    });
  } catch (error) {
    console.error("Error generating auth params:", error);
    return NextResponse.json(
      { error: "Failed to generate auth parameters" },
      { status: 500 }
    );
  }
}