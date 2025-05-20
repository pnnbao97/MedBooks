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

export const bookSchema = z.object({
    title: z.string().trim().min(2).max(100),
    author: z.string().trim().min(2).max(100),
    genre: z.string().trim().min(2).max(50),
    rating: z.number().min(1).max(5),
    progress: z.number().min(0).max(100),
    preorder: z.boolean(),
    price: z.number().nonnegative().optional(),
    totalCopies: z.coerce.number().int().positive(),
    isbn: z.string().optional(),
    description: z.string().max(1000).optional(),
    coverUrl: z.string().nonempty(),
    coverColor: z.string().trim().regex(/^#[0-9A-F]{6}$/i),
    pdfUrl: z.string().nonempty(),
    content: z.string(),
})