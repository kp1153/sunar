import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ग्राहकों का खाता (CRM)
export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone").unique(),
  address: text("address"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

// स्टॉक और इन्वेंटरी
export const items = sqliteTable("items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(), // जैसे: 'सोने का हार', 'चांदी की पायल'
  category: text("category").notNull(), // Gold / Silver / Diamond
  purity: text("purity"), // 22k, 18k, 916
  grossWeight: real("gross_weight"), 
  netWeight: real("net_weight"),
  huid: text("huid"),
  status: text("status").$default(() => "स्टॉक में"), // स्टॉक में, बिक गया
});

// गिरवी का हिसाब (Mortgage)
export const girvi = sqliteTable("girvi", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").references(() => customers.id),
  itemDetails: text("item_details").notNull(),
  loanAmount: integer("loan_amount").notNull(), // कितना पैसा दिया
  interestRate: real("interest_rate").notNull(), // ब्याज दर (% प्रति माह)
  entryDate: text("entry_date").$defaultFn(() => new Date().toISOString()),
});