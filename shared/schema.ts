import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table with role-based access
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("customer"), // customer, vendor, admin, superadmin
  name: text("name").notNull(),
  phone: text("phone"),
  city: text("city"),
  state: text("state"),
  membershipPlan: text("membership_plan").default("basic"), // basic, premium, ultimate
  membershipExpiry: timestamp("membership_expiry"),
  isPromotionalUser: boolean("is_promotional_user").default(false),
  totalSavings: decimal("total_savings", { precision: 10, scale: 2 }).default("0"),
  dealsClaimed: integer("deals_claimed").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// Vendors table for business information
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  businessName: text("business_name").notNull(),
  gstNumber: text("gst_number"),
  panNumber: text("pan_number").notNull(),
  logoUrl: text("logo_url"),
  description: text("description"),
  address: text("address"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  isApproved: boolean("is_approved").default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalDeals: integer("total_deals").default(0),
  totalRedemptions: integer("total_redemptions").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Deals table
export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // fashion, electronics, travel, food, home, fitness
  subcategory: text("subcategory"), // For hierarchical categories like Services
  imageUrl: text("image_url"),
  discountPercentage: integer("discount_percentage").notNull(),

  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  discountedPrice: decimal("discounted_price", { precision: 10, scale: 2 }),
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until").notNull(),
  maxRedemptions: integer("max_redemptions"),
  currentRedemptions: integer("current_redemptions").default(0),
  isActive: boolean("is_active").default(true),
  isApproved: boolean("is_approved").default(false),
  approvedBy: integer("approved_by").references(() => users.id),
  viewCount: integer("view_count").default(0),
  requiredMembership: text("required_membership").default("basic"), // basic, premium, ultimate
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  verificationPin: text("verification_pin").notNull(), // 4-digit PIN for offline verification
  createdAt: timestamp("created_at").defaultNow(),
});

// Deal claims/redemptions
export const dealClaims = pgTable("deal_claims", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  dealId: integer("deal_id").references(() => deals.id).notNull(),
  claimedAt: timestamp("claimed_at").defaultNow(),
  usedAt: timestamp("used_at"),
  savingsAmount: decimal("savings_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("claimed"), // claimed, used, expired, pending, completed
  billAmount: decimal("bill_amount", { precision: 10, scale: 2 }), // Total bill amount entered by customer
  actualSavings: decimal("actual_savings", { precision: 10, scale: 2 }), // Calculated savings based on bill amount
});

// Help tickets
export const helpTickets = pgTable("help_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").default("open"), // open, in_progress, resolved, closed
  priority: text("priority").default("medium"), // low, medium, high, urgent
  assignedTo: integer("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Wishlist table for user favorites
export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  dealId: integer("deal_id").references(() => deals.id).notNull(),
  addedAt: timestamp("added_at").defaultNow(),
});

// System logs
export const systemLogs = pgTable("system_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  details: json("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// POS Sessions for tracking active POS terminals
export const posSessions = pgTable("pos_sessions", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  terminalId: text("terminal_id").notNull(), // unique identifier for each POS terminal
  sessionToken: text("session_token").notNull().unique(),
  isActive: boolean("is_active").default(true),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  totalTransactions: integer("total_transactions").default(0),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).default("0"),
});

// POS Transactions for detailed transaction tracking
export const posTransactions = pgTable("pos_transactions", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => posSessions.id).notNull(),
  dealId: integer("deal_id").references(() => deals.id).notNull(),
  customerId: integer("customer_id").references(() => users.id),
  transactionType: text("transaction_type").notNull(), // claim, redeem, refund
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  savingsAmount: decimal("savings_amount", { precision: 10, scale: 2 }).notNull(),
  pinVerified: boolean("pin_verified").default(false),
  paymentMethod: text("payment_method"), // cash, card, upi, wallet
  status: text("status").default("completed"), // pending, completed, failed, refunded
  receiptNumber: text("receipt_number").unique(),
  notes: text("notes"),
  processedAt: timestamp("processed_at").defaultNow(),
});

