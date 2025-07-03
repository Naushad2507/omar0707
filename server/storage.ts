import {
  User,
  InsertUser,
  Vendor,
  InsertVendor,
  Deal,
  InsertDeal,
  DealClaim,
  InsertDealClaim,
  HelpTicket,
  InsertHelpTicket,
  SystemLog,
  InsertSystemLog,
  Wishlist,
  InsertWishlist,
  PosSession,
  InsertPosSession,
  PosTransaction,
  InsertPosTransaction,
  PosInventory,
  InsertPosInventory,
} from "../shared/schema";

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
  createDealClaim(claim: InsertDealClaim): Promise<DealClaim>;
  getUserClaims(userId: number): Promise<DealClaim[]>;
  getDealClaims(dealId: number): Promise<DealClaim[]>;
  updateClaimStatus(id: number, status: string, usedAt?: Date): Promise<DealClaim | undefined>;
  updateDealClaim(id: number, updates: Partial<DealClaim>): Promise<DealClaim | undefined>;
  incrementDealRedemptions(dealId: number): Promise<void>;

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
  getDealCategoryCounts(): Promise<Record<string, number>>;
  deleteDealsByCategory(category: string): Promise<boolean>;
  resetAllDeals(): Promise<boolean>;

  // POS operations
  createPosSession(session: InsertPosSession): Promise<PosSession>;
  endPosSession(sessionId: number): Promise<PosSession | undefined>;
  getActivePosSession(vendorId: number, terminalId: string): Promise<PosSession | undefined>;
  getPosSessionsByVendor(vendorId: number): Promise<PosSession[]>;
  
  createPosTransaction(transaction: InsertPosTransaction): Promise<PosTransaction>;
  getPosTransactionsBySession(sessionId: number): Promise<PosTransaction[]>;
  getPosTransactionsByVendor(vendorId: number): Promise<PosTransaction[]>;
  updatePosTransaction(id: number, updates: Partial<PosTransaction>): Promise<PosTransaction | undefined>;
  
  createPosInventory(inventory: InsertPosInventory): Promise<PosInventory>;
  updatePosInventory(id: number, updates: Partial<PosInventory>): Promise<PosInventory | undefined>;
  getPosInventoryByVendor(vendorId: number): Promise<PosInventory[]>;
  getPosInventoryByDeal(dealId: number): Promise<PosInventory | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private vendors: Map<number, Vendor> = new Map();
  private deals: Map<number, Deal> = new Map();
  private dealClaims: Map<number, DealClaim> = new Map();
  private helpTickets: Map<number, HelpTicket> = new Map();
  private systemLogs: Map<number, SystemLog> = new Map();
  private wishlists: Map<number, Wishlist> = new Map();
  private posSessions: Map<number, PosSession> = new Map();
  private posTransactions: Map<number, PosTransaction> = new Map();
  private posInventory: Map<number, PosInventory> = new Map();

  private currentUserId = 1;
  private currentVendorId = 1;
  private currentDealId = 1;
  private currentDealClaimId = 1;
  private currentHelpTicketId = 1;
  private currentSystemLogId = 1;
  private currentWishlistId = 1;
  private currentPosSessionId = 1;
  private currentPosTransactionId = 1;
  private currentPosInventoryId = 1;

  constructor() {
    this.initializeWithSampleData();
  }

  private initializeWithSampleData() {
    // Create admin users
    const adminUser: User = {
      id: this.currentUserId++,
      name: "Admin User",
      username: "admin",
      email: "admin@instoredealz.com",
      password: "admin123",
      role: "admin",
      phone: "+91-9876543210",
      city: "Mumbai",
      state: "Maharashtra",
      membershipPlan: null,
      membershipExpiry: null,
      isPromotionalUser: false,
      totalSavings: "0.00",
      dealsClaimed: 0,
      createdAt: new Date(),
      isActive: true,
    };

    const superAdminUser: User = {
      id: this.currentUserId++,
      name: "Super Admin",
      username: "superadmin",
      email: "superadmin@instoredealz.com",
      password: "superadmin123",
      role: "superadmin",
      phone: "+91-9876543211",
      city: "Delhi",
      state: "Delhi",
      membershipPlan: null,
      membershipExpiry: null,
      isPromotionalUser: false,
      totalSavings: "0.00",
      dealsClaimed: 0,
      createdAt: new Date(),
      isActive: true,
    };

    // Create test customers with different membership tiers
    const customerBasic: User = {
      id: this.currentUserId++,
      name: "Basic Customer",
      username: "customer_basic",
      email: "basic@example.com",
      password: "customer123",
      role: "customer",
      phone: "+91-9876543212",
      city: "Bangalore",
      state: "Karnataka",
      membershipPlan: "basic",
      membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      isPromotionalUser: false,
      totalSavings: "2450.00",
      dealsClaimed: 8,
      createdAt: new Date(),
      isActive: true,
    };

    const customerPremium: User = {
      id: this.currentUserId++,
      name: "Premium Customer",
      username: "customer_premium",
      email: "premium@example.com",
      password: "customer123",
      role: "customer",
      phone: "+91-9876543213",
      city: "Chennai",
      state: "Tamil Nadu",
      membershipPlan: "premium",
      membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isPromotionalUser: false,
      totalSavings: "8950.00",
      dealsClaimed: 24,
      createdAt: new Date(),
      isActive: true,
    };

    const customerUltimate: User = {
      id: this.currentUserId++,
      name: "Ultimate Customer",
      username: "customer_ultimate",
      email: "ultimate@example.com",
      password: "customer123",
      role: "customer",
      phone: "+91-9876543214",
      city: "Hyderabad",
      state: "Telangana",
      membershipPlan: "ultimate",
      membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isPromotionalUser: true,
      totalSavings: "15750.00",
      dealsClaimed: 42,
      createdAt: new Date(),
      isActive: true,
    };

    // Create vendor user
    const vendorUser: User = {
      id: this.currentUserId++,
      name: "Fashion Store Owner",
      username: "vendor",
      email: "vendor@example.com",
      password: "vendor123",
      role: "vendor",
      phone: "+91-9876543215",
      city: "Mumbai",
      state: "Maharashtra",
      membershipPlan: null,
      membershipExpiry: null,
      isPromotionalUser: false,
      totalSavings: "0.00",
      dealsClaimed: 0,
      createdAt: new Date(),
      isActive: true,
    };

    // Save users
    [adminUser, superAdminUser, customerBasic, customerPremium, customerUltimate, vendorUser].forEach(user => {
      this.users.set(user.id, user);
    });

    // Create sample vendor
    const vendor: Vendor = {
      id: this.currentVendorId++,
      userId: vendorUser.id,
      businessName: "TrendyFashion Store",
      gstNumber: "27ABCDE1234F1Z5",
      panNumber: "ABCDE1234F",
      logoUrl: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=200&h=200&fit=crop",
      description: "Premium fashion retailer with latest trends",
      address: "Shop 123, Mall Road",
      city: "Mumbai",
      state: "Maharashtra",
      latitude: "19.0760",
      longitude: "72.8777",
      isApproved: true,
      rating: "4.8",
      totalDeals: 12,
      totalRedemptions: 345,
      createdAt: new Date(),
    };

    this.vendors.set(vendor.id, vendor);

    // Generate comprehensive test data
    this.generateTestVendors().forEach(v => this.vendors.set(v.id, v));
    this.generateTestUsers().forEach(u => this.users.set(u.id, u));
    this.generateTestDeals().forEach(d => this.deals.set(d.id, d));
    this.generateTestClaims();
  }

  private generateTestVendors(): Vendor[] {
    const vendors: Vendor[] = [];
    const cities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad"];
    const states = ["Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Telangana", "Maharashtra", "West Bengal", "Gujarat"];

    for (let i = 0; i < 10; i++) {
      const cityIndex = i % cities.length;
      const vendor: Vendor = {
        id: this.currentVendorId++,
        userId: this.currentUserId++,
        businessName: `Business ${i + 1}`,
        gstNumber: `27ABCDE123${i}F1Z5`,
        panNumber: `ABCDE123${i}F`,
        logoUrl: `https://images.unsplash.com/photo-${1500000000000 + i}?w=200&h=200&fit=crop`,
        description: `Quality business providing excellent services ${i + 1}`,
        address: `Shop ${100 + i}, Business District`,
        city: cities[cityIndex],
        state: states[cityIndex],
        latitude: `${19 + (i * 0.1)}`,
        longitude: `${72 + (i * 0.1)}`,
        isApproved: i < 8, // Most vendors approved
        rating: `${4.2 + (i * 0.1)}`,
        totalDeals: 5 + (i * 2),
        totalRedemptions: 50 + (i * 25),
        createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
      };
      vendors.push(vendor);
      
      // Create corresponding user for each vendor
      const vendorUser: User = {
        id: vendor.userId,
        name: `Vendor ${i + 1}`,
        username: `vendor_${i + 1}`,
        email: `vendor${i + 1}@example.com`,
        password: "vendor123",
        role: "vendor",
        phone: `+91-987654${3216 + i}`,
        city: cities[cityIndex],
        state: states[cityIndex],
        membershipPlan: null,
        membershipExpiry: null,
        isPromotionalUser: false,
        totalSavings: "0.00",
        dealsClaimed: 0,
        createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
        isActive: true,
      };
      this.users.set(vendorUser.id, vendorUser);
    }

    return vendors;
  }

  private generateTestUsers(): User[] {
    const users: User[] = [];
    const cities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad"];
    const states = ["Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Telangana", "Maharashtra", "West Bengal", "Gujarat"];
    const membershipTiers = ["basic", "premium", "ultimate"];

    for (let i = 0; i < 20; i++) {
      const cityIndex = i % cities.length;
      const membershipTier = membershipTiers[i % 3];
      
      const user: User = {
        id: this.currentUserId++,
        name: `Customer ${i + 1}`,
        username: `customer_${i + 1}`,
        email: `customer${i + 1}@example.com`,
        password: "customer123",
        role: "customer",
        phone: `+91-987654${4000 + i}`,
        city: cities[cityIndex],
        state: states[cityIndex],
        membershipPlan: membershipTier,
        membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isPromotionalUser: i % 5 === 0,
        totalSavings: `${(i + 1) * 450}.00`,
        dealsClaimed: (i + 1) * 3,
        createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
        isActive: true,
      };
      users.push(user);
    }

    return users;
  }

  private generateTestDeals(): Deal[] {
    const deals: Deal[] = [];
    const categories = ["fashion", "electronics", "restaurants", "beauty", "travel", "home", "automotive", "health"];
    
    const dealTemplates = {
      fashion: {
        titles: ["50% Off Designer Clothes", "Buy 2 Get 1 Free Shoes", "Summer Collection Sale", "Winter Wear Discount", "Ethnic Wear Special"],
        images: ["https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=300&fit=crop"]
      },
      electronics: {
        titles: ["Smartphone Mega Sale", "Laptop Clearance", "Gaming Console Deals", "Smart TV Offers", "Headphones Discount"],
        images: ["https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop"]
      },
      restaurants: {
        titles: ["Dine-in 40% Off", "Free Dessert with Main Course", "Weekend Buffet Special", "Happy Hours 50% Off", "Family Meal Combo"],
        images: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop"]
      },
      beauty: {
        titles: ["Spa Package 60% Off", "Skincare Bundle Deal", "Makeup Masterclass Free", "Hair Treatment Special", "Wellness Package"],
        images: ["https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=400&h=300&fit=crop"]
      },
      travel: {
        titles: ["Weekend Getaway 30% Off", "Flight + Hotel Combo", "Adventure Tour Package", "Luxury Resort Deal", "Backpacking Special"],
        images: ["https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop"]
      },
      home: {
        titles: ["Furniture Sale 45% Off", "Home Decor Bundle", "Kitchen Appliances Deal", "Garden Equipment Offer", "Smart Home Package"],
        images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop"]
      },
      automotive: {
        titles: ["Car Service 50% Off", "Bike Accessories Deal", "Fuel Card Cashback", "Insurance Premium Discount", "Spare Parts Sale"],
        images: ["https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop"]
      },
      health: {
        titles: ["Health Checkup Package", "Gym Membership 40% Off", "Yoga Classes Free Trial", "Nutrition Consultation", "Medical Insurance Deal"],
        images: ["https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop"]
      }
    };

    const membershipRequirements = ["basic", "premium", "ultimate"];
    
    categories.forEach((category, categoryIndex) => {
      const templates = dealTemplates[category as keyof typeof dealTemplates];
      
      for (let i = 0; i < 10; i++) {
        const vendorId = (categoryIndex * 2) + 1 + (i % 2); // Distribute across vendors
        const titleIndex = i % templates.titles.length;
        const membershipReq = i < 3 ? null : membershipRequirements[i % 3];
        
        const deal: Deal = {
          id: this.currentDealId++,
          title: templates.titles[titleIndex],
          description: `Amazing ${category} deal with excellent value for money. Limited time offer with premium quality guaranteed.`,
          vendorId: vendorId,
          category: category,
          imageUrl: templates.images[0],
          originalPrice: `${1000 + (i * 200)}.00`,
          discountedPrice: `${500 + (i * 100)}.00`,
          discountPercentage: 30 + (i * 5),
          verificationPin: `${1000 + i}`, // 4-digit PIN for offline verification
          validFrom: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
          validUntil: new Date(Date.now() + ((30 - i) * 24 * 60 * 60 * 1000)),
          maxRedemptions: 100 + (i * 10),
          currentRedemptions: i * 5,
          isActive: true,
          isApproved: i < 8, // Most deals approved
          approvedBy: i < 8 ? 1 : null,
          viewCount: (i + 1) * 25,
          requiredMembership: membershipReq || "basic",
          address: `${category.charAt(0).toUpperCase() + category.slice(1)} Store, Shop ${i + 1}, Main Market, Mumbai, Maharashtra 400001`,
          latitude: `19.${75000 + (i * 100)}`,
          longitude: `72.${83000 + (i * 50)}`,
          createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
        };
        deals.push(deal);
      }
    });

    return deals;
  }

  private generateTestClaims() {
    // Generate claims for existing deals and users
    const activeDeals = Array.from(this.deals.values()).filter(deal => deal.isActive);
    const customers = Array.from(this.users.values()).filter(user => user.role === "customer");
    
    customers.forEach((customer, customerIndex) => {
      const claimsCount = Math.min(customer.dealsClaimed || 0, activeDeals.length);
      
      for (let i = 0; i < claimsCount; i++) {
        const deal = activeDeals[i % activeDeals.length];
        const claim: DealClaim = {
          id: this.currentDealClaimId++,
          userId: customer.id,
          dealId: deal.id,
          status: Math.random() > 0.3 ? "used" : "claimed",
          claimedAt: new Date(Date.now() - ((claimsCount - i) * 24 * 60 * 60 * 1000)),
          usedAt: Math.random() > 0.3 ? new Date() : null,
          savingsAmount: `${Math.floor(Math.random() * 500) + 100}.00`,
        };
        this.dealClaims.set(claim.id, claim);
      }
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
      phone: insertUser.phone || null,
      city: insertUser.city || null,
      state: insertUser.state || null,
      membershipPlan: insertUser.membershipPlan || null,
      membershipExpiry: insertUser.membershipExpiry || null,
      isPromotionalUser: insertUser.isPromotionalUser || null,
      totalSavings: insertUser.totalSavings || null,
      dealsClaimed: insertUser.dealsClaimed || null,
      createdAt: new Date(),
      isActive: true,
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, ...updates };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime());
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values())
      .filter(user => user.role === role)
      .sort((a, b) => new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime());
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
      gstNumber: insertVendor.gstNumber || null,
      logoUrl: insertVendor.logoUrl || null,
      description: insertVendor.description || null,
      address: insertVendor.address || null,
      latitude: insertVendor.latitude || null,
      longitude: insertVendor.longitude || null,
      isApproved: false,
      rating: "0",
      totalDeals: 0,
      totalRedemptions: 0,
      createdAt: new Date(),
    };
    this.vendors.set(vendor.id, vendor);
    return vendor;
  }

  async updateVendor(id: number, updates: Partial<Vendor>): Promise<Vendor | undefined> {
    const vendor = this.vendors.get(id);
    if (vendor) {
      const updatedVendor = { ...vendor, ...updates };
      this.vendors.set(id, updatedVendor);
      return updatedVendor;
    }
    return undefined;
  }

  async getAllVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values())
      .sort((a, b) => new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime());
  }

  async getPendingVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values())
      .filter(vendor => !vendor.isApproved)
      .sort((a, b) => new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime());
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
      return Object.entries(filters).every(([key, value]) => {
        return deal[key as keyof Deal] === value;
      });
    });
  }

  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const deal: Deal = {
      id: this.currentDealId++,
      ...insertDeal,
      imageUrl: insertDeal.imageUrl || null,

      originalPrice: insertDeal.originalPrice || null,
      discountedPrice: insertDeal.discountedPrice || null,
      maxRedemptions: insertDeal.maxRedemptions || null,
      latitude: insertDeal.latitude || null,
      longitude: insertDeal.longitude || null,
      currentRedemptions: 0,
      viewCount: 0,
      validFrom: new Date(),
      isActive: true,
      isApproved: false,
      approvedBy: null,
      requiredMembership: insertDeal.requiredMembership || "basic",
      createdAt: new Date(),
    };
    this.deals.set(deal.id, deal);
    return deal;
  }

  async updateDeal(id: number, updates: Partial<Deal>): Promise<Deal | undefined> {
    const deal = this.deals.get(id);
    if (deal) {
      const updatedDeal = { ...deal, ...updates };
      this.deals.set(id, updatedDeal);
      return updatedDeal;
    }
    return undefined;
  }

  async deleteDeal(id: number): Promise<boolean> {
    return this.deals.delete(id);
  }

  async getActiveDeals(): Promise<Deal[]> {
    return Array.from(this.deals.values()).filter(deal => deal.isActive && deal.isApproved);
  }

  async getDealsByCategory(category: string): Promise<Deal[]> {
    return Array.from(this.deals.values()).filter(deal => deal.category === category);
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
    const claim: DealClaim = {
      id: this.currentDealClaimId++,
      ...insertClaim,
      status: insertClaim.status || "claimed",
      usedAt: insertClaim.usedAt || null,
      claimedAt: new Date(),
    };
    this.dealClaims.set(claim.id, claim);
    return claim;
  }

  async createDealClaim(insertClaim: InsertDealClaim): Promise<DealClaim> {
    return this.claimDeal(insertClaim);
  }

  async incrementDealRedemptions(dealId: number): Promise<void> {
    const deal = this.deals.get(dealId);
    if (deal) {
      deal.currentRedemptions = (deal.currentRedemptions || 0) + 1;
      this.deals.set(dealId, deal);
    }
  }

  async getUserClaims(userId: number): Promise<DealClaim[]> {
    return Array.from(this.dealClaims.values()).filter(claim => claim.userId === userId);
  }

  async getDealClaims(dealId: number): Promise<DealClaim[]> {
    return Array.from(this.dealClaims.values()).filter(claim => claim.dealId === dealId);
  }

  async updateClaimStatus(id: number, status: string, usedAt?: Date): Promise<DealClaim | undefined> {
    const claim = this.dealClaims.get(id);
    if (claim) {
      const updatedClaim = { ...claim, status, usedAt: usedAt || claim.usedAt };
      this.dealClaims.set(id, updatedClaim);
      return updatedClaim;
    }
    return undefined;
  }

  async updateDealClaim(id: number, updates: Partial<DealClaim>): Promise<DealClaim | undefined> {
    const claim = this.dealClaims.get(id);
    if (claim) {
      const updatedClaim = { ...claim, ...updates };
      this.dealClaims.set(id, updatedClaim);
      return updatedClaim;
    }
    return undefined;
  }

  // Help ticket operations
  async createHelpTicket(insertTicket: InsertHelpTicket): Promise<HelpTicket> {
    const ticket: HelpTicket = {
      id: this.currentHelpTicketId++,
      ...insertTicket,
      status: insertTicket.status || "open",
      priority: insertTicket.priority || "medium",
      assignedTo: insertTicket.assignedTo || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.helpTickets.set(ticket.id, ticket);
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
    if (ticket) {
      const updatedTicket = { ...ticket, ...updates };
      this.helpTickets.set(id, updatedTicket);
      return updatedTicket;
    }
    return undefined;
  }

  // System log operations
  async createSystemLog(insertLog: InsertSystemLog): Promise<SystemLog> {
    const log: SystemLog = {
      id: this.currentSystemLogId++,
      ...insertLog,
      userId: insertLog.userId || null,
      ipAddress: insertLog.ipAddress || null,
      userAgent: insertLog.userAgent || null,
      details: insertLog.details || {},
      createdAt: new Date(),
    };
    this.systemLogs.set(log.id, log);
    return log;
  }

  async getSystemLogs(limit = 100): Promise<SystemLog[]> {
    const logs = Array.from(this.systemLogs.values());
    return logs.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)).slice(0, limit);
  }

  // Wishlist operations
  async addToWishlist(insertWishlist: InsertWishlist): Promise<Wishlist> {
    const wishlist: Wishlist = {
      id: this.currentWishlistId++,
      ...insertWishlist,
      addedAt: new Date(),
    };
    this.wishlists.set(wishlist.id, wishlist);
    return wishlist;
  }

  async removeFromWishlist(userId: number, dealId: number): Promise<boolean> {
    const wishlistItem = Array.from(this.wishlists.values()).find(
      item => item.userId === userId && item.dealId === dealId
    );
    if (wishlistItem) {
      return this.wishlists.delete(wishlistItem.id);
    }
    return false;
  }

  async getUserWishlist(userId: number): Promise<Wishlist[]> {
    return Array.from(this.wishlists.values()).filter(item => item.userId === userId);
  }

  async isInWishlist(userId: number, dealId: number): Promise<boolean> {
    return Array.from(this.wishlists.values()).some(
      item => item.userId === userId && item.dealId === dealId
    );
  }

  async getMostClaimedDeals(): Promise<Deal[]> {
    const dealClaimCounts = new Map<number, number>();
    
    Array.from(this.dealClaims.values()).forEach(claim => {
      const count = dealClaimCounts.get(claim.dealId) || 0;
      dealClaimCounts.set(claim.dealId, count + 1);
    });

    const deals = Array.from(this.deals.values()).filter(deal => deal.isActive && deal.isApproved);
    
    return deals.sort((a, b) => {
      const aCount = dealClaimCounts.get(a.id) || 0;
      const bCount = dealClaimCounts.get(b.id) || 0;
      return bCount - aCount;
    });
  }

  async getDealCategoryCounts(): Promise<Record<string, number>> {
    const categoryCounts: Record<string, number> = {};
    Array.from(this.deals.values()).forEach(deal => {
      categoryCounts[deal.category] = (categoryCounts[deal.category] || 0) + 1;
    });
    return categoryCounts;
  }

  async deleteDealsByCategory(category: string): Promise<boolean> {
    const dealsToDelete = Array.from(this.deals.values()).filter(deal => deal.category === category);
    dealsToDelete.forEach(deal => this.deals.delete(deal.id));
    return dealsToDelete.length > 0;
  }

  async resetAllDeals(): Promise<boolean> {
    this.deals.clear();
    this.dealClaims.clear();
    this.currentDealId = 1;
    this.currentDealClaimId = 1;
    return true;
  }

  async getAnalytics() {
    const totalUsers = this.users.size;
    const totalVendors = this.vendors.size;
    const totalDeals = this.deals.size;
    const totalClaims = this.dealClaims.size;
    
    const cityStats: { city: string; dealCount: number; userCount: number }[] = [];
    const categoryStats: { category: string; dealCount: number; claimCount: number }[] = [];
    
    // Calculate city stats
    const cityUserCounts = new Map<string, number>();
    const cityDealCounts = new Map<string, number>();
    
    Array.from(this.users.values()).forEach(user => {
      if (user.city) {
        cityUserCounts.set(user.city, (cityUserCounts.get(user.city) || 0) + 1);
      }
    });
    
    Array.from(this.vendors.values()).forEach(vendor => {
      const vendorDeals = Array.from(this.deals.values()).filter(deal => deal.vendorId === vendor.id).length;
      cityDealCounts.set(vendor.city, (cityDealCounts.get(vendor.city) || 0) + vendorDeals);
    });
    
    Array.from(cityUserCounts.keys()).forEach(city => {
      cityStats.push({
        city,
        userCount: cityUserCounts.get(city) || 0,
        dealCount: cityDealCounts.get(city) || 0,
      });
    });
    
    // Calculate category stats
    const categoryDealCounts = new Map<string, number>();
    const categoryClaimCounts = new Map<string, number>();
    
    Array.from(this.deals.values()).forEach(deal => {
      categoryDealCounts.set(deal.category, (categoryDealCounts.get(deal.category) || 0) + 1);
    });
    
    Array.from(this.dealClaims.values()).forEach(claim => {
      const deal = this.deals.get(claim.dealId);
      if (deal) {
        categoryClaimCounts.set(deal.category, (categoryClaimCounts.get(deal.category) || 0) + 1);
      }
    });
    
    Array.from(categoryDealCounts.keys()).forEach(category => {
      categoryStats.push({
        category,
        dealCount: categoryDealCounts.get(category) || 0,
        claimCount: categoryClaimCounts.get(category) || 0,
      });
    });
    
    return {
      totalUsers,
      totalVendors,
      totalDeals,
      totalClaims,
      revenueEstimate: totalClaims * 150, // Rough estimate
      cityStats,
      categoryStats,
    };
  }

  // POS operations
  async createPosSession(insertSession: InsertPosSession): Promise<PosSession> {
    const session: PosSession = {
      id: this.currentPosSessionId++,
      vendorId: insertSession.vendorId,
      terminalId: insertSession.terminalId,
      sessionToken: insertSession.sessionToken,
      isActive: insertSession.isActive ?? true,
      startedAt: new Date(),
      endedAt: null,
      totalTransactions: 0,
      totalAmount: "0",
    };
    this.posSessions.set(session.id, session);
    return session;
  }

  async endPosSession(sessionId: number): Promise<PosSession | undefined> {
    const session = this.posSessions.get(sessionId);
    if (session) {
      const updatedSession = { ...session, endedAt: new Date(), isActive: false };
      this.posSessions.set(sessionId, updatedSession);
      return updatedSession;
    }
    return undefined;
  }

  async getActivePosSession(vendorId: number, terminalId: string): Promise<PosSession | undefined> {
    return Array.from(this.posSessions.values())
      .find(session => session.vendorId === vendorId && session.terminalId === terminalId && session.isActive);
  }

  async getPosSessionsByVendor(vendorId: number): Promise<PosSession[]> {
    return Array.from(this.posSessions.values())
      .filter(session => session.vendorId === vendorId);
  }

  async createPosTransaction(insertTransaction: InsertPosTransaction): Promise<PosTransaction> {
    const transaction: PosTransaction = {
      id: this.currentPosTransactionId++,
      sessionId: insertTransaction.sessionId,
      dealId: insertTransaction.dealId,
      customerId: insertTransaction.customerId ?? null,
      transactionType: insertTransaction.transactionType,
      amount: insertTransaction.amount,
      savingsAmount: insertTransaction.savingsAmount,
      pinVerified: insertTransaction.pinVerified ?? null,
      paymentMethod: insertTransaction.paymentMethod ?? null,
      status: insertTransaction.status ?? 'completed',
      receiptNumber: insertTransaction.receiptNumber ?? null,
      notes: insertTransaction.notes ?? null,
      processedAt: new Date(),
    };
    this.posTransactions.set(transaction.id, transaction);

    // Update session totals
    const session = this.posSessions.get(transaction.sessionId);
    if (session) {
      session.totalTransactions = (session.totalTransactions || 0) + 1;
      session.totalAmount = (parseFloat(session.totalAmount || "0") + parseFloat(transaction.amount.toString())).toString();
      this.posSessions.set(session.id, session);
    }

    return transaction;
  }

  async getPosTransactionsBySession(sessionId: number): Promise<PosTransaction[]> {
    return Array.from(this.posTransactions.values())
      .filter(transaction => transaction.sessionId === sessionId);
  }

  async getPosTransactionsByVendor(vendorId: number): Promise<PosTransaction[]> {
    const vendorSessions = await this.getPosSessionsByVendor(vendorId);
    const sessionIds = vendorSessions.map(session => session.id);
    return Array.from(this.posTransactions.values())
      .filter(transaction => sessionIds.includes(transaction.sessionId));
  }

  async updatePosTransaction(id: number, updates: Partial<PosTransaction>): Promise<PosTransaction | undefined> {
    const transaction = this.posTransactions.get(id);
    if (transaction) {
      const updatedTransaction = { ...transaction, ...updates };
      this.posTransactions.set(id, updatedTransaction);
      return updatedTransaction;
    }
    return undefined;
  }

  async createPosInventory(insertInventory: InsertPosInventory): Promise<PosInventory> {
    const inventory: PosInventory = {
      id: this.currentPosInventoryId++,
      vendorId: insertInventory.vendorId,
      dealId: insertInventory.dealId,
      availableQuantity: insertInventory.availableQuantity,
      reservedQuantity: insertInventory.reservedQuantity ?? 0,
      reorderLevel: insertInventory.reorderLevel ?? 0,
      lastUpdated: new Date(),
    };
    this.posInventory.set(inventory.id, inventory);
    return inventory;
  }

  async updatePosInventory(id: number, updates: Partial<PosInventory>): Promise<PosInventory | undefined> {
    const inventory = this.posInventory.get(id);
    if (inventory) {
      const updatedInventory = { ...inventory, ...updates, lastUpdated: new Date() };
      this.posInventory.set(id, updatedInventory);
      return updatedInventory;
    }
    return undefined;
  }

  async getPosInventoryByVendor(vendorId: number): Promise<PosInventory[]> {
    return Array.from(this.posInventory.values())
      .filter(inventory => inventory.vendorId === vendorId);
  }

  async getPosInventoryByDeal(dealId: number): Promise<PosInventory | undefined> {
    return Array.from(this.posInventory.values())
      .find(inventory => inventory.dealId === dealId);
  }
}

export const storage = new MemStorage();