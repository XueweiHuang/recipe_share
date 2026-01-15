# Testing TODO List

> **Purpose**: This document tracks testing tasks for the Recipe Sharing Platform. Use this as a guideline when asking the agent to create test cases.

**Last Updated**: 2026-01-15

---

## 📊 Testing Progress Overview

- **Unit Tests**: 18 tests created ✅ ALL PASSING
- **E2E Tests**: 15 tests created ⚠️ 10 PASSING | 5 FAILING
- **Total Progress**: Phase 1 tests implemented

### Latest Test Results (2026-01-15)

**Unit Tests** ✅
```
✓ auth-schema.test.ts (18 tests) - ALL PASS
  - Email validation (4 tests) ✅
  - Password validation (3 tests) ✅
  - Username validation (4 tests) ✅
  - Login form schema (4 tests) ✅
  - Signup form schema (3 tests) ✅
```

**E2E Tests** ⚠️
```
✓ 10 PASSED
✗ 5 FAILED (form input selectors need fixing)
  - Route protection: ALL PASS ✅
  - Header navigation: ALL PASS ✅  
  - Form element tests: FAIL (need name attributes)
```

**Quick Commands**:
```bash
npm test                # Run unit tests
npm run test:e2e        # Run E2E tests
npm run test:coverage   # Coverage report
```

---

## 🧪 Phase 1: Authentication & User Management

### Unit Tests - Authentication

- [x] **Auth Helper Functions** ✅
  - [x] Test email validation helper (4 tests passing)
  - [x] Test password strength validator (3 tests passing)
  - [x] Test username format validation (4 tests passing)
  - [ ] Test profile data sanitization

- [ ] **Supabase Client Utilities**
  - [ ] Test browser client initialization
  - [ ] Test server client initialization
  - [ ] Test cookie handling in middleware
  - [ ] Test session token management

- [x] **Auth Form Validation** ✅
  - [x] Test login form schema (4 tests passing)
  - [x] Test signup form schema (3 tests passing)
  - [x] Test password minimum length (6 characters)
  - [x] Test email format validation
  - [ ] Test username uniqueness check

### E2E Tests - Authentication

- [ ] **User Registration Flow** ⚠️
  - [ ] User can sign up with valid credentials (FAIL - form selectors)
  - [ ] User cannot sign up with duplicate email
  - [ ] User cannot sign up with duplicate username
  - [ ] User sees validation errors for invalid input (FAIL - form selectors)
  - [ ] Profile is automatically created after signup

- [ ] **User Login Flow** ⚠️
  - [ ] User can login with valid credentials
  - [ ] User cannot login with invalid credentials (FAIL - form selectors)
  - [ ] User is redirected to homepage after login (PASS ✅)
  - [ ] Logged-in user cannot access /login page
  - [ ] Header shows user email after login

- [ ] **User Logout Flow**
  - [ ] User can logout successfully
  - [ ] Session is cleared after logout
  - [ ] User is redirected to homepage after logout
  - [ ] Header shows login/signup buttons after logout

- [x] **Route Protection** ✅ ALL PASS
  - [x] Unauthenticated user is redirected from /recipes/new (PASS)
  - [x] Unauthenticated user is redirected from /profile/settings (PASS)
  - [x] Unauthenticated user is redirected from /saved (PASS)
  - [x] Public pages accessible without auth (PASS)

- [x] **Navigation** ✅ ALL PASS
  - [x] Login/signup button navigation (PASS)
  - [x] Auth page transitions (PASS)

---

## 🍳 Phase 2: Recipe Management (Upcoming)

### Unit Tests - Recipe Features

- [ ] **Recipe Validation**
  - [ ] Test recipe schema validation (title, description, etc.)
  - [ ] Test cook time validation (positive integers)
  - [ ] Test prep time validation
  - [ ] Test servings validation (minimum 1)
  - [ ] Test difficulty enum validation (easy, medium, hard)
  - [ ] Test status enum validation (draft, published)

- [ ] **Recipe Helper Functions**
  - [ ] Test formatCookTime() - converts minutes to readable format
  - [ ] Test calculateTotalTime() - prep + cook time
  - [ ] Test scaleIngredients() - adjust quantities for servings
  - [ ] Test slugify() - create URL-friendly recipe slugs

- [ ] **Ingredient Management**
  - [ ] Test ingredient validation schema
  - [ ] Test ingredient quantity parsing
  - [ ] Test ingredient unit conversion
  - [ ] Test ingredient ordering logic

- [ ] **Image Upload Utilities**
  - [ ] Test image file type validation (jpg, png, webp)
  - [ ] Test image size validation (max 5MB)
  - [ ] Test image compression logic
  - [ ] Test generateImagePath() for storage

