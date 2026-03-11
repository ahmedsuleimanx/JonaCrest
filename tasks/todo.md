# Jona Crest Properties - Implementation Plan

## PHASE 1: Simplify Roles (admin + user only)
- [ ] Update User model - change enum to ['admin', 'user'], default 'user'
- [ ] Update Usercontroller.js - register/login logic
- [ ] Update adminAuth middleware
- [ ] Update signup.jsx - remove role selection for landlord/agent
- [ ] Remove LandlordDashboard, AgentDashboard, AdminDashboard pages from frontend
- [ ] Update App.jsx routes
- [ ] Update AuthContext
- [ ] Clean up unused landlord/agent routes and controllers

## PHASE 2: Redesign Admin Dashboard (separate app)
- [ ] Create liquid glass CSS system
- [ ] Build new sidebar navigation with glass effects
- [ ] Page-to-page navigation loader
- [ ] Shimmer/skeleton loading for data
- [ ] Dashboard overview page
- [ ] Properties management page
- [ ] Users management page
- [ ] Service requests management page
- [ ] Partners/Sponsors management page
- [ ] Appointments management page
- [ ] Settings page

## PHASE 3: Redesign User Dashboard
- [ ] Create liquid glass CSS system for frontend
- [ ] Build new sidebar navigation with glass effects
- [ ] Independent pages with route-based navigation
- [ ] Page navigation loader
- [ ] Shimmer loading effects
- [ ] Dashboard overview
- [ ] My Properties / Saved Properties
- [ ] Service Requests page
- [ ] Viewings page
- [ ] Messages page
- [ ] Support Tickets page
- [ ] Profile & Settings

## PHASE 4: Service Request Approval Flow
- [ ] Update ServiceRequest model with approval fields
- [ ] Update Property model - hide contact info by default
- [ ] Admin approval endpoints
- [ ] Frontend - request service flow
- [ ] Frontend - admin approval UI
- [ ] Contact info visibility logic

## PHASE 5: Partners/Sponsors CRUD
- [ ] Create Partner model
- [ ] Create partner routes and controller
- [ ] Admin CRUD UI for partners
- [ ] Update public Companies component to fetch from API

## PHASE 6: AI Features (Ollama API)
- [ ] Setup Ollama API integration in backend
- [ ] Floating customer service assistant component
- [ ] AI property recommendations
- [ ] AI-powered search enhancement

## PHASE 7: Testing & Verification
- [ ] Test all role changes
- [ ] Test admin dashboard
- [ ] Test user dashboard
- [ ] Test service request flow
- [ ] Test partners CRUD
- [ ] Test AI features
