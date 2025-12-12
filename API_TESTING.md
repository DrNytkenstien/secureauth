# API Testing Examples

## 📦 Using cURL

### 1. Send OTP

```bash
curl -X POST http://localhost:5000/api/auth/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "data": {
    "message": "OTP sent successfully",
    "email": "user@example.com",
    "expiresIn": 600
  }
}
```

### 2. Verify OTP

```bash
curl -X POST http://localhost:5000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp": "123456"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Session created successfully",
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "expiresIn": 86400,
    "expiresAt": "2025-12-13T18:30:00.000Z"
  }
}
```

### 3. Check Session

```bash
curl -X GET http://localhost:5000/api/auth/session/550e8400-e29b-41d4-a716-446655440000
```

### 4. Logout

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### 5. Resend OTP

```bash
curl -X POST http://localhost:5000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

### 6. Health Check

```bash
curl http://localhost:5000/health
```

---

## 📮 Using Postman

### Import Collection

Create a new Postman collection with these requests:

#### 1. Send OTP
- **Method:** POST
- **URL:** `{{baseUrl}}/api/auth/email`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "email": "user@example.com"
  }
  ```

#### 2. Verify OTP
- **Method:** POST
- **URL:** `{{baseUrl}}/api/auth/verify`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "email": "user@example.com",
    "otp": "{{otp}}"
  }
  ```

#### 3. Get Session
- **Method:** GET
- **URL:** `{{baseUrl}}/api/auth/session/{{sessionId}}`

#### 4. Logout
- **Method:** POST
- **URL:** `{{baseUrl}}/api/auth/logout`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "sessionId": "{{sessionId}}"
  }
  ```

### Postman Environment Variables

```json
{
  "baseUrl": "http://localhost:5000",
  "email": "user@example.com",
  "otp": "",
  "sessionId": ""
}
```

### Pre-request Scripts

For the Verify OTP request, add this pre-request script to generate random email:
```javascript
const randomId = Math.random().toString(36).substring(7);
pm.environment.set("email", `test${randomId}@example.com`);
```

---

## 🧪 Using Thunder Client (VS Code)

### Install Thunder Client
VS Code Extension ID: `rangav.vscode-thunder-client`

### Create Requests

**Send OTP:**
```
POST http://localhost:5000/api/auth/email
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Verify OTP:**
```
POST http://localhost:5000/api/auth/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

---

## 🤖 Automated Tests (Node.js)

Create `test.js`:

```javascript
const http = require('http');

const BASE_URL = 'http://localhost:5000';
let sessionId = '';
let email = `test${Date.now()}@example.com`;
let otp = '';

function makeRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting API Tests\n');

  try {
    // Test 1: Send OTP
    console.log('Test 1: Send OTP');
    console.log(`Email: ${email}`);
    const sendOtpResponse = await makeRequest('POST', '/api/auth/email', {
      email,
    });
    console.log('Response:', sendOtpResponse);
    console.log('✅ Passed\n');

    // Check OTP in response (in production it would be sent via email)
    // For testing, we'll need to check the console output or modify the endpoint

    // Test 2: Verify OTP (you need to replace with actual OTP)
    console.log('Test 2: Verify OTP');
    // In development, the OTP is logged to console
    // For automated testing, you might want to modify the endpoint to return OTP in dev mode
    
    // Simulating with a valid OTP for demo
    // In real scenario, read from console or implement a dev endpoint
    const verifyOtpResponse = await makeRequest('POST', '/api/auth/verify', {
      email,
      otp: '123456', // Use actual OTP from console
    });
    console.log('Response:', verifyOtpResponse);
    
    if (verifyOtpResponse.success) {
      sessionId = verifyOtpResponse.data.sessionId;
      console.log('✅ Passed\n');
    } else {
      console.log('⚠️  OTP verification failed (expected if OTP is wrong)\n');
      // Don't fail, just note it
    }

    // Test 3: Check Session
    if (sessionId) {
      console.log('Test 3: Check Session');
      const sessionResponse = await makeRequest('GET', `/api/auth/session/${sessionId}`);
      console.log('Response:', sessionResponse);
      console.log('✅ Passed\n');
    }

    // Test 4: Logout
    if (sessionId) {
      console.log('Test 4: Logout');
      const logoutResponse = await makeRequest('POST', '/api/auth/logout', {
        sessionId,
      });
      console.log('Response:', logoutResponse);
      console.log('✅ Passed\n');
    }

    // Test 5: Health Check
    console.log('Test 5: Health Check');
    const healthResponse = await makeRequest('GET', '/health');
    console.log('Response:', healthResponse);
    console.log('✅ Passed\n');

    console.log('🎉 All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// For getting OTP, add a dev endpoint
// You can temporarily modify the endpoint to return OTP in development
runTests();
```

