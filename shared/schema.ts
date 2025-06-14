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
  imageUrl: text("image_url"),
  discountPercentage: integer("discount_percentage").notNull(),
  discountCode: text("discount_code"),
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
  status: text("status").default("claimed"), // claimed, used, expired
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
