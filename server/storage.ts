import type { User, InsertUser, Vendor, InsertVendor, Deal, InsertDeal, DealClaim, InsertDealClaim, HelpTicket, InsertHelpTicket, SystemLog, InsertSystemLog, Wishlist, InsertWishlist } from "@shared/schema";

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

  // Wishlist operations
  addToWishlist(wishlist: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(userId: number, dealId: number): Promise<boolean>;
  getUserWishlist(userId: number): Promise<Wishlist[]>;
  isInWishlist(userId: number, dealId: number): Promise<boolean>;

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

  // Get deals ordered by claims (most claimed first)
  getMostClaimedDeals(): Promise<Deal[]>;
  
  // Admin operations for testing
  getDealsByCategory(): Promise<Record<string, number>>;
  deleteDealsByCategory(category: string): Promise<boolean>;
  resetAllDeals(): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private vendors: Map<number, Vendor> = new Map();
  private deals: Map<number, Deal> = new Map();
  private dealClaims: Map<number, DealClaim> = new Map();
  private helpTickets: Map<number, HelpTicket> = new Map();
  private systemLogs: Map<number, SystemLog> = new Map();
  private wishlists: Map<number, Wishlist> = new Map();

  private currentUserId = 1;
  private currentVendorId = 1;
  private currentDealId = 1;
  private currentDealClaimId = 1;
  private currentHelpTicketId = 1;
  private currentSystemLogId = 1;
  private currentWishlistId = 1;

  constructor() {
    this.initializeWithSampleData();
  }

  private initializeWithSampleData() {
    // Create sample admin user
    const adminUser: User = {
      id: this.currentUserId++,
      username: "admin",
      email: "admin@instoredealz.com",
      password: "admin123",
      name: "System Admin",
      role: "admin",
      phone: "+91-9876543210",
      city: "Mumbai",
      state: "Maharashtra",
      membershipPlan: "ultimate",
      membershipExpiry: null,
      isPromotionalUser: false,
      totalSavings: "15000",
      dealsClaimed: 25,
      createdAt: new Date(),
      isActive: true,
    };
    this.users.set(adminUser.id, adminUser);

    // Create sample customer user
    const customerUser: User = {
      id: this.currentUserId++,
      username: "customer",
      email: "customer@example.com",
      password: "customer123",
      name: "John Doe",
      role: "customer",
      phone: "+91-9123456789",
      city: "Delhi",
      state: "Delhi",
      membershipPlan: "premium",
      membershipExpiry: new Date("2025-12-31"),
      isPromotionalUser: false,
      totalSavings: "5000",
      dealsClaimed: 12,
      createdAt: new Date(),
      isActive: true,
    };
    this.users.set(customerUser.id, customerUser);

    // Create sample vendor user
    const vendorUser: User = {
      id: this.currentUserId++,
      username: "vendor",
      email: "vendor@example.com",
      password: "vendor123",
      name: "Fashion Store Owner",
      role: "vendor",
      phone: "+91-9876543210",
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

    // Generate 50 additional vendors for testing
    const additionalVendors = this.generateTestVendors(50);
    additionalVendors.forEach(vendor => {
      this.vendors.set(vendor.id, vendor);
    });

    // Generate 50 additional users for testing
    const additionalUsers = this.generateTestUsers(50);
    additionalUsers.forEach(user => {
      this.users.set(user.id, user);
    });

    // Create comprehensive sample deals - 50 per category for testing
    const sampleDeals = this.generateTestDeals();
    
    sampleDeals.forEach((dealData) => {
      const deal: Deal = {
        id: this.currentDealId++,
        vendorId: vendor.id,
        ...dealData,
        isActive: true,
        isApproved: true,
        approvedBy: adminUser.id,
        viewCount: Math.floor(Math.random() * 1000),
        createdAt: new Date(),
      };
      this.deals.set(deal.id, deal);
    });

    // Create some deal claims for testing
    const sampleClaims = [
      {
        userId: customerUser.id,
        dealId: 1,
        savingsAmount: "1200",
      },
      {
        userId: customerUser.id, 
        dealId: 2,
        savingsAmount: "2000",
      }
    ];

    sampleClaims.forEach(claimData => {
      const claim: DealClaim = {
        id: this.currentDealClaimId++,
        ...claimData,
        claimedAt: new Date(),
        status: "claimed",
        usedAt: null,
      };
      this.dealClaims.set(claim.id, claim);
    });
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
    const user: User = {
      id: this.currentUserId++,
      ...insertUser,
      role: insertUser.role || "customer",
      membershipPlan: insertUser.membershipPlan || "basic",
      membershipExpiry: insertUser.membershipExpiry || null,
      isPromotionalUser: insertUser.isPromotionalUser || false,
      totalSavings: insertUser.totalSavings || "0",
      dealsClaimed: insertUser.dealsClaimed || 0,
      createdAt: new Date(),
      isActive: true,
    };
    this.users.set(user.id, user);
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
    const vendor: Vendor = {
      id: this.currentVendorId++,
      ...insertVendor,
      isApproved: false,
      rating: "0.0",
      totalDeals: 0,
      totalRedemptions: 0,
      createdAt: new Date(),
    };
    this.vendors.set(vendor.id, vendor);
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
    const vendor = this.vendors.get(id);
    if (!vendor) return undefined;
    
    vendor.isApproved = true;
    this.vendors.set(id, vendor);
    return vendor;
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
    const deal: Deal = {
      id: this.currentDealId++,
      ...insertDeal,
      validFrom: insertDeal.validFrom || new Date(),
      isActive: true,
      isApproved: false,
      approvedBy: null,
      viewCount: 0,
      currentRedemptions: 0,
      createdAt: new Date(),
    };
    this.deals.set(deal.id, deal);
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
    return Array.from(this.deals.values())
      .filter(deal => deal.isActive && deal.isApproved)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getDealsByCategory(category: string): Promise<Deal[]> {
    return Array.from(this.deals.values())
      .filter(deal => deal.category === category && deal.isActive && deal.isApproved);
  }

  async getDealsByVendor(vendorId: number): Promise<Deal[]> {
    return Array.from(this.deals.values())
      .filter(deal => deal.vendorId === vendorId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getPendingDeals(): Promise<Deal[]> {
    return Array.from(this.deals.values()).filter(deal => !deal.isApproved);
  }

  async approveDeal(id: number, approvedBy: number): Promise<Deal | undefined> {
    const deal = this.deals.get(id);
    if (!deal) return undefined;
    
    deal.isApproved = true;
    deal.approvedBy = approvedBy;
    this.deals.set(id, deal);
    return deal;
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
    const claim: DealClaim = {
      id: this.currentDealClaimId++,
      ...insertClaim,
      claimedAt: new Date(),
      status: "claimed",
      usedAt: null,
    };
    this.dealClaims.set(claim.id, claim);
    return claim;
  }

  async getUserClaims(userId: number): Promise<DealClaim[]> {
    return Array.from(this.dealClaims.values())
      .filter(claim => claim.userId === userId)
      .sort((a, b) => new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime());
  }

  async getDealClaims(dealId: number): Promise<DealClaim[]> {
    return Array.from(this.dealClaims.values()).filter(claim => claim.dealId === dealId);
  }

  async updateClaimStatus(id: number, status: string, usedAt?: Date): Promise<DealClaim | undefined> {
    const claim = this.dealClaims.get(id);
    if (!claim) return undefined;
    
    claim.status = status;
    if (usedAt) claim.usedAt = usedAt;
    this.dealClaims.set(id, claim);
    return claim;
  }

  // Help ticket operations
  async createHelpTicket(insertTicket: InsertHelpTicket): Promise<HelpTicket> {
    const ticket: HelpTicket = {
      id: this.currentHelpTicketId++,
      ...insertTicket,
      status: "open",
      priority: insertTicket.priority || "medium",
      assignedTo: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.helpTickets.set(ticket.id, ticket);
    return ticket;
  }

  async getHelpTickets(): Promise<HelpTicket[]> {
    return Array.from(this.helpTickets.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getUserHelpTickets(userId: number): Promise<HelpTicket[]> {
    return Array.from(this.helpTickets.values())
      .filter(ticket => ticket.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
    const log: SystemLog = {
      id: this.currentSystemLogId++,
      ...insertLog,
      createdAt: new Date(),
    };
    this.systemLogs.set(log.id, log);
    return log;
  }

  async getSystemLogs(limit = 100): Promise<SystemLog[]> {
    return Array.from(this.systemLogs.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // Wishlist operations
  async addToWishlist(insertWishlist: InsertWishlist): Promise<Wishlist> {
    // Check if already exists
    const existing = Array.from(this.wishlists.values()).find(w => 
      w.userId === insertWishlist.userId && w.dealId === insertWishlist.dealId
    );
    
    if (existing) {
      return existing;
    }

    const wishlist: Wishlist = {
      id: this.currentWishlistId++,
      ...insertWishlist,
      addedAt: new Date(),
    };
    this.wishlists.set(wishlist.id, wishlist);
    return wishlist;
  }

  async removeFromWishlist(userId: number, dealId: number): Promise<boolean> {
    const wishlist = Array.from(this.wishlists.values()).find(w => 
      w.userId === userId && w.dealId === dealId
    );
    
    if (wishlist) {
      return this.wishlists.delete(wishlist.id);
    }
    return false;
  }

  async getUserWishlist(userId: number): Promise<Wishlist[]> {
    return Array.from(this.wishlists.values())
      .filter(wishlist => wishlist.userId === userId)
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  }

  async isInWishlist(userId: number, dealId: number): Promise<boolean> {
    return Array.from(this.wishlists.values()).some(w => 
      w.userId === userId && w.dealId === dealId
    );
  }

  // Generate test vendors
  private generateTestVendors(count: number): Vendor[] {
    const vendors: Vendor[] = [];
    const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Pune", "Hyderabad", "Ahmedabad"];
    const businessTypes = ["Store", "Boutique", "Mart", "Plaza", "Hub", "Center", "Outlet", "Shop"];
    
    for (let i = 0; i < count; i++) {
      const city = cities[i % cities.length];
      const businessType = businessTypes[i % businessTypes.length];
      
      vendors.push({
        id: this.currentVendorId++,
        userId: this.currentUserId - 1 - i,
        businessName: `Test ${businessType} ${i + 1}`,
        gstNumber: `27AAB${String(i).padStart(6, '0')}${i % 10}ZX`,
        panNumber: `AAB${String(i).padStart(6, '0')}R`,
        logoUrl: `https://images.unsplash.com/photo-144${1984904996 + i}?w=200&h=200&fit=crop`,
        description: `Quality products and services in ${city}`,
        address: `Shop ${i + 1}, Commercial Complex`,
        city,
        state: city === "Mumbai" ? "Maharashtra" : city === "Delhi" ? "Delhi" : "Karnataka",
        isApproved: true,
        rating: (3.5 + Math.random() * 1.5).toFixed(1),
        totalDeals: Math.floor(Math.random() * 20) + 5,
        totalRedemptions: Math.floor(Math.random() * 500) + 50,
        createdAt: new Date(),
      });
    }
    return vendors;
  }

  private generateTestUsers(count: number): User[] {
    const users: User[] = [];
    const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Pune", "Hyderabad", "Ahmedabad"];
    const membershipPlans = ["basic", "premium", "ultimate"];
    
    for (let i = 0; i < count; i++) {
      const city = cities[i % cities.length];
      
      users.push({
        id: this.currentUserId++,
        username: `testuser${i + 1}`,
        email: `testuser${i + 1}@example.com`,
        password: "test123",
        name: `Test User ${i + 1}`,
        role: i % 10 === 0 ? "vendor" : "customer",
        phone: `+91-${9000000000 + i}`,
        city,
        state: city === "Mumbai" ? "Maharashtra" : city === "Delhi" ? "Delhi" : "Karnataka",
        membershipPlan: membershipPlans[i % membershipPlans.length],
        membershipExpiry: new Date("2025-12-31"),
        isPromotionalUser: i % 3 === 0,
        totalSavings: (Math.random() * 10000).toFixed(2),
        dealsClaimed: Math.floor(Math.random() * 50),
        createdAt: new Date(),
        isActive: true,
      });
    }
    return users;
  }

  private generateTestDeals(): any[] {
    const categories = ["fashion", "electronics", "restaurants", "beauty", "travel", "home", "automotive", "health"];
    const deals: any[] = [];
    
    categories.forEach(category => {
      for (let i = 0; i < 50; i++) {
        deals.push(this.generateDealForCategory(category, i));
      }
    });
    
    return deals;
  }

  private generateDealForCategory(category: string, index: number): any {
    const dealTemplates = {
      fashion: {
        titles: ["Winter Collection", "Designer Wear", "Casual Outfits", "Formal Suits", "Ethnic Wear"],
        images: ["photo-1445205170230-053b83016050", "photo-1553062407-98eeb64c6a62", "photo-1602810318383-e386cc2a3ccf"]
      },
      electronics: {
        titles: ["Smart Phones", "Laptops", "Gaming Accessories", "Home Appliances", "Audio Systems"],
        images: ["photo-1441986300917-64674bd600d8", "photo-1511707171634-5f897ff02aa9", "photo-1505740420928-5e560c06d30e"]
      },
      restaurants: {
        titles: ["Multi-Cuisine Buffet", "Pizza Combo", "Fine Dining", "Street Food", "Healthy Meals"],
        images: ["photo-1555939594-58d7cb561ad1", "photo-1513104890138-7c749659a591", "photo-1414235077428-338989a2e8c0"]
      },
      beauty: {
        titles: ["Spa Package", "Hair Treatment", "Facial Services", "Makeup Session", "Wellness Package"],
        images: ["photo-1560750588-73207b1ef5b8", "photo-1522335659846-4d79e4b6affe", "photo-1571019613454-1cb2f99b2d8b"]
      },
      travel: {
        titles: ["Holiday Package", "Adventure Trip", "City Tour", "Resort Stay", "Flight Deals"],
        images: ["photo-1506905925346-21bda4d32df4", "photo-1488646953014-85cb44e25828", "photo-1571896349842-33c89424de2d"]
      },
      home: {
        titles: ["Furniture Sale", "Home Decor", "Kitchen Appliances", "Bedding Sets", "Garden Tools"],
        images: ["photo-1555041469-a586c61ea9bc", "photo-1484154218962-a197022b5858", "photo-1586023492125-27b2c045efd7"]
      },
      automotive: {
        titles: ["Car Service", "Bike Accessories", "Car Wash", "Tire Change", "Auto Parts"],
        images: ["photo-1492144534655-ae79c964c9d7", "photo-1503376780353-7e6692767b70", "photo-1558618047-3c8c76ca7d13"]
      },
      health: {
        titles: ["Health Checkup", "Gym Membership", "Yoga Classes", "Medical Consultation", "Pharmacy Discount"],
        images: ["photo-1559757148-5c350d0d3c56", "photo-1571019613454-1cb2f99b2d8b", "photo-1559757175-0eb30cd2c115"]
      }
    };

    const template = dealTemplates[category] || dealTemplates.fashion;
    const title = template.titles[index % template.titles.length];
    const imageId = template.images[index % template.images.length];
    const discount = [20, 25, 30, 35, 40, 45, 50][index % 7];
    const originalPrice = Math.floor(Math.random() * 5000) + 500;
    const discountedPrice = Math.floor(originalPrice * (1 - discount / 100));

    return {
      title: `${title} ${index + 1} - ${discount}% Off`,
      description: `Amazing ${discount}% discount on ${title.toLowerCase()}. Limited time offer!`,
      category,
      imageUrl: `https://images.unsplash.com/${imageId}?w=600&h=400&fit=crop`,
      discountPercentage: discount,
      discountCode: `${category.toUpperCase()}${discount}${index}`,
      originalPrice: originalPrice.toString(),
      discountedPrice: discountedPrice.toString(),
      validUntil: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
      maxRedemptions: Math.floor(Math.random() * 200) + 50,
      currentRedemptions: Math.floor(Math.random() * 150),
      requiredMembership: ["basic", "premium", "ultimate"][index % 3],
    };
  }

  async getMostClaimedDeals(): Promise<Deal[]> {
    const deals = Array.from(this.deals.values())
      .filter(deal => deal.isApproved && deal.isActive)
      .sort((a, b) => (b.currentRedemptions || 0) - (a.currentRedemptions || 0));
    return deals.slice(0, 15);
  }

  async getDealsByCategory(): Promise<Record<string, number>> {
    const categoryCount: Record<string, number> = {};
    Array.from(this.deals.values()).forEach(deal => {
      categoryCount[deal.category] = (categoryCount[deal.category] || 0) + 1;
    });
    return categoryCount;
  }

  async deleteDealsByCategory(category: string): Promise<boolean> {
    const dealsToDelete = Array.from(this.deals.values()).filter(deal => deal.category === category);
    dealsToDelete.forEach(deal => {
      this.deals.delete(deal.id);
      Array.from(this.dealClaims.values())
        .filter(claim => claim.dealId === deal.id)
        .forEach(claim => this.dealClaims.delete(claim.id));
    });
    return true;
  }

  async resetAllDeals(): Promise<boolean> {
    this.deals.clear();
    this.dealClaims.clear();
    this.currentDealId = 1;
    this.currentDealClaimId = 1;
    return true;
  }

  async getAnalytics() {
    const users = Array.from(this.users.values());
    const vendors = Array.from(this.vendors.values());
    const deals = Array.from(this.deals.values());
    const claims = Array.from(this.dealClaims.values());

    const totalUsers = users.length;
    const totalVendors = vendors.length;
    const totalDeals = deals.filter(d => d.isApproved).length;
    const totalClaims = claims.length;
    const revenueEstimate = claims.reduce((sum, claim) => sum + parseFloat(claim.savingsAmount), 0);

    const cityStats = deals.reduce((acc, deal) => {
      const vendor = vendors.find(v => v.id === deal.vendorId);
      if (vendor) {
        const city = vendor.city;
        if (!acc[city]) {
          acc[city] = { city, dealCount: 0, userCount: 0 };
        }
        acc[city].dealCount++;
      }
      return acc;
    }, {} as Record<string, any>);

    users.forEach(user => {
      if (user.city && cityStats[user.city]) {
        cityStats[user.city].userCount++;
      }
    });

    const categoryStats = deals.reduce((acc, deal) => {
      const category = deal.category;
      if (!acc[category]) {
        acc[category] = { category, dealCount: 0, claimCount: 0 };
      }
      acc[category].dealCount++;
      acc[category].claimCount += claims.filter(c => c.dealId === deal.id).length;
      return acc;
    }, {} as Record<string, any>);

    return {
      totalUsers,
      totalVendors,
      totalDeals,
      totalClaims,
      revenueEstimate,
      cityStats: Object.values(cityStats),
      categoryStats: Object.values(categoryStats),
    };
  }
}

export const storage = new MemStorage();
