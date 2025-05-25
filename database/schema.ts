// schema.ts - Fixed schema with consistent data types
import { integer, varchar, text, timestamp, pgTable, uuid, pgEnum, date, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const STATUS_ENUM = pgEnum('status', ['PENDING', 'APPROVED', 'REJECTED']);
export const ROLE_ENUM = pgEnum('role', ['USER', 'ADMIN']);
export const ORDER_STATUS_ENUM = pgEnum('order_status', ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']);
export const PAYMENT_METHOD_ENUM = pgEnum('payment_method', ['MOMO', 'ZALOPAY', 'VNPAY', 'PAYPAL']);
export const GENDER_ENUM = pgEnum('gender', ['MALE', 'FEMALE', 'OTHER']);

export const users = pgTable("users", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: text("email").notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  status: STATUS_ENUM("status").default("PENDING"),
  role: ROLE_ENUM("role").default("USER"),
  lastActivityDate: date("last_activity_date").defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  birthDate: date("birth_date"),
  gender: GENDER_ENUM("gender"),
  occupation: varchar("occupation", { length: 255 }),
  preferences: jsonb("preferences"), // Store JSON preferences
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const books = pgTable("books", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  
  // Thông tin cơ bản
  title: varchar("title", { length: 100 }).notNull(), // Giảm từ 255 xuống 100 theo schema
  slug: varchar('slug', { length: 255 }).notNull().unique(), 
  author: varchar("author", { length: 100 }).notNull(), // Giảm từ 255 xuống 100 theo schema
  primarySpecialty: varchar("primary_specialty", { length: 100 }).notNull(), // Thay đổi từ category
  relatedSpecialties: text("related_specialties").array().default([]), // Mảng chuyên ngành liên quan
  relatedBooks: text("related_books").array().default([]), // Mảng sách liên quan
  detail: text("detail").notNull(), // Thay đổi từ description, max 500 ký tự
  description: varchar("description", { length: 1000 }), // Mô tả ngắn, tối da 100 ký tự
  content: text("content"), // Mục lục sách
  
  // Thông tin số lượng và ISBN
  availableCopies: integer("available_copies").notNull().default(0), // Thay đổi từ stock
  isbn: varchar("isbn", { length: 50 }),
  
  // Thông tin file và hình ảnh
  coverUrl: varchar("cover_url", { length: 2048 }).default(""), // Thay đổi từ imageUrl
  coverColor: varchar("cover_color", { length: 7 }).default(""), // Hex color code
  pdfUrl: varchar("pdf_url", { length: 2048 }).default(""),
  previewImages: text("preview_images").array().default([]), // Tối đa 6 trang xem trước
  
  // Trạng thái sách
  isCompleted: boolean("is_completed").notNull().default(true),
  
  // Thông tin đặt trước
  preorder: boolean("preorder").notNull().default(false),
  predictDate: varchar("predict_date", { length: 50 }), // Ngày dự kiến ra mắt
  
  // Thông tin giá (thay đổi từ price duy nhất)
  colorPrice: integer("color_price").notNull().default(0), // Giá bản màu
  photoPrice: integer("photo_price").notNull().default(0), // Giá bản photo
  
  // Thông tin sale cho bản màu
  hasColorSale: boolean("has_color_sale").notNull().default(false),
  colorSaleAmount: integer("color_sale_amount").notNull().default(0),
  
  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const carts = pgTable('carts', {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid('user_id') // FIXED: Changed from integer to uuid
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  bookId: integer('book_id')
    .notNull()
    .references(() => books.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(1),
  version: varchar('version', { length: 10 })
    .notNull()
    .default('color')
    .$type<'color' | 'photo'>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const cartsRelations = relations(carts, ({ one }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [carts.bookId],
    references: [books.id],
  }),
}));

export const orders = pgTable("orders", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  bookId: integer("book_id").notNull().references(() => books.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull().default(1),
  amount: integer("amount").notNull(),
  paymentMethod: PAYMENT_METHOD_ENUM("payment_method").notNull(),
  paymentTransactionId: varchar("payment_transaction_id", { length: 255 }),
  status: ORDER_STATUS_ENUM("status").notNull().default("PENDING"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});