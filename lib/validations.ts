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
    title: z.string().trim().min(2, "Tên sách phải có ít nhất 2 ký tự").max(100, "Tên sách không được quá 100 ký tự"),
    author: z.string().trim().min(2, "Tên tác giả phải có ít nhất 2 ký tự").max(100, "Tên tác giả không được quá 100 ký tự"),
    primarySpecialty: z.string().min(1, "Vui lòng chọn chuyên ngành chính"),
    relatedSpecialties: z.array(z.string()).default([]), // Bỏ optional(), chỉ dùng default
    detail: z.string().trim().min(1, "Chi tiết không được để trống").max(500, "Chi tiết không được quá 500 ký tự"),
    predictDate: z.string().optional().default(""), // Có thể để trống nếu sách đã hoàn thành
    preorder: z.boolean().default(false),
    availableCopies: z.coerce.number().int().nonnegative().default(0), // Cho phép 0, không bắt buộc positive
    isbn: z.string().optional().default(""),
    description: z.string().max(1000, "Mô tả không được quá 1000 ký tự").optional().default(""),
    coverUrl: z.string().default(""), // Bỏ nonempty(), cho phép để trống ban đầu
    coverColor: z.string().default("").refine((val) => {
        // Cho phép trống hoặc phải đúng format hex color
        return val === "" || /^#[0-9A-F]{6}$/i.test(val);
    }, {
        message: "Màu phải có định dạng hex (ví dụ: #FF0000)"
    }),
    pdfUrl: z.string().default(""), // Bỏ nonempty(), cho phép để trống ban đầu
    content: z.string().default(""),
    // Thêm các field mới
    isCompleted: z.boolean().default(true),
    colorPrice: z.coerce.number().nonnegative().default(0),
    photoPrice: z.coerce.number().nonnegative().default(0),
    hasColorSale: z.boolean().default(false),
    colorSaleAmount: z.coerce.number().nonnegative().default(0), // Bỏ optional, dùng default
}).refine((data) => {
    // Validation logic: nếu sách chưa hoàn thành thì predictDate là bắt buộc
    if (!data.isCompleted && (!data.predictDate || data.predictDate.trim() === "")) {
        return false;
    }
    return true;
}, {
    message: "Ngày dự kiến ra mắt là bắt buộc khi sách chưa hoàn thành",
    path: ["predictDate"]
}).refine((data) => {
    // Validation logic: nếu có sale thì colorSaleAmount phải > 0
    if (data.hasColorSale && data.colorSaleAmount <= 0) {
        return false;
    }
    return true;
}, {
    message: "Số tiền giảm giá phải lớn hơn 0 khi có sale",
    path: ["colorSaleAmount"]
}).refine((data) => {
    // Validation logic: số tiền sale không được vượt quá giá gốc
    if (data.hasColorSale && data.colorSaleAmount >= data.colorPrice) {
        return false;
    }
    return true;
}, {
    message: "Số tiền giảm giá không được bằng hoặc vượt quá giá gốc",
    path: ["colorSaleAmount"]
}).refine((data) => {
    // Validation logic: chuyên ngành chính không được trùng với chuyên ngành liên quan
    if (data.primarySpecialty && data.relatedSpecialties.includes(data.primarySpecialty)) {
        return false;
    }
    return true;
}, {
    message: "Chuyên ngành chính không được trùng với chuyên ngành liên quan",
    path: ["relatedSpecialties"]
}).refine((data) => {
    // Validation logic: nếu sách đã hoàn thành hoặc cho phép preorder thì phải có giá
    if ((data.isCompleted || data.preorder) && data.colorPrice <= 0 && data.photoPrice <= 0) {
        return false;
    }
    return true;
}, {
    message: "Phải nhập ít nhất một loại giá (màu hoặc photo) khi sách đã hoàn thành hoặc cho phép đặt trước",
    path: ["colorPrice"]
});