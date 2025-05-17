"use server";

import { signIn } from "@/auth";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import ratelimit from "@/lib/ratelimit";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signInWithCredentials = async (
    params: Pick<AuthCredentials, 'email' | 'password'>
) => {
    const { email, password } = params;

    const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
    const { success } = await ratelimit.limit(ip);

    if(!success) return redirect("/too-fast")

    try {
        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        })
        if(result?.error) {
            return { success: false, error: result.error };
        }
        return {success: true};
    } catch(error) {
        console.log(error, "Đăng nhập thất bại");
        return { success: false, error: "Đăng nhập thất bại"};
    }
}

export const signUp = async (params: AuthCredentials) => {
    const { fullName, email, password } = params;

    const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
    const { success } = await ratelimit.limit(ip);

    if(!success) return redirect("/too-fast")

    const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
    
    if (existingUser.length > 0 ) {
        return { success: false, error: "Email người dùng đã tồn tại"}
    }

    const hashedPassword = await hash(password, 10);

    try {
        await db.insert(users).values( {
            fullName,
            email,
            password: hashedPassword,
        })

        await signInWithCredentials({ email, password });

        return { success: true }; 
    } catch (error) {
        console.log(error, "Lỗi đăng ký");
        return {success: false, error: "Lỗi đăng ký"};
    }
};