### E2E Tests - Recipe Features

- [ ] **Recipe Creation Flow**
  - [ ] User can create a recipe with basic info
  - [ ] User can add multiple ingredients
  - [ ] User can add multiple instructions
  - [ ] User can upload recipe image
  - [ ] User can select categories
  - [ ] Recipe is saved as published
  - [ ] User is redirected to recipe detail page
  - [ ] New recipe appears in user's profile

- [ ] **Recipe Viewing**
  - [ ] User can view recipe detail page
  - [ ] Recipe shows all information correctly
  - [ ] Recipe images display properly
  - [ ] Ingredients list displays in order
  - [ ] Instructions display in order
  - [ ] Author information is visible

- [ ] **Recipe Editing**
  - [ ] User can edit their own recipe
  - [ ] User cannot edit other users' recipes
  - [ ] Changes are saved correctly
  - [ ] Updated recipe displays new information

- [ ] **Recipe Deletion**
  - [ ] User can delete their own recipe
  - [ ] User cannot delete other users' recipes
  - [ ] Recipe is removed from all lists
  - [ ] Confirmation prompt appears before deletion

---

## 🔍 Phase 3: Search & Discovery (Upcoming)

### Unit Tests - Search Features

- [ ] **Search Query Processing**
  - [ ] Test search query sanitization
  - [ ] Test search query tokenization
  - [ ] Test fuzzy search matching
  - [ ] Test search result ranking

- [ ] **Filter Logic**
  - [ ] Test category filter application
  - [ ] Test difficulty filter application
  - [ ] Test cook time range filter
  - [ ] Test multiple filters combination

- [ ] **Sort Functions**
  - [ ] Test sort by newest (created_at DESC)
  - [ ] Test sort by popular (likes count)
  - [ ] Test sort by quickest (cook time ASC)
  - [ ] Test sort by relevance (search)

### E2E Tests - Search & Discovery

- [ ] **Search Functionality**
  - [ ] User can search recipes by name
  - [ ] User can search recipes by ingredient
  - [ ] Search results update in real-time
  - [ ] No results message displays when appropriate

- [ ] **Filtering Recipes**
  - [ ] User can filter by category
  - [ ] User can filter by difficulty
  - [ ] User can filter by cook time
  - [ ] Multiple filters work together
  - [ ] Filter badges display active filters
  - [ ] User can clear all filters

- [ ] **Browse Categories**
  - [ ] User can view all categories
  - [ ] User can browse recipes in a category
  - [ ] Category pages show correct recipes

---

## 💬 Phase 4: Social Features (Upcoming)

### Unit Tests - Social Features

- [ ] **Like/Unlike Logic**
  - [ ] Test like toggle functionality
  - [ ] Test like count increment/decrement
  - [ ] Test duplicate like prevention

- [ ] **Comment Validation**
  - [ ] Test comment content validation (not empty)
  - [ ] Test comment length limits
  - [ ] Test comment sanitization (XSS prevention)

- [ ] **Follow System**
  - [ ] Test follow/unfollow toggle
  - [ ] Test follower count updates
  - [ ] Test following count updates
  - [ ] Test prevent self-follow

### E2E Tests - Social Features

- [ ] **Like/Save Recipes**
  - [ ] User can like a recipe
  - [ ] User can unlike a recipe
  - [ ] Like count updates correctly
  - [ ] User can save recipe to collection
  - [ ] User can unsave recipe

- [ ] **Commenting**
  - [ ] User can add comment to recipe
  - [ ] Comments display in chronological order
  - [ ] User can edit their own comment
  - [ ] User can delete their own comment
  - [ ] Comment count updates correctly

- [ ] **Follow System**
  - [ ] User can follow another user
  - [ ] User can unfollow a user
  - [ ] Follower/following counts update
  - [ ] Following recipes appear in feed

---

## 👤 Phase 5: User Profile (Upcoming)

### Unit Tests - Profile Features

- [ ] **Profile Validation**
  - [ ] Test username format validation
  - [ ] Test bio length limits
  - [ ] Test profile data sanitization

- [ ] **Avatar Upload**
  - [ ] Test avatar file type validation
  - [ ] Test avatar size validation
  - [ ] Test avatar compression

### E2E Tests - Profile Features

- [ ] **Profile Management**
  - [ ] User can view their own profile
  - [ ] User can view other users' profiles
  - [ ] User can edit profile information
  - [ ] User can upload/change avatar
  - [ ] Profile shows user's recipes
  - [ ] Profile shows follower/following counts

---

## 🔒 Security Tests (Optional - Future)

### Security Test Tasks

