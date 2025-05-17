import { z } from "zod";

export const signUpSchema = z.object( {
    fullName: z.string().min(3, {
        message: "Vui lòng nhập tên của bạn",
    }),
    email: z
        .string()
        .min(1, {
        message: "Vui lòng nhập email của bạn",
        })
        .email({
        message: "Email không hợp lệ",
        }),
    password: z
        .string()
        .min(6, {
        message: "Mật khẩu phải có ít nhất 6 ký tự",
        })
        .max(32, {
        message: "Mật khẩu không được vượt quá 32 ký tự",
        }),
});

export const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});