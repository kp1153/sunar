import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name"),
  status: text("status").notNull().default("trial"),
  expiryDate: text("expiry_date"),
  reminderSent: integer("reminder_sent").default(0),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const rates = sqliteTable("rates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  metal: text("metal").notNull(),
  purity: text("purity"),
  price: real("price").notNull(),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

export const girvi = sqliteTable("girvi", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  itemDetails: text("item_details").notNull(),
  weightGrams: real("weight_grams"),
  loanAmount: integer("loan_amount").notNull(),
  interestRate: real("interest_rate").notNull(),
  status: text("status").notNull().default("active"),
  entryDate: text("entry_date").$defaultFn(() => new Date().toISOString()),
  closeDate: text("close_date"),
});

export const karigars = sqliteTable("karigars", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const karigarWork = sqliteTable("karigar_work", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  karigarId: integer("karigar_id").notNull(),
  description: text("description").notNull(),
  metalType: text("metal_type").notNull(),
  issuedWeight: real("issued_weight").notNull(),
  returnedWeight: real("returned_weight"),
  wastageWeight: real("wastage_weight"),
  labourCharge: real("labour_charge"),
  status: text("status").notNull().default("pending"),
  issuedAt: text("issued_at").$defaultFn(() => new Date().toISOString()),
  returnedAt: text("returned_at"),
});

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().unique(),
  shopName: text("shop_name"),
  ownerName: text("owner_name"),
  phone: text("phone"),
  address: text("address"),
  gstin: text("gstin"),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

export const bills = sqliteTable("bills", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  billNumber: text("bill_number").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  item: text("item").notNull(),
  metalType: text("metal_type").notNull(),
  purity: text("purity").notNull(),
  grossWeight: real("gross_weight"),
  netWeight: real("net_weight").notNull(),
  ratePerTen: real("rate_per_ten").notNull(),
  metalValue: real("metal_value").notNull(),
  makingCharge: real("making_charge").notNull().default(0),
  gst: real("gst").notNull(),
  totalAmount: real("total_amount").notNull(),
  paymentMode: text("payment_mode").notNull().default("नकद"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const preActivations = sqliteTable("pre_activations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});