- [ ] **Authentication Security**
  - [ ] Test password hashing
  - [ ] Test session timeout
  - [ ] Test CSRF protection
  - [ ] Test rate limiting on login

- [ ] **Authorization Tests**
  - [ ] Test RLS policies in Supabase
  - [ ] Test user can only edit own content
  - [ ] Test user can only delete own content
  - [ ] Test admin permissions (future)

- [ ] **Input Validation**
  - [ ] Test XSS prevention in comments
  - [ ] Test SQL injection prevention
  - [ ] Test file upload security
  - [ ] Test API rate limiting

---

## ⚡ Performance Tests (Optional - Future)

### Performance Test Tasks

- [ ] **Page Load Performance**
  - [ ] Homepage loads in < 2s
  - [ ] Recipe detail page loads in < 1.5s
  - [ ] Search results load in < 1s

- [ ] **Large Dataset Performance**
  - [ ] List 100 recipes without lag
  - [ ] Search through 1000+ recipes quickly
  - [ ] Infinite scroll performs smoothly

- [ ] **Image Optimization**
  - [ ] Images use Next.js optimization
  - [ ] Images load progressively
  - [ ] Images use appropriate formats (WebP)

---

## ♿ Accessibility Tests (Optional - Future)

### Accessibility Test Tasks

- [ ] **Keyboard Navigation**
  - [ ] All interactive elements are keyboard accessible
  - [ ] Tab order is logical
  - [ ] Focus indicators are visible

- [ ] **Screen Reader Support**
  - [ ] All images have alt text
  - [ ] Form inputs have labels
  - [ ] ARIA labels are correct

- [ ] **Color Contrast**
  - [ ] Text meets WCAG AA standards
  - [ ] Interactive elements have sufficient contrast

---

## 📱 Mobile/Responsive Tests (Optional - Future)

### Mobile Test Tasks

- [ ] **Mobile Navigation**
  - [ ] Hamburger menu works on mobile
  - [ ] Touch targets are appropriately sized
  - [ ] Forms are usable on mobile

- [ ] **Responsive Layout**
  - [ ] All pages responsive on mobile (320px-768px)
  - [ ] All pages responsive on tablet (768px-1024px)
  - [ ] Images scale appropriately

---

## 🛠️ Test Setup Tasks

### Infrastructure Setup

- [ ] **Test Configuration**
  - [ ] Install and configure Vitest
  - [ ] Install and configure Playwright
  - [ ] Set up test database (Supabase test project)
  - [ ] Create test data factories
  - [ ] Set up CI/CD test pipeline

- [ ] **Test Utilities**
  - [ ] Create auth test helpers
  - [ ] Create mock Supabase client
  - [ ] Create test data generators
  - [ ] Create custom render function
  - [ ] Create setup/teardown utilities

---

## 📝 Notes for Agent

### When Creating Tests:

1. **File Structure**: Place tests in `__tests__` folder next to the file being tested
2. **Naming Convention**: Use `*.test.ts` or `*.spec.ts` for test files
3. **Test Data**: Use factories for consistent mock data
4. **Cleanup**: Always clean up test data after each test
5. **Isolation**: Each test should be independent
6. **Descriptions**: Use clear, descriptive test names
7. **Coverage**: Aim for 70-80% unit test coverage
8. **E2E**: Focus E2E tests on critical user paths

### Example Test Request:

> "Please create unit tests for the recipe validation schema based on the Testing TODO list. Include tests for title, cook time, servings, and difficulty validation."

---

## 📊 Progress Tracking

### Completed Phases:
- None yet

### Current Focus:
- Phase 1: Authentication & User Management

### Next Priority:
- Complete Phase 1 tests before moving to Phase 2

---

---

## 📝 Action Items

### ✅ Completed:
- [x] Testing infrastructure setup (Vitest, Playwright)
- [x] 18 unit tests for auth validation (ALL PASSING)
- [x] 15 E2E tests created (10 passing, 5 need fixes)

### 🔧 To Fix:
**E2E Test Failures** (5 tests):
- Login/signup forms missing `name` attributes on inputs
- Need to add: `name="email"`, `name="password"`, `name="username"`, `name="fullName"`
- Files to update: `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`

### 📦 Files Created:
```
lib/validations/auth-schema.ts          - Validation schemas
lib/validations/__tests__/*.test.ts     - 18 unit tests ✅
e2e/auth-flows.spec.ts                  - 15 E2E tests ⚠️
vitest.config.ts                        - Unit test config
playwright.config.ts                    - E2E test config
```

---

**Last Updated**: 2026-01-15  
**Status**: ✅ Unit Tests Complete | ⚠️ E2E Tests Need Name Attributes