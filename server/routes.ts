import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, signupSchema, insertVendorSchema, insertDealSchema, insertHelpTicketSchema } from "@shared/schema";
import { z } from "zod";

// Session interface
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
    email: string;
  };
}

// Middleware to check authentication
const requireAuth = (req: AuthenticatedRequest, res: Response, next: any) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// Middleware to check specific roles
const requireRole = (roles: string[]) => (req: AuthenticatedRequest, res: Response, next: any) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock session middleware - in production, use express-session with proper store
  app.use((req: AuthenticatedRequest, res, next) => {
    // For demo purposes, we'll simulate sessions
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // In production, verify JWT token
      try {
        const [id, role, email] = token.split('|');
        req.user = { id: parseInt(id), role, email };
      } catch (e) {
        // Invalid token, continue without user
      }
    }
    next();
  });

  // Authentication routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In production, use bcrypt to compare passwords
      // For demo, we'll accept any password for existing users
      const token = `${user.id}|${user.role}|${user.email}`;
      
      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          membershipPlan: user.membershipPlan,
          isPromotionalUser: user.isPromotionalUser,
        },
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/auth/signup', async (req, res) => {
    try {
      const userData = signupSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: `$2a$10$hashed_${userData.password}`, // In production, hash with bcrypt
      });
      
      const token = `${user.id}|${user.role}|${user.email}`;
      
      // Log signup activity
      await storage.createSystemLog({
        userId: user.id,
        action: "USER_SIGNUP",
        details: { role: user.role, email: user.email },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      
      res.status(201).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          membershipPlan: user.membershipPlan,
          isPromotionalUser: user.isPromotionalUser,
        },
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/auth/me', requireAuth, async (req: AuthenticatedRequest, res) => {
    const user = await storage.getUser(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      membershipPlan: user.membershipPlan,
      membershipExpiry: user.membershipExpiry,
      isPromotionalUser: user.isPromotionalUser,
      totalSavings: user.totalSavings,
      dealsClaimed: user.dealsClaimed,
      city: user.city,
      state: user.state,
    });
  });

  // Deal routes
  app.get('/api/deals', async (req, res) => {
    try {
      const { category, city } = req.query;
      let deals = await storage.getActiveDeals();
      
      if (category) {
        deals = deals.filter(deal => deal.category === category);
      }
      
      // Filter by vendor city if city parameter provided
      if (city) {
        const vendors = await storage.getAllVendors();
        const cityVendorIds = vendors
          .filter(vendor => vendor.city === city)
          .map(vendor => vendor.id);
        deals = deals.filter(deal => cityVendorIds.includes(deal.vendorId));
      }
      
      // Include vendor info
      const vendors = await storage.getAllVendors();
      const vendorMap = new Map(vendors.map(v => [v.id, v]));
      
      const dealsWithVendors = deals.map(deal => ({
        ...deal,
        vendor: vendorMap.get(deal.vendorId),
      }));
      
      res.json(dealsWithVendors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deals" });
    }
  });

  app.get('/api/deals/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deal = await storage.getDeal(id);
      
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      // Increment view count
      await storage.incrementDealViews(id);
      
      // Get vendor info
      const vendor = await storage.getVendor(deal.vendorId);
      
      res.json({
        ...deal,
        vendor,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deal" });
    }
  });

  app.post('/api/deals/:id/claim', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const dealId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      const deal = await storage.getDeal(dealId);
      if (!deal || !deal.isActive || !deal.isApproved) {
        return res.status(404).json({ message: "Deal not found or not available" });
      }
      
      // Check if deal is still valid
      if (new Date(deal.validUntil) < new Date()) {
        return res.status(400).json({ message: "Deal has expired" });
      }
      
      // Check redemption limit
      if (deal.maxRedemptions && deal.currentRedemptions >= deal.maxRedemptions) {
        return res.status(400).json({ message: "Deal redemption limit reached" });
      }
      
      // Check if user already claimed this deal
      const existingClaim = (await storage.getUserClaims(userId))
        .find(claim => claim.dealId === dealId);
      if (existingClaim) {
        return res.status(400).json({ message: "Deal already claimed" });
      }
      
      // Check membership requirement
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const membershipLevels = { basic: 1, premium: 2, ultimate: 3 };
      const userLevel = membershipLevels[user.membershipPlan as keyof typeof membershipLevels] || 1;
      const requiredLevel = membershipLevels[deal.requiredMembership as keyof typeof membershipLevels] || 1;
      
      if (userLevel < requiredLevel) {
        return res.status(403).json({ message: "Upgrade membership to claim this deal" });
      }
      
      // Calculate savings
      const originalPrice = parseFloat(deal.originalPrice || "0");
      const discountedPrice = parseFloat(deal.discountedPrice || "0");
      const savingsAmount = (originalPrice - discountedPrice).toString();
      
      // Create claim
      const claim = await storage.claimDeal({
        userId,
        dealId,
        savingsAmount,
      });
      
      res.status(201).json(claim);
    } catch (error) {
      res.status(500).json({ message: "Failed to claim deal" });
    }
  });

  // User claim history
  app.get('/api/users/claims', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const claims = await storage.getUserClaims(req.user!.id);
      
      // Include deal and vendor info
      const deals = await storage.getActiveDeals();
      const vendors = await storage.getAllVendors();
      const dealMap = new Map(deals.map(d => [d.id, d]));
      const vendorMap = new Map(vendors.map(v => [v.id, v]));
      
      const claimsWithDetails = claims.map(claim => {
        const deal = dealMap.get(claim.dealId);
        const vendor = deal ? vendorMap.get(deal.vendorId) : null;
        return {
          ...claim,
          deal,
          vendor,
        };
      });
      
      res.json(claimsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch claims" });
    }
  });

  // Vendor routes
  app.post('/api/vendors/register', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const vendorData = insertVendorSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      
      // Check if user already has a vendor profile
      const existingVendor = await storage.getVendorByUserId(req.user!.id);
      if (existingVendor) {
        return res.status(400).json({ message: "Vendor profile already exists" });
      }
      
      const vendor = await storage.createVendor(vendorData);
      
      // Log vendor registration
      await storage.createSystemLog({
        userId: req.user!.id,
        action: "VENDOR_REGISTRATION",
        details: { businessName: vendor.businessName, city: vendor.city },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      
      res.status(201).json(vendor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to register vendor" });
    }
  });

  app.get('/api/vendors/me', requireAuth, requireRole(['vendor']), async (req: AuthenticatedRequest, res) => {
    try {
      const vendor = await storage.getVendorByUserId(req.user!.id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }
      res.json(vendor);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendor profile" });
    }
  });

  app.get('/api/vendors/deals', requireAuth, requireRole(['vendor']), async (req: AuthenticatedRequest, res) => {
    try {
      const vendor = await storage.getVendorByUserId(req.user!.id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }
      
      const deals = await storage.getDealsByVendor(vendor.id);
      res.json(deals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendor deals" });
    }
  });

  app.post('/api/vendors/deals', requireAuth, requireRole(['vendor']), async (req: AuthenticatedRequest, res) => {
    try {
      const vendor = await storage.getVendorByUserId(req.user!.id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }
      
      if (!vendor.isApproved) {
        return res.status(403).json({ message: "Vendor not approved yet" });
      }
      
      const dealData = insertDealSchema.parse({
        ...req.body,
        vendorId: vendor.id,
      });
      
      const deal = await storage.createDeal(dealData);
      res.status(201).json(deal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create deal" });
    }
  });

  app.put('/api/vendors/deals/:id', requireAuth, requireRole(['vendor']), async (req: AuthenticatedRequest, res) => {
    try {
      const dealId = parseInt(req.params.id);
      const vendor = await storage.getVendorByUserId(req.user!.id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }
      
      const existingDeal = await storage.getDeal(dealId);
      if (!existingDeal || existingDeal.vendorId !== vendor.id) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      const updates = insertDealSchema.partial().parse(req.body);
      const updatedDeal = await storage.updateDeal(dealId, updates);
      
      res.json(updatedDeal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update deal" });
    }
  });

  app.delete('/api/vendors/deals/:id', requireAuth, requireRole(['vendor']), async (req: AuthenticatedRequest, res) => {
    try {
      const dealId = parseInt(req.params.id);
      const vendor = await storage.getVendorByUserId(req.user!.id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }
      
      const existingDeal = await storage.getDeal(dealId);
      if (!existingDeal || existingDeal.vendorId !== vendor.id) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      await storage.deleteDeal(dealId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete deal" });
    }
  });

  // Admin routes
  app.get('/api/admin/analytics', requireAuth, requireRole(['admin', 'superadmin']), async (req: AuthenticatedRequest, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get('/api/admin/users', requireAuth, requireRole(['admin', 'superadmin']), async (req: AuthenticatedRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      // Don't send passwords
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/vendors', requireAuth, requireRole(['admin', 'superadmin']), async (req: AuthenticatedRequest, res) => {
    try {
      const vendors = await storage.getAllVendors();
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  app.get('/api/admin/vendors/pending', requireAuth, requireRole(['admin', 'superadmin']), async (req: AuthenticatedRequest, res) => {
    try {
      const vendors = await storage.getPendingVendors();
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending vendors" });
    }
  });

  app.post('/api/admin/vendors/:id/approve', requireAuth, requireRole(['admin', 'superadmin']), async (req: AuthenticatedRequest, res) => {
    try {
      const vendorId = parseInt(req.params.id);
      const vendor = await storage.approveVendor(vendorId);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      // Log approval
      await storage.createSystemLog({
        userId: req.user!.id,
        action: "VENDOR_APPROVED",
        details: { vendorId, businessName: vendor.businessName },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      
      res.json(vendor);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve vendor" });
    }
  });

  app.get('/api/admin/deals/pending', requireAuth, requireRole(['admin', 'superadmin']), async (req: AuthenticatedRequest, res) => {
    try {
      const deals = await storage.getPendingDeals();
      
      // Include vendor info
      const vendors = await storage.getAllVendors();
      const vendorMap = new Map(vendors.map(v => [v.id, v]));
      
      const dealsWithVendors = deals.map(deal => ({
        ...deal,
        vendor: vendorMap.get(deal.vendorId),
      }));
      
      res.json(dealsWithVendors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending deals" });
    }
  });

  app.post('/api/admin/deals/:id/approve', requireAuth, requireRole(['admin', 'superadmin']), async (req: AuthenticatedRequest, res) => {
    try {
      const dealId = parseInt(req.params.id);
      const deal = await storage.approveDeal(dealId, req.user!.id);
      
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      // Log approval
      await storage.createSystemLog({
        userId: req.user!.id,
        action: "DEAL_APPROVED",
        details: { dealId, title: deal.title },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      
      res.json(deal);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve deal" });
    }
  });

  // Help ticket routes
  app.post('/api/help-tickets', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const ticketData = insertHelpTicketSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      
      const ticket = await storage.createHelpTicket(ticketData);
      res.status(201).json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create help ticket" });
    }
  });

  app.get('/api/help-tickets', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      let tickets;
      if (req.user!.role === 'admin' || req.user!.role === 'superadmin') {
        tickets = await storage.getHelpTickets();
      } else {
        tickets = await storage.getUserHelpTickets(req.user!.id);
      }
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch help tickets" });
    }
  });

  // Super admin routes
  app.get('/api/superadmin/logs', requireAuth, requireRole(['superadmin']), async (req: AuthenticatedRequest, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const logs = await storage.getSystemLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system logs" });
    }
  });

  // Categories endpoint
  app.get('/api/categories', async (req, res) => {
    const categories = [
      { id: 'fashion', name: 'Fashion', icon: 'fas fa-tshirt', color: 'saffron', dealCount: 120 },
      { id: 'electronics', name: 'Electronics', icon: 'fas fa-laptop', color: 'primary', dealCount: 85 },
      { id: 'travel', name: 'Travel', icon: 'fas fa-plane', color: 'success', dealCount: 45 },
      { id: 'food', name: 'Food', icon: 'fas fa-utensils', color: 'warning', dealCount: 200 },
      { id: 'home', name: 'Home', icon: 'fas fa-home', color: 'royal', dealCount: 75 },
      { id: 'fitness', name: 'Fitness', icon: 'fas fa-dumbbell', color: 'secondary', dealCount: 30 },
    ];
    res.json(categories);
  });

  // Cities endpoint
  app.get('/api/cities', async (req, res) => {
    const cities = [
      { name: 'Mumbai', state: 'Maharashtra', dealCount: 2845 },
      { name: 'Delhi', state: 'Delhi', dealCount: 2134 },
      { name: 'Bangalore', state: 'Karnataka', dealCount: 1987 },
      { name: 'Chennai', state: 'Tamil Nadu', dealCount: 1543 },
      { name: 'Hyderabad', state: 'Telangana', dealCount: 1234 },
      { name: 'Pune', state: 'Maharashtra', dealCount: 987 },
      { name: 'Kolkata', state: 'West Bengal', dealCount: 876 },
      { name: 'Ahmedabad', state: 'Gujarat', dealCount: 654 },
    ];
    res.json(cities);
  });

  const httpServer = createServer(app);
  return httpServer;
}
