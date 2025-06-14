import { 
  users, vendors, deals, dealClaims, helpTickets, systemLogs,
  type User, type InsertUser, type Vendor, type InsertVendor,
  type Deal, type InsertDeal, type DealClaim, type InsertDealClaim,
  type HelpTicket, type InsertHelpTicket, type SystemLog, type InsertSystemLog
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;

  // Vendor operations
  getVendor(id: number): Promise<Vendor | undefined>;
  getVendorByUserId(userId: number): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, updates: Partial<Vendor>): Promise<Vendor | undefined>;
  getAllVendors(): Promise<Vendor[]>;
  getPendingVendors(): Promise<Vendor[]>;
  approveVendor(id: number): Promise<Vendor | undefined>;

  // Deal operations
  getDeal(id: number): Promise<Deal | undefined>;
  getDealsBy(filters: Partial<Deal>): Promise<Deal[]>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDeal(id: number, updates: Partial<Deal>): Promise<Deal | undefined>;
  deleteDeal(id: number): Promise<boolean>;
  getActiveDeals(): Promise<Deal[]>;
  getDealsByCategory(category: string): Promise<Deal[]>;
  getDealsByVendor(vendorId: number): Promise<Deal[]>;
  getPendingDeals(): Promise<Deal[]>;
  approveDeal(id: number, approvedBy: number): Promise<Deal | undefined>;
  incrementDealViews(id: number): Promise<void>;

  // Deal claim operations
  claimDeal(claim: InsertDealClaim): Promise<DealClaim>;
  getUserClaims(userId: number): Promise<DealClaim[]>;
  getDealClaims(dealId: number): Promise<DealClaim[]>;
  updateClaimStatus(id: number, status: string, usedAt?: Date): Promise<DealClaim | undefined>;

  // Help ticket operations
  createHelpTicket(ticket: InsertHelpTicket): Promise<HelpTicket>;
  getHelpTickets(): Promise<HelpTicket[]>;
  getUserHelpTickets(userId: number): Promise<HelpTicket[]>;
  updateHelpTicket(id: number, updates: Partial<HelpTicket>): Promise<HelpTicket | undefined>;

  // System log operations
  createSystemLog(log: InsertSystemLog): Promise<SystemLog>;
  getSystemLogs(limit?: number): Promise<SystemLog[]>;

  // Analytics operations
  getAnalytics(): Promise<{
    totalUsers: number;
    totalVendors: number;
    totalDeals: number;
    totalClaims: number;
    revenueEstimate: number;
    cityStats: Array<{ city: string; dealCount: number; userCount: number }>;
    categoryStats: Array<{ category: string; dealCount: number; claimCount: number }>;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private vendors: Map<number, Vendor> = new Map();
  private deals: Map<number, Deal> = new Map();
  private dealClaims: Map<number, DealClaim> = new Map();
  private helpTickets: Map<number, HelpTicket> = new Map();
  private systemLogs: Map<number, SystemLog> = new Map();
  
  private currentUserId = 1;
  private currentVendorId = 1;
  private currentDealId = 1;
  private currentDealClaimId = 1;
  private currentHelpTicketId = 1;
  private currentSystemLogId = 1;

  constructor() {
    this.initializeWithSampleData();
  }

  private initializeWithSampleData() {
    // Create admin user
    const adminUser: User = {
      id: this.currentUserId++,
      username: "admin",
      email: "admin@instoredealz.com",
      password: "$2a$10$example", // In real app, this would be hashed
      role: "admin",
      name: "Admin User",
      phone: "+91-9876543210",
      city: "Mumbai",
      state: "Maharashtra",
      membershipPlan: "ultimate",
      membershipExpiry: new Date("2025-12-31"),
      isPromotionalUser: false,
      totalSavings: "0",
      dealsClaimed: 0,
      createdAt: new Date(),
      isActive: true,
    };
    this.users.set(adminUser.id, adminUser);

    // Create sample customer
    const customerUser: User = {
      id: this.currentUserId++,
      username: "customer1",
      email: "customer@example.com",
      password: "$2a$10$example",
      role: "customer",
      name: "Rajesh Kumar",
      phone: "+91-9876543211",
      city: "Mumbai",
      state: "Maharashtra",
      membershipPlan: "premium",
      membershipExpiry: new Date("2026-08-14"), // Promotional expiry
      isPromotionalUser: true,
      totalSavings: "45230",
      dealsClaimed: 47,
      createdAt: new Date(),
      isActive: true,
    };
    this.users.set(customerUser.id, customerUser);

    // Create sample vendor user
    const vendorUser: User = {
      id: this.currentUserId++,
      username: "vendor1",
      email: "vendor@example.com",
      password: "$2a$10$example",
      role: "vendor",
      name: "Fashion Hub Owner",
      phone: "+91-9876543212",
      city: "Mumbai",
      state: "Maharashtra",
      membershipPlan: "basic",
      membershipExpiry: null,
      isPromotionalUser: false,
      totalSavings: "0",
      dealsClaimed: 0,
      createdAt: new Date(),
      isActive: true,
    };
    this.users.set(vendorUser.id, vendorUser);

    // Create sample vendor
    const vendor: Vendor = {
      id: this.currentVendorId++,
      userId: vendorUser.id,
      businessName: "Fashion Hub",
      gstNumber: "27AABCU9603R1ZX",
      panNumber: "AABCU9603R",
      logoUrl: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=200&h=200&fit=crop",
      description: "Premium fashion retailer with latest trends",
      address: "Shop 123, Mall Road",
      city: "Mumbai",
      state: "Maharashtra",
      isApproved: true,
      rating: "4.8",
      totalDeals: 12,
      totalRedemptions: 345,
      createdAt: new Date(),
    };
    this.vendors.set(vendor.id, vendor);

    // Create sample deals
    const deal1: Deal = {
      id: this.currentDealId++,
      vendorId: vendor.id,
      title: "Winter Collection Sale - 30% Off",
      description: "Get 30% off on all winter clothing including jackets, sweaters, and more",
      category: "fashion",
      imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=400&fit=crop",
      discountPercentage: 30,
      discountCode: "WINTER30",
      originalPrice: "4000",
      discountedPrice: "2800",
      validFrom: new Date(),
      validUntil: new Date("2025-03-31"),
      maxRedemptions: 100,
      currentRedemptions: 47,
      isActive: true,
      isApproved: true,
      approvedBy: adminUser.id,
      viewCount: 1234,
      requiredMembership: "basic",
      createdAt: new Date(),
    };
    this.deals.set(deal1.id, deal1);

    // Add more sample deals
    const deal2: Deal = {
      id: this.currentDealId++,
      vendorId: vendor.id,
      title: "Electronics Mega Sale - 50% Off",
      description: "Huge discounts on laptops, smartphones, and accessories",
      category: "electronics",
      imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop",
      discountPercentage: 50,
      discountCode: "TECH50",
      originalPrice: "50000",
      discountedPrice: "25000",
      validFrom: new Date(),
      validUntil: new Date("2025-02-28"),
      maxRedemptions: 50,
      currentRedemptions: 23,
      isActive: true,
      isApproved: true,
      approvedBy: adminUser.id,
      viewCount: 856,
      requiredMembership: "premium",
      createdAt: new Date(),
    };
    this.deals.set(deal2.id, deal2);

    // Sample deal claims
    const claim1: DealClaim = {
      id: this.currentDealClaimId++,
      userId: customerUser.id,
      dealId: deal1.id,
      claimedAt: new Date("2024-12-15"),
      usedAt: new Date("2024-12-16"),
      savingsAmount: "1200",
      status: "used",
    };
    this.dealClaims.set(claim1.id, claim1);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      membershipPlan: insertUser.membershipPlan || "basic",
      totalSavings: "0",
      dealsClaimed: 0,
      createdAt: new Date(),
      isActive: true,
      // Check if user should get promotional plan
      isPromotionalUser: new Date() >= new Date("2025-08-15") && new Date() <= new Date("2026-08-14"),
      membershipExpiry: new Date() >= new Date("2025-08-15") && new Date() <= new Date("2026-08-14") 
        ? new Date("2026-08-14") 
        : null,
    };
    
    // If promotional user, upgrade to premium
    if (user.isPromotionalUser) {
      user.membershipPlan = "premium";
    }
    
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  // Vendor operations
  async getVendor(id: number): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }

  async getVendorByUserId(userId: number): Promise<Vendor | undefined> {
    return Array.from(this.vendors.values()).find(vendor => vendor.userId === userId);
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const id = this.currentVendorId++;
    const vendor: Vendor = {
      ...insertVendor,
      id,
      isApproved: false,
      rating: "0",
      totalDeals: 0,
      totalRedemptions: 0,
      createdAt: new Date(),
    };
    this.vendors.set(id, vendor);
    return vendor;
  }

  async updateVendor(id: number, updates: Partial<Vendor>): Promise<Vendor | undefined> {
    const vendor = this.vendors.get(id);
    if (!vendor) return undefined;
    
    const updatedVendor = { ...vendor, ...updates };
    this.vendors.set(id, updatedVendor);
    return updatedVendor;
  }

  async getAllVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values());
  }

  async getPendingVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values()).filter(vendor => !vendor.isApproved);
  }

  async approveVendor(id: number): Promise<Vendor | undefined> {
    return this.updateVendor(id, { isApproved: true });
  }

  // Deal operations
  async getDeal(id: number): Promise<Deal | undefined> {
    return this.deals.get(id);
  }

  async getDealsBy(filters: Partial<Deal>): Promise<Deal[]> {
    return Array.from(this.deals.values()).filter(deal => {
      return Object.entries(filters).every(([key, value]) => 
        deal[key as keyof Deal] === value
      );
    });
  }

  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const id = this.currentDealId++;
    const deal: Deal = {
      ...insertDeal,
      id,
      currentRedemptions: 0,
      isActive: true,
      isApproved: false,
      viewCount: 0,
      createdAt: new Date(),
    };
    this.deals.set(id, deal);
    return deal;
  }

  async updateDeal(id: number, updates: Partial<Deal>): Promise<Deal | undefined> {
    const deal = this.deals.get(id);
    if (!deal) return undefined;
    
    const updatedDeal = { ...deal, ...updates };
    this.deals.set(id, updatedDeal);
    return updatedDeal;
  }

  async deleteDeal(id: number): Promise<boolean> {
    return this.deals.delete(id);
  }

  async getActiveDeals(): Promise<Deal[]> {
    return Array.from(this.deals.values()).filter(deal => 
      deal.isActive && deal.isApproved && new Date(deal.validUntil) > new Date()
    );
  }

  async getDealsByCategory(category: string): Promise<Deal[]> {
    return Array.from(this.deals.values()).filter(deal => 
      deal.category === category && deal.isActive && deal.isApproved
    );
  }

  async getDealsByVendor(vendorId: number): Promise<Deal[]> {
    return Array.from(this.deals.values()).filter(deal => deal.vendorId === vendorId);
  }

  async getPendingDeals(): Promise<Deal[]> {
    return Array.from(this.deals.values()).filter(deal => !deal.isApproved);
  }

  async approveDeal(id: number, approvedBy: number): Promise<Deal | undefined> {
    return this.updateDeal(id, { isApproved: true, approvedBy });
  }

  async incrementDealViews(id: number): Promise<void> {
    const deal = this.deals.get(id);
    if (deal) {
      deal.viewCount = (deal.viewCount || 0) + 1;
      this.deals.set(id, deal);
    }
  }

  // Deal claim operations
  async claimDeal(insertClaim: InsertDealClaim): Promise<DealClaim> {
    const id = this.currentDealClaimId++;
    const claim: DealClaim = {
      ...insertClaim,
      id,
      claimedAt: new Date(),
      status: "claimed",
    };
    
    // Update deal redemption count
    const deal = this.deals.get(insertClaim.dealId);
    if (deal) {
      deal.currentRedemptions = (deal.currentRedemptions || 0) + 1;
      this.deals.set(deal.id, deal);
    }
    
    // Update user stats
    const user = this.users.get(insertClaim.userId);
    if (user) {
      user.dealsClaimed = (user.dealsClaimed || 0) + 1;
      user.totalSavings = (parseFloat(user.totalSavings || "0") + parseFloat(insertClaim.savingsAmount)).toString();
      this.users.set(user.id, user);
    }
    
    this.dealClaims.set(id, claim);
    return claim;
  }

  async getUserClaims(userId: number): Promise<DealClaim[]> {
    return Array.from(this.dealClaims.values()).filter(claim => claim.userId === userId);
  }

  async getDealClaims(dealId: number): Promise<DealClaim[]> {
    return Array.from(this.dealClaims.values()).filter(claim => claim.dealId === dealId);
  }

  async updateClaimStatus(id: number, status: string, usedAt?: Date): Promise<DealClaim | undefined> {
    const claim = this.dealClaims.get(id);
    if (!claim) return undefined;
    
    const updatedClaim = { ...claim, status, usedAt: usedAt || claim.usedAt };
    this.dealClaims.set(id, updatedClaim);
    return updatedClaim;
  }

  // Help ticket operations
  async createHelpTicket(insertTicket: InsertHelpTicket): Promise<HelpTicket> {
    const id = this.currentHelpTicketId++;
    const ticket: HelpTicket = {
      ...insertTicket,
      id,
      status: "open",
      priority: insertTicket.priority || "medium",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.helpTickets.set(id, ticket);
    return ticket;
  }

  async getHelpTickets(): Promise<HelpTicket[]> {
    return Array.from(this.helpTickets.values());
  }

  async getUserHelpTickets(userId: number): Promise<HelpTicket[]> {
    return Array.from(this.helpTickets.values()).filter(ticket => ticket.userId === userId);
  }

  async updateHelpTicket(id: number, updates: Partial<HelpTicket>): Promise<HelpTicket | undefined> {
    const ticket = this.helpTickets.get(id);
    if (!ticket) return undefined;
    
    const updatedTicket = { ...ticket, ...updates, updatedAt: new Date() };
    this.helpTickets.set(id, updatedTicket);
    return updatedTicket;
  }

  // System log operations
  async createSystemLog(insertLog: InsertSystemLog): Promise<SystemLog> {
    const id = this.currentSystemLogId++;
    const log: SystemLog = {
      ...insertLog,
      id,
      createdAt: new Date(),
    };
    this.systemLogs.set(id, log);
    return log;
  }

  async getSystemLogs(limit = 100): Promise<SystemLog[]> {
    const logs = Array.from(this.systemLogs.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return logs.slice(0, limit);
  }

  // Analytics operations
  async getAnalytics() {
    const totalUsers = this.users.size;
    const totalVendors = Array.from(this.vendors.values()).filter(v => v.isApproved).length;
    const totalDeals = Array.from(this.deals.values()).filter(d => d.isActive && d.isApproved).length;
    const totalClaims = this.dealClaims.size;
    
    // Estimate revenue based on membership plans
    const premiumUsers = Array.from(this.users.values()).filter(u => u.membershipPlan === "premium").length;
    const ultimateUsers = Array.from(this.users.values()).filter(u => u.membershipPlan === "ultimate").length;
    const revenueEstimate = (premiumUsers * 8999) + (ultimateUsers * 12999);

    // City stats
    const cityMap = new Map<string, { dealCount: number; userCount: number }>();
    Array.from(this.users.values()).forEach(user => {
      if (user.city) {
        const stats = cityMap.get(user.city) || { dealCount: 0, userCount: 0 };
        stats.userCount++;
        cityMap.set(user.city, stats);
      }
    });
    
    Array.from(this.vendors.values()).forEach(vendor => {
      const deals = Array.from(this.deals.values()).filter(d => d.vendorId === vendor.id && d.isApproved);
      const stats = cityMap.get(vendor.city) || { dealCount: 0, userCount: 0 };
      stats.dealCount += deals.length;
      cityMap.set(vendor.city, stats);
    });

    const cityStats = Array.from(cityMap.entries()).map(([city, stats]) => ({
      city,
      ...stats,
    }));

    // Category stats
    const categoryMap = new Map<string, { dealCount: number; claimCount: number }>();
    Array.from(this.deals.values()).forEach(deal => {
      if (deal.isApproved) {
        const stats = categoryMap.get(deal.category) || { dealCount: 0, claimCount: 0 };
        stats.dealCount++;
        categoryMap.set(deal.category, stats);
      }
    });

    Array.from(this.dealClaims.values()).forEach(claim => {
      const deal = this.deals.get(claim.dealId);
      if (deal) {
        const stats = categoryMap.get(deal.category) || { dealCount: 0, claimCount: 0 };
        stats.claimCount++;
        categoryMap.set(deal.category, stats);
      }
    });

    const categoryStats = Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      ...stats,
    }));

    return {
      totalUsers,
      totalVendors,
      totalDeals,
      totalClaims,
      revenueEstimate,
      cityStats,
      categoryStats,
    };
  }
}

export const storage = new MemStorage();
