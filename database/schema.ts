import { integer, varchar, text, timestamp, pgTable, uuid, pgEnum, date } from "drizzle-orm/pg-core";

export const STATUS_ENUM = pgEnum('status', ['PENDING', 'APPROVED', 'REJECTED']);
export const ROLE_ENUM = pgEnum('role', ['USER', 'ADMIN']);
export const ORDER_STATUS_ENUM = pgEnum('order_status', ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']);
export const PAYMENT_METHOD_ENUM = pgEnum('payment_method', ['MOMO', 'ZALOPAY', 'VNPAY', 'PAYPAL']);

export const users = pgTable("users", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: text("email").notNull().unique(),
  password: text('password').notNull(),
  status: STATUS_ENUM('status').default('PENDING'),
  role: ROLE_ENUM('role').default('USER'),
  lastActivityDate: date('last_activity_date').defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const books = pgTable("books", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title", { length: 255 }).notNull(),
  price: integer("price").notNull(),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 2048 }),
  category: varchar("category", { length: 100 }),
  author: varchar("author", { length: 255 }),
  stock: integer("stock").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const carts = pgTable("carts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bookId: integer("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

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