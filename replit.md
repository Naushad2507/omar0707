# Instoredealz - Deal Discovery Platform

## Overview
Instoredealz is a full-stack deal discovery platform that connects customers with local businesses offering discounts and deals. The platform serves three primary user roles: customers who discover and claim deals, vendors who create and manage deals, and administrators who oversee the platform.

## System Architecture

### Technology Stack
- **Frontend**: React with TypeScript, Vite for bundling
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Radix UI with shadcn/ui styling
- **Styling**: Tailwind CSS
- **State Management**: Zustand for authentication
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: Wouter for client-side routing

### Architecture Pattern
The application follows a monorepo structure with clear separation between client and server code:
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared TypeScript schemas and types

## Key Components

### Authentication System
- **Implementation**: JWT-based authentication with bearer tokens
- **Storage**: Zustand with persistence for client-side state
- **Roles**: Customer, Vendor, Admin, Super Admin with role-based access control
- **Middleware**: Authentication and authorization middleware for protected routes

### Database Schema
- **Users**: Core user information with role-based access
- **Vendors**: Business profile information for vendors
- **Deals**: Deal listings with categories, pricing, and redemption limits
- **Deal Claims**: Tracking of user deal redemptions
- **Wishlists**: User favorites functionality
- **Help Tickets**: Customer support system
- **System Logs**: Administrative audit trail

### Frontend Architecture
- **Component Structure**: Modular UI components with consistent design system
- **Pages**: Role-based page organization (customer/, vendor/, admin/, superadmin/)
- **Routing**: Protected routes with role-based access
- **State Management**: React Query for server state, Zustand for client state

### Backend Architecture
- **API Routes**: RESTful API with role-based access control
- **Storage Layer**: Abstracted database operations through IStorage interface
- **Middleware**: Authentication, authorization, logging, and error handling
- **File Structure**: Modular route handlers with clear separation of concerns

## Data Flow

### User Registration/Login
1. User submits credentials through frontend forms
2. Backend validates credentials and generates JWT token
3. Token stored in localStorage and Zustand store
4. Subsequent requests include token in Authorization header

### Deal Discovery
1. Frontend queries deals API with filters (location, category, etc.)
2. Backend returns filtered deals with vendor information
3. React Query manages caching and background updates
4. Users can claim deals, which creates deal_claims records

### Vendor Management
1. Vendors register through enhanced registration form
2. Admin approval process for new vendors
3. Approved vendors can create and manage deals
4. Real-time analytics dashboard for performance tracking

### Admin Operations
1. Multi-level admin system (Admin, Super Admin)
2. User management, vendor approval, deal moderation
3. System analytics and reporting
4. Audit logging for administrative actions

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI components
- **wouter**: Lightweight routing library
- **zustand**: Client state management
- **zod**: Runtime type validation

### Development Dependencies
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundling for production
- **vite**: Frontend build tool and development server

## Deployment Strategy

### Replit Configuration
- **Modules**: Node.js 20, Web, PostgreSQL 16
- **Development**: `npm run dev` starts both frontend and backend
- **Production**: `npm run build` followed by `npm run start`
- **Database**: PostgreSQL provisioned through Replit modules

### Build Process
1. Frontend builds to `dist/public` directory
2. Backend compiles to `dist/index.js`
3. Single production server serves both API and static files
4. Vite handles frontend bundling with React optimizations

### Environment Variables
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment setting (development/production)

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes

### June 28, 2025 - Enhanced Deal Management & Subscription System
- **Updated DealList Component**: Integrated TanStack Query for efficient data fetching from /api/deals
- **QR Code Integration**: Added magical QR code generation for deal claims using qrcode library with themed designs
- **Enhanced UI/UX**: Implemented responsive card layouts with Tailwind CSS gradients, animations, and hover effects
- **Subscription Component**: Created comprehensive subscription management with Razorpay payment integration
- **Payment Processing**: Added /api/save-subscription endpoint with authentication and membership plan updates
- **QR Code Library**: Enhanced with multiple themes (success, warning, premium, deal, membership, classic) and TypeScript safety

### Technical Improvements
- **QR Code Themes**: Pre-defined magical themes for different QR code types with customizable colors
- **Payment Integration**: Razorpay SDK integration for secure payment processing (₹500 Premium, ₹1000 Ultimate plans)
- **Authentication Flow**: Proper authentication checks using useAuth hook throughout subscription process
- **Data Validation**: Comprehensive input validation and error handling for payment and subscription data
- **System Logging**: Enhanced logging for subscription activities and payment transactions

## Changelog
- June 15, 2025. Initial setup
- June 28, 2025. Added subscription system and enhanced deal management with QR codes