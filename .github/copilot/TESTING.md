# Testing Guidelines for CITZ SBC Queue Management

This document provides guidelines and best practices for writing tests in this project, including lessons learned from common testing issues and their resolutions.

## API Route Testing Issues and Resolutions

### 🚨 **Primary Issue: Environment Variable Mocking in Vitest**

#### **Problem:**
When testing Next.js API routes that use module-level environment variable destructuring (like `const { SSO_CLIENT_ID } = process.env`), traditional Vitest environment variable mocking approaches failed because:

1. **Module Caching**: Environment variables were destructured at module import time
2. **Static Imports**: Test files imported routes before environment variables could be mocked
3. **Vitest Timing**: `process.env` modifications happened after module evaluation

#### **Failed Approaches:**
```typescript
// ❌ This didn't work - env vars set after module import
beforeEach(() => {
  process.env.SSO_CLIENT_ID = "test-value"
})

// ❌ This didn't work - module already cached
vi.mock("process", () => ({
  env: { SSO_CLIENT_ID: "test-value" }
}))
```

### ✅ **Solution: Dynamic Imports + vi.stubEnv() Pattern**

#### **Working Pattern:**
```typescript
import { describe, it, vi, beforeEach, afterEach } from "vitest"

describe("API Route Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules() // Clear module cache
  })

  afterEach(() => {
    vi.unstubAllEnvs() // Clean up environment stubs
  })

  it("should test with proper env vars", async () => {
    // 1. Set environment variables FIRST
    vi.stubEnv("SSO_CLIENT_ID", "test-client-id")
    vi.stubEnv("SSO_CLIENT_SECRET", "test-client-secret")

    // 2. THEN dynamically import the route
    const { GET } = await import("./route")

    // 3. Now test the route
    const response = await GET(request)
    expect(response.status).toBe(200)
  })
})
```

#### **Key Elements:**
1. **`vi.resetModules()`** - Clears module cache between tests
2. **`vi.stubEnv()`** - Properly mocks environment variables
3. **Dynamic imports** - `await import("./route")` after env setup
4. **`vi.unstubAllEnvs()`** - Cleanup between tests

### 🔧 **Secondary Issues Resolved**

#### **1. Cookie Casing Sensitivity**
```typescript
// ❌ Wrong casing expectation
expect(cookieHeader).toContain("SameSite=None")

// ✅ Correct casing (Next.js uses lowercase)
expect(cookieHeader).toContain("SameSite=none")
```

#### **2. HTTP Status Code Expectations**
```typescript
// ❌ Wrong status code expectation
expect(response.status).toBe(302) // Expected 302 redirect

// ✅ Correct status code (Next.js uses 307)
expect(response.status).toBe(307) // NextResponse.redirect() uses 307
```

#### **3. Test File Structure Issues**
- **Problem**: Some test files had parsing errors preventing Vitest from recognizing test suites
- **Solution**: Simplified test file structure and ensured proper TypeScript syntax

## 📋 **Best Practices for AI Test Generation**

### **Environment Variable Testing:**
1. Always use `vi.stubEnv()` instead of direct `process.env` manipulation
2. Call `vi.resetModules()` in `beforeEach()` to clear module cache
3. Use dynamic imports after environment setup: `await import("./module")`
4. Clean up with `vi.unstubAllEnvs()` in `afterEach()`

### **Next.js API Route Testing:**
1. Use `NextRequest` constructor for creating test requests
2. Expect 307 status codes for redirects (not 302)
3. Test cookie attributes with lowercase values (`SameSite=none`)
4. Mock utility functions at the module level with `vi.mock()`

### **Test Organization:**
1. Keep test files simple and focused
2. Use clear describe/it structure
3. Test both success and error scenarios
4. Include edge cases (empty values, special characters, etc.)

### **Debugging Failed Tests:**
1. Check if environment variables are being set before module import
2. Verify module mocking happens before route import
3. Ensure proper cleanup between tests
4. Test cookie and header values with exact casing expectations

## Testing Stack

- **Vitest**: Test runner with built-in mocking capabilities
- **Playwright**: End-to-end testing for user flows
- **TypeScript**: Strict typing for test safety
- **Supertest**: HTTP endpoint testing (when needed)

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test src/path/to/file.test.ts

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage

# Run only auth API tests
npm test src/app/api/auth

# Run end-to-end tests
npm run test:e2e
```

## Test Structure

```
src/
├── app/api/              # API route tests
├── components/           # Component tests (when needed)
├── utils/               # Utility function tests
└── test/               # Test utilities and setup
```

## Key Takeaways

The most critical lesson learned is that **environment variable mocking must happen before module import** when dealing with module-level destructuring. This requires the dynamic import pattern with `vi.stubEnv()` for proper test isolation and reliability.

When writing new tests, especially for API routes, always follow the established patterns in this codebase and refer to existing test files for examples of proper environment variable handling and mocking strategies.
