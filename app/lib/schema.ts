import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("STAFF"), // ADMIN, TEKNISI, STAFF
  department: text("department"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const tickets = sqliteTable("tickets", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("MEDIUM"), // LOW, MEDIUM, HIGH, CRITICAL
  status: text("status").notNull().default("OPEN"), // OPEN, IN_PROGRESS, CLOSED
  imageUrl: text("image_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  categoryId: text("category_id").notNull().references(() => categories.id),
  createdById: text("created_by_id").notNull().references(() => users.id),
  assignedToId: text("assigned_to_id").references(() => users.id),
});

export const comments = sqliteTable("comments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  ticketId: text("ticket_id").notNull().references(() => tickets.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id),
});

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  link: text("link"),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});
