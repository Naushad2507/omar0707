import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, signupSchema, insertVendorSchema, insertDealSchema, insertHelpTicketSchema, insertWishlistSchema } from "@shared/schema";
import { z } from "zod";

// Session interface
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
    email: string;
  };
  dealInfo?: {
    deal: any;
    user: any;
    membershipTier: string;
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

// Middleware to check membership tier access for deals
const checkMembershipAccess = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        message: "Please log in to access deal details",
        requiresAuth: true 
      });
    }

    const dealId = parseInt(req.params.id);
    const deal = await storage.getDeal(dealId);
    
    if (!deal || !deal.isActive || !deal.isApproved) {
      return res.status(404).json({ message: "Deal not found or not available" });
    }

    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const membershipTier = user.membershipPlan || 'basic';
    const dealCategory = deal.category.toLowerCase();

    // Check if user can access this deal based on membership tier
    let canAccess = false;
    let upgradeMessage = '';
    let suggestedTier = '';

    switch (membershipTier) {
      case 'basic':
        const basicAllowedCategories = ['restaurants', 'fashion', 'travel', 'food'];
        if (basicAllowedCategories.includes(dealCategory)) {
          canAccess = true;
        } else {
          upgradeMessage = `Upgrade your plan to access ${deal.category} deals. Current plan: Basic`;
          suggestedTier = 'premium';
        }
        break;
      case 'premium':
        const premiumRestrictedCategories = ['luxury', 'premium-electronics'];
        if (!premiumRestrictedCategories.includes(dealCategory)) {
          canAccess = true;
        } else {
          upgradeMessage = `Upgrade to Ultimate plan to access premium ${deal.category} deals. Current plan: Premium`;
          suggestedTier = 'ultimate';
        }
        break;
      case 'ultimate':
        canAccess = true;
        break;
      default:
        upgradeMessage = 'Please upgrade your membership to access deals';
        suggestedTier = 'premium';
    }

    if (!canAccess) {
      return res.status(403).json({
        message: upgradeMessage,
        requiresUpgrade: true,
        currentTier: membershipTier,
        suggestedTier: suggestedTier,
        dealCategory: deal.category,
        dealTitle: deal.title
      });
    }

    // Store deal info in request for use in route handler
    req.dealInfo = { deal, user, membershipTier };
    next();
  } catch (error) {
    console.error("Error checking membership access:", error);
    res.status(500).json({ message: "Failed to verify membership access" });
  }
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

  // Public deal detail endpoint (no auth required for basic viewing)
  app.get('/api/deals/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deal = await storage.getDeal(id);
      
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      // Get vendor info
      const vendor = await storage.getVendor(deal.vendorId);
      
      // Remove sensitive data like discount code from public endpoint
      const { discountCode, ...dealData } = deal;
      
      res.json({
        ...dealData,
        vendor,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deal" });
    }
  });

  // Protected deal detail endpoint with membership verification
  app.get('/api/deals/:id/secure', checkMembershipAccess, async (req: AuthenticatedRequest, res) => {
    try {
      const { deal, user, membershipTier } = req.dealInfo!;
      
      // Increment view count for authenticated access
      await storage.incrementDealViews(deal.id);
      
      // Get vendor info
      const vendor = await storage.getVendor(deal.vendorId);
      
      // Include discount code for authenticated users with proper membership
      res.json({
        ...deal,
        vendor,
        membershipTier,
        hasAccess: true
      });
    } catch (error) {
      console.error("Error fetching secure deal:", error);
      res.status(500).json({ message: "Failed to fetch deal details" });
    }
  });

  // Secure endpoint to get discount code based on user's membership tier
  app.get('/api/deals/:id/discount-code', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const dealId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      const deal = await storage.getDeal(dealId);
      if (!deal || !deal.isActive || !deal.isApproved) {
        return res.status(404).json({ message: "Deal not found or not available" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Define tier-based access rules
      const membershipTier = user.membershipPlan || 'basic';
      const dealCategory = deal.category.toLowerCase();
      
      // Business logic for discount code visibility
      let canAccessCode = false;
      let requiresClick = false;
      let upgradeMessage = '';
      
      switch (membershipTier) {
        case 'basic':
          // Auto-reveal for: restaurants (food), fashion, travel
          const basicAllowedCategories = ['restaurants', 'fashion', 'travel'];
          if (basicAllowedCategories.includes(dealCategory)) {
            canAccessCode = true;
          } else {
            upgradeMessage = 'Upgrade to Premium or Ultimate to access this deal';
          }
          break;
          
        case 'premium':
          // Auto-reveal for all except health and education
          const premiumRestrictedCategories = ['health', 'education'];
          if (premiumRestrictedCategories.includes(dealCategory)) {
            canAccessCode = true;
            requiresClick = true;
          } else {
            canAccessCode = true;
          }
          break;
          
        case 'ultimate':
          // Auto-reveal all discount codes
          canAccessCode = true;
          break;
          
        default:
          upgradeMessage = 'Please upgrade your membership to access discount codes';
      }
      
      if (!canAccessCode) {
        return res.status(403).json({ 
          message: upgradeMessage,
          requiresUpgrade: true,
          currentTier: membershipTier,
          suggestedTier: 'premium'
        });
      }
      
      // Log access for security auditing
      await storage.createSystemLog({
        userId: userId,
        action: "DISCOUNT_CODE_ACCESS",
        details: { 
          dealId: dealId, 
          dealTitle: deal.title,
          category: dealCategory,
          membershipTier: membershipTier,
          requiresClick: requiresClick
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      
      res.json({
        discountCode: deal.discountCode,
        requiresClick: requiresClick,
        membershipTier: membershipTier,
        category: dealCategory
      });
      
    } catch (error) {
      console.error("Error fetching discount code:", error);
      res.status(500).json({ message: "Failed to fetch discount code" });
    }
  });

  // Increment deal view count
  app.post('/api/deals/:id/view', async (req: AuthenticatedRequest, res) => {
    try {
      const dealId = parseInt(req.params.id);
      await storage.incrementDealViews(dealId);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to increment view count" });
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
      if (deal.maxRedemptions && (deal.currentRedemptions || 0) >= deal.maxRedemptions) {
        return res.status(400).json({ message: "Deal redemption limit reached" });
      }
      
      // Allow multiple claims per deal - removed the restriction
      // Users can now claim the same deal multiple times
      
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

  // Wishlist routes
  app.post('/api/wishlist', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { dealId } = insertWishlistSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      
      const wishlist = await storage.addToWishlist({
        userId: req.user!.id,
        dealId,
      });
      
      res.status(201).json(wishlist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });

  app.delete('/api/wishlist/:dealId', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const dealId = parseInt(req.params.dealId);
      const removed = await storage.removeFromWishlist(req.user!.id, dealId);
      
      if (!removed) {
        return res.status(404).json({ message: "Item not found in wishlist" });
      }
      
      res.json({ message: "Removed from wishlist" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });

  app.get('/api/wishlist', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const wishlist = await storage.getUserWishlist(req.user!.id);
      
      // Include deal and vendor info
      const deals = await storage.getActiveDeals();
      const vendors = await storage.getAllVendors();
      const dealMap = new Map(deals.map(d => [d.id, d]));
      const vendorMap = new Map(vendors.map(v => [v.id, v]));
      
      const wishlistWithDetails = wishlist.map(item => {
        const deal = dealMap.get(item.dealId);
        const vendor = deal ? vendorMap.get(deal.vendorId) : null;
        return {
          ...item,
          deal,
          vendor,
        };
      });
      
      res.json(wishlistWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.get('/api/wishlist/check/:dealId', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const dealId = parseInt(req.params.dealId);
      const isInWishlist = await storage.isInWishlist(req.user!.id, dealId);
      res.json({ isInWishlist });
    } catch (error) {
      res.status(500).json({ message: "Failed to check wishlist status" });
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

  // User self-upgrade membership endpoint
  app.post('/api/users/upgrade-membership', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { membershipPlan } = req.body;
      
      if (!['basic', 'premium', 'ultimate'].includes(membershipPlan)) {
        return res.status(400).json({ message: "Invalid membership plan" });
      }
      
      const updatedUser = await storage.updateUser(userId, {
        membershipPlan,
        membershipExpiry: membershipPlan !== 'basic' ? new Date('2025-12-31') : null,
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Log the upgrade
      await storage.createSystemLog({
        userId,
        action: "MEMBERSHIP_UPGRADED",
        details: { 
          newPlan: membershipPlan,
          upgradeDate: new Date().toISOString()
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      
      // Don't send password
      const { password, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error) {
      console.error("Error upgrading membership:", error);
      res.status(500).json({ message: "Failed to upgrade membership" });
    }
  });

  app.put('/api/admin/users/:id/upgrade', requireAuth, requireRole(['admin', 'superadmin']), async (req: AuthenticatedRequest, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { membershipPlan } = req.body;
      
      if (!['basic', 'premium', 'ultimate'].includes(membershipPlan)) {
        return res.status(400).json({ message: "Invalid membership plan" });
      }
      
      const updatedUser = await storage.updateUser(userId, {
        membershipPlan,
        membershipExpiry: membershipPlan !== 'basic' ? new Date('2025-12-31') : null,
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password
      const { password, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to upgrade user" });
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

  // Get nearby deals based on location
  // Get individual deal by ID
  // Deal recommendations endpoint
  app.post('/api/deals/recommendations', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const preferences = req.body;
      
      // Get all active deals
      const allDeals = await storage.getActiveDeals();
      let recommendedDeals = [];
      
      // Filter deals based on preferences
      for (const deal of allDeals) {
        const vendor = await storage.getVendor(deal.vendorId);
        if (!vendor) continue;
        
        // Check category match
        if (preferences.categories && preferences.categories.length > 0) {
          if (!preferences.categories.includes(deal.category)) continue;
        }
        
        // Check location match
        if (preferences.location && vendor.city !== preferences.location) continue;
        
        // Check price range
        const price = parseFloat(deal.discountedPrice || deal.originalPrice || '0');
        if (price < preferences.priceRange[0] || price > preferences.priceRange[1]) continue;
        
        recommendedDeals.push({
          ...deal,
          vendor: {
            businessName: vendor.businessName,
            city: vendor.city,
            state: vendor.state,
          },
          matchScore: Math.random() * 100 // Simple scoring for now
        });
      }
      
      // Sort by match score and limit results
      recommendedDeals.sort((a, b) => b.matchScore - a.matchScore);
      recommendedDeals = recommendedDeals.slice(0, 20);
      
      // Log recommendation generation
      await storage.createSystemLog({
        userId,
        action: "RECOMMENDATIONS_GENERATED",
        details: {
          preferences,
          resultsCount: recommendedDeals.length
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      
      res.json({
        recommendations: recommendedDeals,
        preferences,
        generated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  app.get('/api/deals/:id', async (req: AuthenticatedRequest, res) => {
    try {
      const dealId = parseInt(req.params.id);
      const deal = await storage.getDeal(dealId);
      
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      // Get vendor information
      let dealWithVendor: any = { ...deal };
      if (deal.vendorId) {
        const vendor = await storage.getVendor(deal.vendorId);
        if (vendor) {
          dealWithVendor.vendor = vendor;
        }
      }
      
      res.json(dealWithVendor);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deal" });
    }
  });

  app.get('/api/deals/nearby/:dealId', async (req: AuthenticatedRequest, res) => {
    try {
      const dealId = parseInt(req.params.dealId);
      const currentDeal = await storage.getDeal(dealId);
      
      if (!currentDeal) {
        return res.status(404).json({ error: 'Deal not found' });
      }

      // Get all active deals
      const allDeals = await storage.getActiveDeals();
      const vendors = await storage.getAllVendors();
      
      // Create vendor lookup map
      const vendorMap = new Map(vendors.map(v => [v.id, v]));
      
      // Filter nearby deals based on category similarity and location
      const nearbyDeals = allDeals
        .filter(deal => deal.id !== dealId) // Exclude current deal
        .filter(deal => {
          // Prioritize same category deals
          if (deal.category === currentDeal.category) return true;
          // Include other deals with probability based on distance simulation
          return Math.random() < 0.4;
        })
        .slice(0, 4) // Limit to 4 nearby deals
        .map(deal => {
          const vendor = vendorMap.get(deal.vendorId);
          return {
            ...deal,
            vendor,
            distance: (Math.random() * 4 + 0.8).toFixed(1), // Distance between 0.8-4.8 km
          };
        })
        .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)); // Sort by distance

      res.json(nearbyDeals);
    } catch (error) {
      console.error('Error fetching nearby deals:', error);
      res.status(500).json({ error: 'Failed to fetch nearby deals' });
    }
  });

  // Categories endpoint
  app.get('/api/categories', async (req, res) => {
    const categories = [
      { id: 'electronics', name: 'Electronics', icon: 'fas fa-laptop', color: 'primary', dealCount: 150 },
      { id: 'fashion', name: 'Fashion and Clothing', icon: 'fas fa-tshirt', color: 'saffron', dealCount: 220 },
      { id: 'beauty', name: 'Beauty and Fitness', icon: 'fas fa-heart', color: 'secondary', dealCount: 80 },
      { id: 'luxury', name: 'Luxury Goods', icon: 'fas fa-gem', color: 'royal', dealCount: 45 },
      { id: 'horoscope', name: 'Horoscope', icon: 'fas fa-star', color: 'warning', dealCount: 25 },
      { id: 'health', name: 'Health', icon: 'fas fa-plus-circle', color: 'success', dealCount: 90 },
      { id: 'restaurants', name: 'Restaurants', icon: 'fas fa-utensils', color: 'warning', dealCount: 180 },
      { id: 'entertainment', name: 'Entertainment', icon: 'fas fa-music', color: 'primary', dealCount: 120 },
      { id: 'home', name: 'Home and Furniture', icon: 'fas fa-home', color: 'royal', dealCount: 95 },
      { id: 'events', name: 'Events', icon: 'fas fa-calendar', color: 'secondary', dealCount: 70 },
      { id: 'realestate', name: 'Real Estate', icon: 'fas fa-building', color: 'primary', dealCount: 35 },
      { id: 'education', name: 'Education', icon: 'fas fa-graduation-cap', color: 'success', dealCount: 60 },
      { id: 'freelancers', name: 'Freelancers', icon: 'fas fa-user-tie', color: 'saffron', dealCount: 40 },
      { id: 'consultants', name: 'Consultants', icon: 'fas fa-handshake', color: 'royal', dealCount: 30 },
      { id: 'travel', name: 'Travel and Tourism', icon: 'fas fa-plane', color: 'success', dealCount: 110 },
      { id: 'automotive', name: 'Automotive', icon: 'fas fa-car', color: 'primary', dealCount: 55 },
      { id: 'services', name: 'Services', icon: 'fas fa-tools', color: 'secondary', dealCount: 85 },
      { id: 'others', name: 'Others', icon: 'fas fa-ellipsis-h', color: 'warning', dealCount: 40 },
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

  // Admin deal distribution endpoints
  app.get('/api/admin/deal-distribution', requireAuth, requireRole(['admin', 'superadmin']), async (req: AuthenticatedRequest, res) => {
    try {
      const distribution = await storage.getDealCategoryCounts();
      res.json(distribution);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deal distribution" });
    }
  });

  app.delete('/api/admin/deals/category/:category', requireAuth, requireRole(['admin', 'superadmin']), async (req: AuthenticatedRequest, res) => {
    try {
      const { category } = req.params;
      const success = await storage.deleteDealsByCategory(category);
      if (success) {
        res.json({ message: `All deals in ${category} category deleted successfully` });
      } else {
        res.status(404).json({ message: "Category not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category deals" });
    }
  });

  app.post('/api/admin/deals/reset', requireAuth, requireRole(['admin', 'superadmin']), async (req: AuthenticatedRequest, res) => {
    try {
      const success = await storage.resetAllDeals();
      if (success) {
        res.json({ message: "All deals reset successfully" });
      } else {
        res.status(500).json({ message: "Failed to reset deals" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to reset deals" });
    }
  });

  // Most claimed deals endpoint
  app.get('/api/deals/most-claimed', async (req: AuthenticatedRequest, res) => {
    try {
      const deals = await storage.getMostClaimedDeals();
      res.json(deals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch most claimed deals" });
    }
  });

  // External API proxy endpoints
  app.get('/api/external/deals', async (req: AuthenticatedRequest, res) => {
    try {
      const response = await fetch('https://api.instoredealz.com/S0G1IP/Deals/AllDeals');
      if (!response.ok) {
        throw new Error(`External API error: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching external deals:', error);
      res.status(500).json({ error: 'Failed to fetch external deals' });
    }
  });

  app.get('/api/external/categories', async (req: AuthenticatedRequest, res) => {
    try {
      const response = await fetch('https://api.instoredealz.com/S0G1IP/Category/AllCategories');
      if (!response.ok) {
        throw new Error(`External API error: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching external categories:', error);
      res.status(500).json({ error: 'Failed to fetch external categories' });
    }
  });

  app.get('/api/external/store-deals/:storeId/:dealId/:pinId', async (req: AuthenticatedRequest, res) => {
    try {
      const { storeId, dealId, pinId } = req.params;
      const response = await fetch(`https://api.instoredealz.com/S0G1IP/FrontHome/GetStoredDealById/${storeId}/${dealId}/${pinId}`);
      if (!response.ok) {
        throw new Error(`External API error: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching external store deal:', error);
      res.status(500).json({ error: 'Failed to fetch external store deal' });
    }
  });

  app.get('/api/external/blogs', async (req: AuthenticatedRequest, res) => {
    try {
      const response = await fetch('https://api.instoredealz.com/S0G1IP/Blogs/GetAllBlogs');
      if (!response.ok) {
        throw new Error(`External API error: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching external blogs:', error);
      res.status(500).json({ error: 'Failed to fetch external blogs' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
