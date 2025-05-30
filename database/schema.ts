// schema.ts - Fixed schema with consistent data types
import { integer, varchar, text, timestamp, pgTable, uuid, pgEnum, date, boolean, jsonb, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const STATUS_ENUM = pgEnum('status', ['PENDING', 'APPROVED', 'REJECTED']);
export const ROLE_ENUM = pgEnum('role', ['USER', 'ADMIN']);
export const ORDER_STATUS_ENUM = pgEnum('order_status', ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']);
export const PAYMENT_METHOD_ENUM = pgEnum('payment_method', ['COD', 'BANKING', 'MOMO', 'ZALOPAY', 'VNPAY', 'PAYPAL']);
export const PAYMENT_STATUS_ENUM = pgEnum('payment_status', ['PENDING', 'PAID', 'FAILED', 'REFUNDED']);
export const GENDER_ENUM = pgEnum('gender', ['MALE', 'FEMALE', 'OTHER']);

export const users = pgTable("users", {
  // Use clerkId as primary key instead of UUID
  clerkId: varchar("clerk_id", { length: 255 }).notNull().primaryKey().unique(),
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
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.clerkId, { onDelete: "cascade" }),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  birthDate: date("birth_date"),
  gender: GENDER_ENUM("gender"),
  occupation: varchar("occupation", { length: 255 }),
  preferences: jsonb("preferences"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const usersRelations = relations(users, ({ one }) => ({
  profile: one(userProfiles, {
    fields: [users.clerkId],
    references: [userProfiles.userId],
  }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.clerkId],
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
  userId: varchar('user_id', { length: 255 }) // ✅ Changed from uuid to varchar
    .notNull()
    .references(() => users.clerkId, { onDelete: 'cascade' }), // ✅ Reference clerkId
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
    references: [users.clerkId], // ✅ Updated
  }),
  book: one(books, {
    fields: [carts.bookId],
    references: [books.id],
  }),
}));

// Updated orders table
export const orders = pgTable("orders", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.clerkId, { onDelete: "restrict" }), // ✅ Changed
  
  // Shipping information
  shippingAddressId: integer('shipping_address_id').references(() => shippingAddresses.id),
  shippingFullName: varchar('shipping_full_name', { length: 255 }).notNull(),
  shippingPhone: varchar('shipping_phone', { length: 20 }).notNull(),
  shippingEmail: varchar('shipping_email', { length: 255 }),
  shippingAddress: text('shipping_address').notNull(),
  shippingCity: varchar('shipping_city', { length: 100 }).notNull(),
  shippingDistrict: varchar('shipping_district', { length: 100 }).notNull(),
  shippingWard: varchar('shipping_ward', { length: 100 }),
  
  // Order totals
  subtotal: integer("subtotal").notNull(), // Tạm tính
  shippingFee: integer("shipping_fee").notNull().default(0),
  couponDiscount: integer("coupon_discount").notNull().default(0),
  totalAmount: integer("total_amount").notNull(),
  
  // Coupon information
  couponId: integer('coupon_id').references(() => coupons.id),
  couponCode: varchar('coupon_code', { length: 50 }),
  
  // Payment information
  paymentMethod: PAYMENT_METHOD_ENUM("payment_method").notNull(),
  paymentStatus: PAYMENT_STATUS_ENUM("payment_status").notNull().default("PENDING"),
  paymentTransactionId: varchar("payment_transaction_id", { length: 255 }),
  transactionId: text('transaction_id'),
  // Order status and notes
  status: ORDER_STATUS_ENUM("status").notNull().default("PENDING"),
  notes: text('notes'),
  
  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  shippedAt: timestamp("shipped_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
});

// Order items table (for multiple items per order)
export const orderItems = pgTable('order_items', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  bookId: integer('book_id').notNull().references(() => books.id, { onDelete: 'restrict' }),
  quantity: integer('quantity').notNull(),
  version: varchar('version', { length: 10 }).notNull().$type<'color' | 'photo'>(),
  unitPrice: integer('unit_price').notNull(), // Giá tại thời điểm đặt hàng
  totalPrice: integer('total_price').notNull(), // unitPrice * quantity
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.clerkId], // ✅ Updated
  }),
  coupon: one(coupons, {
    fields: [orders.couponId],
    references: [coupons.id],
  }),
  shippingAddress: one(shippingAddresses, {
    fields: [orders.shippingAddressId],
    references: [shippingAddresses.id],
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  book: one(books, {
    fields: [orderItems.bookId],
    references: [books.id],
  }),
}));


export const coupons = pgTable('coupons', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  description: varchar('description', { length: 255 }),
  discountType: varchar('discount_type', { length: 20 }).notNull().$type<'PERCENTAGE' | 'FIXED'>(),
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: integer('min_order_amount').default(0),
  maxDiscountAmount: integer('max_discount_amount'),
  usageLimit: integer('usage_limit'),
  usedCount: integer('used_count').default(0),
  isActive: boolean('is_active').default(true),
  validFrom: timestamp('valid_from').notNull(),
  validTo: timestamp('valid_to').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Shipping addresses table
export const shippingAddresses = pgTable('shipping_addresses', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.clerkId, { onDelete: 'cascade' }), // ✅ Changed
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  email: varchar('email', { length: 255 }),
  address: text('address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  district: varchar('district', { length: 100 }).notNull(),
  ward: varchar('ward', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const couponsRelations = relations(coupons, ({ many }) => ({
  orders: many(orders),
}));

export const shippingAddressesRelations = relations(shippingAddresses, ({ one, many }) => ({
  user: one(users, {
    fields: [shippingAddresses.userId],
    references: [users.clerkId], // ✅ Updated
  }),
  orders: many(orders),
}));