// POS Inventory for tracking deal availability at terminals
export const posInventory = pgTable("pos_inventory", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  dealId: integer("deal_id").references(() => deals.id).notNull(),
  availableQuantity: integer("available_quantity").notNull(),
  reservedQuantity: integer("reserved_quantity").default(0),
  reorderLevel: integer("reorder_level").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  vendor: one(vendors, { fields: [users.id], references: [vendors.userId] }),
  dealClaims: many(dealClaims),
  helpTickets: many(helpTickets),
  systemLogs: many(systemLogs),
  wishlists: many(wishlists),
}));

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  user: one(users, { fields: [vendors.userId], references: [users.id] }),
  deals: many(deals),
}));

export const dealsRelations = relations(deals, ({ one, many }) => ({
  vendor: one(vendors, { fields: [deals.vendorId], references: [vendors.id] }),
  approver: one(users, { fields: [deals.approvedBy], references: [users.id] }),
  claims: many(dealClaims),
  wishlists: many(wishlists),
}));

export const dealClaimsRelations = relations(dealClaims, ({ one }) => ({
  user: one(users, { fields: [dealClaims.userId], references: [users.id] }),
  deal: one(deals, { fields: [dealClaims.dealId], references: [deals.id] }),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, { fields: [wishlists.userId], references: [users.id] }),
  deal: one(deals, { fields: [wishlists.dealId], references: [deals.id] }),
}));

export const posSessionsRelations = relations(posSessions, ({ one, many }) => ({
  vendor: one(vendors, { fields: [posSessions.vendorId], references: [vendors.id] }),
  transactions: many(posTransactions),
}));

export const posTransactionsRelations = relations(posTransactions, ({ one }) => ({
  session: one(posSessions, { fields: [posTransactions.sessionId], references: [posSessions.id] }),
  deal: one(deals, { fields: [posTransactions.dealId], references: [deals.id] }),
  customer: one(users, { fields: [posTransactions.customerId], references: [users.id] }),
}));

export const posInventoryRelations = relations(posInventory, ({ one }) => ({
  vendor: one(vendors, { fields: [posInventory.vendorId], references: [vendors.id] }),
  deal: one(deals, { fields: [posInventory.dealId], references: [deals.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
});

export const insertDealSchema = createInsertSchema(deals).omit({
  id: true,
  createdAt: true,
  currentRedemptions: true,
  viewCount: true,
});

export const insertDealClaimSchema = createInsertSchema(dealClaims).omit({
  id: true,
  claimedAt: true,
});

export const insertHelpTicketSchema = createInsertSchema(helpTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSystemLogSchema = createInsertSchema(systemLogs).omit({
  id: true,
  createdAt: true,
});

export const insertWishlistSchema = createInsertSchema(wishlists).omit({
  id: true,
  addedAt: true,
});

export const insertPosSessionSchema = createInsertSchema(posSessions).omit({
  id: true,
  startedAt: true,
  totalTransactions: true,
  totalAmount: true,
});

export const insertPosTransactionSchema = createInsertSchema(posTransactions).omit({
  id: true,
  processedAt: true,
});

export const insertPosInventorySchema = createInsertSchema(posInventory).omit({
  id: true,
  lastUpdated: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Deal = typeof deals.$inferSelect;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type DealClaim = typeof dealClaims.$inferSelect;
export type InsertDealClaim = z.infer<typeof insertDealClaimSchema>;
export type HelpTicket = typeof helpTickets.$inferSelect;
export type InsertHelpTicket = z.infer<typeof insertHelpTicketSchema>;
export type SystemLog = typeof systemLogs.$inferSelect;
export type InsertSystemLog = z.infer<typeof insertSystemLogSchema>;
export type Wishlist = typeof wishlists.$inferSelect;
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
export type PosSession = typeof posSessions.$inferSelect;
export type InsertPosSession = z.infer<typeof insertPosSessionSchema>;
export type PosTransaction = typeof posTransactions.$inferSelect;
export type InsertPosTransaction = z.infer<typeof insertPosTransactionSchema>;
export type PosInventory = typeof posInventory.$inferSelect;
export type InsertPosInventory = z.infer<typeof insertPosInventorySchema>;

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  role: z.enum(["customer", "vendor"]).default("customer"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

// Profile update schemas
export const updateUserProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export const updateVendorProfileSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters").optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  logoUrl: z.string().url("Invalid URL").optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type UpdateVendorProfile = z.infer<typeof updateVendorProfileSchema>;
