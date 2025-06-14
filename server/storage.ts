import { 
  users, vendors, deals, dealClaims, helpTickets, systemLogs, wishlists,
  type User, type InsertUser, type Vendor, type InsertVendor,
  type Deal, type InsertDeal, type DealClaim, type InsertDealClaim,
  type HelpTicket, type InsertHelpTicket, type SystemLog, type InsertSystemLog,
  type Wishlist, type InsertWishlist
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

    // Create comprehensive sample deals for all categories
    const sampleDeals = [
      // Fashion Deals
      {
        title: "Winter Collection Sale - 30% Off",
        description: "Get 30% off on all winter clothing including jackets, sweaters, and more",
        category: "fashion",
        imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=400&fit=crop",
        discountPercentage: 30,
        discountCode: "WINTER30",
        originalPrice: "4000",
        discountedPrice: "2800",
        validUntil: new Date("2025-03-31"),
        maxRedemptions: 100,
        currentRedemptions: 47,
        requiredMembership: "basic",
      },
      {
        title: "Designer Handbags - 25% Off",
        description: "Exclusive designer handbags with premium quality leather",
        category: "fashion",
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop",
        discountPercentage: 25,
        discountCode: "BAG25",
        originalPrice: "8000",
        discountedPrice: "6000",
        validUntil: new Date("2025-04-15"),
        maxRedemptions: 75,
        currentRedemptions: 28,
        requiredMembership: "premium",
      },
      {
        title: "Formal Shirts Collection - 40% Off",
        description: "Premium formal shirts for office and business meetings",
        category: "fashion",
        imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=400&fit=crop",
        discountPercentage: 40,
        discountCode: "SHIRT40",
        originalPrice: "2500",
        discountedPrice: "1500",
        validUntil: new Date("2025-02-28"),
        maxRedemptions: 200,
        currentRedemptions: 89,
        requiredMembership: "basic",
      },

      // Electronics Deals
      {
        title: "Electronics Mega Sale - 50% Off",
        description: "Huge discounts on laptops, smartphones, and accessories",
        category: "electronics",
        imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop",
        discountPercentage: 50,
        discountCode: "TECH50",
        originalPrice: "50000",
        discountedPrice: "25000",
        validUntil: new Date("2025-02-28"),
        maxRedemptions: 50,
        currentRedemptions: 23,
        requiredMembership: "premium",
      },
      {
        title: "Smart Phone Flash Sale - 35% Off",
        description: "Latest smartphones with advanced features and long battery life",
        category: "electronics",
        imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop",
        discountPercentage: 35,
        discountCode: "PHONE35",
        originalPrice: "25000",
        discountedPrice: "16250",
        validUntil: new Date("2025-03-15"),
        maxRedemptions: 100,
        currentRedemptions: 67,
        requiredMembership: "basic",
      },
      {
        title: "Gaming Headphones - 45% Off",
        description: "Professional gaming headphones with surround sound",
        category: "electronics",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop",
        discountPercentage: 45,
        discountCode: "GAME45",
        originalPrice: "8000",
        discountedPrice: "4400",
        validUntil: new Date("2025-04-30"),
        maxRedemptions: 150,
        currentRedemptions: 45,
        requiredMembership: "basic",
      },

      // Food & Dining Deals
      {
        title: "Multi-Cuisine Buffet - 30% Off",
        description: "Enjoy delicious buffet with Indian, Chinese, and Continental dishes",
        category: "food",
        imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop",
        discountPercentage: 30,
        discountCode: "BUFFET30",
        originalPrice: "1200",
        discountedPrice: "840",
        validUntil: new Date("2025-03-31"),
        maxRedemptions: 500,
        currentRedemptions: 234,
        requiredMembership: "basic",
      },
      {
        title: "Pizza Combo Deal - 50% Off",
        description: "Large pizza with sides and beverage combo offer",
        category: "food",
        imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop",
        discountPercentage: 50,
        discountCode: "PIZZA50",
        originalPrice: "800",
        discountedPrice: "400",
        validUntil: new Date("2025-02-15"),
        maxRedemptions: 300,
        currentRedemptions: 156,
        requiredMembership: "basic",
      },
      {
        title: "Fine Dining Experience - 25% Off",
        description: "Premium dining experience with chef's special menu",
        category: "food",
        imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
        discountPercentage: 25,
        discountCode: "FINE25",
        originalPrice: "3000",
        discountedPrice: "2250",
        validUntil: new Date("2025-05-31"),
        maxRedemptions: 100,
        currentRedemptions: 34,
        requiredMembership: "premium",
      },

      // Home & Garden Deals
      {
        title: "Home Decor Sale - 40% Off",
        description: "Beautiful home decor items including vases, paintings, and sculptures",
        category: "home",
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop",
        discountPercentage: 40,
        discountCode: "HOME40",
        originalPrice: "5000",
        discountedPrice: "3000",
        validUntil: new Date("2025-04-30"),
        maxRedemptions: 200,
        currentRedemptions: 78,
        requiredMembership: "basic",
      },
      {
        title: "Garden Tools Set - 35% Off",
        description: "Complete gardening tools set for professional landscaping",
        category: "home",
        imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop",
        discountPercentage: 35,
        discountCode: "GARDEN35",
        originalPrice: "4500",
        discountedPrice: "2925",
        validUntil: new Date("2025-06-30"),
        maxRedemptions: 80,
        currentRedemptions: 23,
        requiredMembership: "basic",
      },
      {
        title: "Luxury Bedding Set - 30% Off",
        description: "Premium cotton bedding set with pillows and comforter",
        category: "home",
        imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop",
        discountPercentage: 30,
        discountCode: "BED30",
        originalPrice: "6000",
        discountedPrice: "4200",
        validUntil: new Date("2025-03-15"),
        maxRedemptions: 120,
        currentRedemptions: 56,
        requiredMembership: "premium",
      },

      // Entertainment Deals
      {
        title: "Movie Tickets - 25% Off",
        description: "Enjoy latest blockbusters with discounted movie tickets",
        category: "entertainment",
        imageUrl: "https://images.unsplash.com/photo-1489599849323-2429c8e8d90a?w=600&h=400&fit=crop",
        discountPercentage: 25,
        discountCode: "MOVIE25",
        originalPrice: "400",
        discountedPrice: "300",
        validUntil: new Date("2025-12-31"),
        maxRedemptions: 1000,
        currentRedemptions: 445,
        requiredMembership: "basic",
      },
      {
        title: "Gaming Zone Package - 50% Off",
        description: "Unlimited gaming for 2 hours with snacks included",
        category: "entertainment",
        imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=400&fit=crop",
        discountPercentage: 50,
        discountCode: "GAME50",
        originalPrice: "1000",
        discountedPrice: "500",
        validUntil: new Date("2025-03-31"),
        maxRedemptions: 200,
        currentRedemptions: 89,
        requiredMembership: "basic",
      },
      {
        title: "Concert Tickets - 20% Off",
        description: "Live music concert tickets with premium seating",
        category: "entertainment",
        imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop",
        discountPercentage: 20,
        discountCode: "CONCERT20",
        originalPrice: "2500",
        discountedPrice: "2000",
        validUntil: new Date("2025-08-15"),
        maxRedemptions: 500,
        currentRedemptions: 167,
        requiredMembership: "premium",
      },

      // Health & Beauty Deals
      {
        title: "Spa Package - 40% Off",
        description: "Relaxing spa treatment with massage and facial",
        category: "beauty",
        imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop",
        discountPercentage: 40,
        discountCode: "SPA40",
        originalPrice: "3500",
        discountedPrice: "2100",
        validUntil: new Date("2025-06-30"),
        maxRedemptions: 100,
        currentRedemptions: 34,
        requiredMembership: "premium",
      },
      {
        title: "Skincare Products - 35% Off",
        description: "Premium skincare products for all skin types",
        category: "beauty",
        imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=400&fit=crop",
        discountPercentage: 35,
        discountCode: "SKIN35",
        originalPrice: "2000",
        discountedPrice: "1300",
        validUntil: new Date("2025-04-30"),
        maxRedemptions: 250,
        currentRedemptions: 112,
        requiredMembership: "basic",
      },
      {
        title: "Hair Styling Service - 30% Off",
        description: "Professional hair cut, styling, and treatment",
        category: "beauty",
        imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop",
        discountPercentage: 30,
        discountCode: "HAIR30",
        originalPrice: "1500",
        discountedPrice: "1050",
        validUntil: new Date("2025-05-31"),
        maxRedemptions: 300,
        currentRedemptions: 134,
        requiredMembership: "basic",
      },

      // Travel Deals
      {
        title: "Weekend Getaway - 45% Off",
        description: "2 nights 3 days package to hill stations with meals",
        category: "travel",
        imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop",
        discountPercentage: 45,
        discountCode: "WEEKEND45",
        originalPrice: "15000",
        discountedPrice: "8250",
        validUntil: new Date("2025-09-30"),
        maxRedemptions: 50,
        currentRedemptions: 12,
        requiredMembership: "premium",
      },
      {
        title: "Flight Booking - 25% Off",
        description: "Domestic flight bookings with flexible cancellation",
        category: "travel",
        imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop",
        discountPercentage: 25,
        discountCode: "FLY25",
        originalPrice: "8000",
        discountedPrice: "6000",
        validUntil: new Date("2025-12-31"),
        maxRedemptions: 200,
        currentRedemptions: 67,
        requiredMembership: "basic",
      },
      {
        title: "Hotel Booking - 40% Off",
        description: "Luxury hotel stays with complimentary breakfast",
        category: "travel",
        imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop",
        discountPercentage: 40,
        discountCode: "HOTEL40",
        originalPrice: "5000",
        discountedPrice: "3000",
        validUntil: new Date("2025-08-31"),
        maxRedemptions: 150,
        currentRedemptions: 43,
        requiredMembership: "premium",
      },

      // Sports & Fitness Deals
      {
        title: "Gym Membership - 50% Off",
        description: "6 months gym membership with personal trainer sessions",
        category: "sports",
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
        discountPercentage: 50,
        discountCode: "GYM50",
        originalPrice: "12000",
        discountedPrice: "6000",
        validUntil: new Date("2025-03-31"),
        maxRedemptions: 100,
        currentRedemptions: 45,
        requiredMembership: "basic",
      },
      {
        title: "Sports Equipment - 30% Off",
        description: "Professional sports equipment for all outdoor activities",
        category: "sports",
        imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=400&fit=crop",
        discountPercentage: 30,
        discountCode: "SPORT30",
        originalPrice: "7000",
        discountedPrice: "4900",
        validUntil: new Date("2025-07-31"),
        maxRedemptions: 75,
        currentRedemptions: 28,
        requiredMembership: "basic",
      },
    ];

    // Create deal objects from sample data
    sampleDeals.forEach(dealData => {
      const deal: Deal = {
        id: this.currentDealId++,
        vendorId: vendor.id,
        ...dealData,
        validFrom: new Date(),
        isActive: true,
        isApproved: true,
        approvedBy: adminUser.id,
        viewCount: Math.floor(Math.random() * 2000) + 100,
        createdAt: new Date(),
      };
      this.deals.set(deal.id, deal);
    });

    // Sample deal claim
    const firstDeal = Array.from(this.deals.values())[0];
    if (firstDeal) {
      const claim1: DealClaim = {
        id: this.currentDealClaimId++,
        userId: customerUser.id,
        dealId: firstDeal.id,
        claimedAt: new Date("2024-12-15"),
        usedAt: new Date("2024-12-16"),
        savingsAmount: "1200",
        status: "used",
      };
      this.dealClaims.set(claim1.id, claim1);
    }
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

  // Wishlist operations
  async addToWishlist(insertWishlist: InsertWishlist): Promise<Wishlist> {
    // Check if already in wishlist
    const existing = Array.from(this.wishlists.values()).find(
      w => w.userId === insertWishlist.userId && w.dealId === insertWishlist.dealId
    );
    
    if (existing) {
      return existing;
    }

    const id = this.currentWishlistId++;
    const wishlist: Wishlist = {
      ...insertWishlist,
      id,
      addedAt: new Date(),
    };
    this.wishlists.set(id, wishlist);
    return wishlist;
  }

  async removeFromWishlist(userId: number, dealId: number): Promise<boolean> {
    const wishlistItem = Array.from(this.wishlists.entries()).find(
      ([, w]) => w.userId === userId && w.dealId === dealId
    );
    
    if (!wishlistItem) {
      return false;
    }

    this.wishlists.delete(wishlistItem[0]);
    return true;
  }

  async getUserWishlist(userId: number): Promise<Wishlist[]> {
    return Array.from(this.wishlists.values())
      .filter(w => w.userId === userId)
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  }

  async isInWishlist(userId: number, dealId: number): Promise<boolean> {
    return Array.from(this.wishlists.values()).some(
      w => w.userId === userId && w.dealId === dealId
    );
  }
}

export const storage = new MemStorage();