Run tests:
```bash
node test.js
```

---

## 🔥 Load Testing with k6

Create `load-test.js`:

```javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp-up to 20 users
    { duration: '1m30s', target: 20 }, // Hold at 20 users
    { duration: '20s', target: 0 }, // Ramp-down
  ],
};

export default function () {
  const email = `loadtest${Math.random().toString(36).slice(2)}@example.com`;

  // Send OTP
  const sendOtpResponse = http.post(
    'http://localhost:5000/api/auth/email',
    JSON.stringify({ email }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  check(sendOtpResponse, {
    'send OTP status is 200': (r) => r.status === 200,
    'send OTP success': (r) => JSON.parse(r.body).success === true,
  });

  // Health check
  const healthResponse = http.get('http://localhost:5000/health');

  check(healthResponse, {
    'health check status is 200': (r) => r.status === 200,
  });
}
```

Install and run k6:
```bash
# Install k6 (https://k6.io)
k6 run load-test.js
```

---

## 🧬 Integration Testing with Jest

Create `integration.test.ts`:

```typescript
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

describe('Authentication API', () => {
  let email = '';
  let sessionId = '';

  beforeEach(() => {
    email = `test${Date.now()}${Math.random()}@example.com`;
  });

  test('should send OTP', async () => {
    const response = await fetch(`${BASE_URL}/auth/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.email).toBe(email);
  });

  test('should reject invalid email', async () => {
    const response = await fetch(`${BASE_URL}/auth/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'invalid-email' }),
    });

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  test('should verify OTP and create session', async () => {
    // First, send OTP
    await fetch(`${BASE_URL}/auth/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    // Get OTP from console (in real test, you'd mock this)
    const otp = '123456'; // Replace with actual OTP

    const response = await fetch(`${BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    if (response.status === 200) {
      sessionId = data.data.sessionId;
      expect(data.success).toBe(true);
      expect(data.data.sessionId).toBeDefined();
    }
  });

  test('should get session details', async () => {
    if (!sessionId) {
      // Skip if session wasn't created
      return;
    }

    const response = await fetch(`${BASE_URL}/auth/session/${sessionId}`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.sessionId).toBe(sessionId);
  });

  test('should logout', async () => {
    if (!sessionId) {
      return;
    }

    const response = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
```

Run with Jest:
```bash
npm install --save-dev jest @types/jest ts-jest node-fetch
npx jest integration.test.ts
```

---

## 📊 Rate Limiting Test

Test to verify rate limiting works:

```bash
#!/bin/bash

EMAIL="test@example.com"
API="http://localhost:5000/api"

echo "Testing rate limiting..."
echo "Sending first OTP..."
curl -s -X POST $API/auth/email \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\"}" | jq .

echo -e "\nSending second OTP immediately (should be rate limited)..."
curl -s -X POST $API/auth/email \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\"}" | jq .

echo -e "\nWaiting 60 seconds..."
sleep 60

echo "Sending third OTP (should succeed)..."
curl -s -X POST $API/auth/email \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\"}" | jq .
```

---

## 🔍 Debugging

### Enable Debug Logging

Set environment variable before running:
```bash
DEBUG=* npm run dev
```

### Check OTP in Development

Since emails are logged to console in development:

```bash
# Terminal 1: Start server with logging
npm run dev

# Terminal 2: Send OTP request
curl -X POST http://localhost:5000/api/auth/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check Terminal 1 console for OTP output
# You'll see: 📧 Email sent: { to: 'test@example.com', subject: '...' }
```

### Inspect Request/Response

Add temporary logging to authController.ts:

```typescript
static async sendOTP(req: Request, res: Response): Promise<void> {
  console.log('📨 Email OTP Request:', req.body);
  
  // ... rest of code
  
  console.log('📨 Generated OTP:', otp);
  
  res.status(200).json(...);
}
```
