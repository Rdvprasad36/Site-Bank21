# SiteBank QA Testing Guide
## Version: 2.0.0 | Date: 2026-05-11

---

## Prerequisites

### Accounts needed for QA
1. **Razorpay Test Account** — https://dashboard.razorpay.com (free signup, get test keys)
2. **Meta Developer Account** — https://developers.facebook.com (free, create a test app)
3. **ngrok** — https://ngrok.com (free account, for webhook testing) or `brew install ngrok`

### Local setup
```bash
cd /Users/ganeshvaradi/Developer/SiteBank
cp .env.example .env
pnpm install
docker compose up -d postgres redis minio    # start databases
pnpm --filter api db:migrate                  # run migrations
pnpm --filter api db:seed                     # seed demo data
pnpm dev                                      # start api:4000 + web:3000
```

### Test credentials (from seed)
| Role | Email | Password |
|------|-------|----------|
| Agent | demo@sitebank.in | Demo@2026 |
| Agency | agency@sitebank.in | Agency@2026 |
| Admin | admin@sitebank.in | SiteBank@Admin2026! |

---

## 1. Payment Gateway (Razorpay) Testing

### 1.1 Setup Razorpay Test Keys

1. Go to https://dashboard.razorpay.com → Settings → API Keys
2. Generate **Test** keys (not Live)
3. Copy `Key ID` (starts with `rzp_test_`) and `Key Secret`

### 1.2 Configure .env

```bash
FEATURE_PAYMENTS=true
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_TEST_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET=my_test_webhook_secret_123
```

Restart the server after changing .env.

### 1.3 Test Checkout Flow (Manual)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open http://localhost:3000, login as `demo@sitebank.in` | Dashboard loads |
| 2 | Go to Settings page | See Current Plan + Available Plans |
| 3 | Click **Upgrade** on "Basic Agent" or "Pro Agent" | Razorpay modal opens |
| 4 | Fill card: `4111 1111 1111 1111`, any future expiry, any CVV, any name | |
| 5 | Click Pay | Green success animation |
| 6 | Modal closes → toast "Payment confirmed!" | Subscription status shows ACTIVE |
| 7 | Refresh Settings | Plan name updated, Billing History table shows new entry |
| 8 | Check email (set `FEATURE_EMAIL=true` + Resend key) | Payment receipt email arrives |
| 9 | Check WhatsApp (set `FEATURE_WHATSAPP=true` + Meta creds) | Payment receipt WhatsApp arrives |
| 10 | Click **Cancel** on subscription | Status changes to CANCELLED, downgrades to Free |

### 1.4 Test Payment Failure

| Step | Action | Expected |
|------|--------|----------|
| 1 | Click Upgrade on any paid plan | Modal opens |
| 2 | Use card: `4000 0000 0000 0002` | Payment declines |
| 3 | Close modal | Toast "Payment failed" |
| 4 | Check Settings | Plan unchanged |

### 1.5 Test Free Plan Switch

| Step | Action | Expected |
|------|--------|----------|
| 1 | Click **Switch** on Free plan | Toast "Plan switched to Free" |
| 2 | Refresh | Current plan = Free |

### 1.6 Test Webhook Verification

```bash
# Test valid signature (simulate subscription.charged)
# First, compute the signature:
SECRET="my_test_webhook_secret_123"
BODY='{"event":"subscription.charged","payload":{"payment":{"entity":{"id":"pay_test123","notes":{"userId":"test_user","planId":"test_plan"}}}}}'
SIG=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$SECRET" | cut -d' ' -f2)

curl -X POST http://localhost:4000/api/v1/subscriptions/webhook \
  -H "Content-Type: application/json" \
  -H "x-razorpay-signature: $SIG" \
  -d "$BODY"
# → {"received":true}

# Test invalid signature (should be ignored)
curl -X POST http://localhost:4000/api/v1/subscriptions/webhook \
  -H "Content-Type: application/json" \
  -H "x-razorpay-signature: invalid_signature" \
  -d '{"event":"payment.failed","payload":{}}'
# → {"received":true} (ignored silently, check server logs for warning)
```

### 1.7 Webhook with ngrok (Full Integration)

```bash
# Terminal 1: expose local server
ngrok http 4000
# Copy the https URL (e.g. https://abc123.ngrok.io)

# In Razorpay Dashboard → Settings → Webhooks → Add New:
#   URL: https://abc123.ngrok.io/api/v1/subscriptions/webhook
#   Secret: my_test_webhook_secret_123
#   Events: payment.authorized, payment.failed, refund.created
#   → "Send Test Webhook" button
```

### 1.8 API Endpoint Tests

```bash
# List plans (public)
curl -s http://localhost:4000/api/v1/subscriptions/plans | jq

# Get my subscription (needs JWT token)
TOKEN=$(curl -s -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@sitebank.in","password":"Demo@2026"}' | jq -r '.data.accessToken')

curl -s http://localhost:4000/api/v1/subscriptions/me \
  -H "Authorization: Bearer $TOKEN" | jq

# Initiate checkout
curl -s -X POST http://localhost:4000/api/v1/subscriptions/checkout \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"planId":"<PLAN_ID>"}' | jq

# Get billing history
curl -s http://localhost:4000/api/v1/subscriptions/history \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 2. WhatsApp Integration Testing

### 2.1 Setup Meta Test App

1. Go to https://developers.facebook.com → My Apps → Create App
2. Choose "Business" type → Name it "SiteBank QA"
3. Add Product → **WhatsApp**
4. Go to WhatsApp → **API Setup**
5. Under "Step 1: Select a phone number", note the **Test phone number** (e.g., `+1 555 123 4567`)
6. Copy the **Temporary access token** (starts with `EAA...`)
7. Copy the **Phone Number ID** (numeric)
8. Under "Step 2: Send a test message", enter the test phone number → send a template message to verify connectivity

### 2.2 Configure .env

```bash
FEATURE_WHATSAPP=true
WHATSAPP_TOKEN=EAAxxxxxxxxxxxxx       # temporary access token from Step 1
WHATSAPP_PHONE_NUMBER_ID=123456789   # phone number ID from Step 1
WHATSAPP_VERIFY_TOKEN=sitebank-qa-webhook-2026
WHATSAPP_APP_SECRET=                 # skip for test mode
```

Restart the server.

### 2.3 Test WhatsApp Send (Manual)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Login as admin (`admin@sitebank.in`) | Dashboard loads |
| 2 | Go to Profile → add your real WhatsApp number (10-digit Indian) | Saved |
| 3 | GET http://localhost:4000/api/v1/notifications/test/whatsapp (with JWT) | Message arrives on your WhatsApp |
| 4 | Or in Swagger: http://localhost:4000/docs → authorize → GET /notifications/test/whatsapp | Same |

```bash
TOKEN=$(curl -s -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sitebank.in","password":"SiteBank@Admin2026!"}' | jq -r '.data.accessToken')

curl -s http://localhost:4000/api/v1/notifications/test/whatsapp \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 2.4 Test WhatsApp Webhook Verification

```bash
# Step 1: Verify (Meta sends this during webhook setup)
curl -s "http://localhost:4000/api/v1/notifications/whatsapp/webhook?hub.mode=subscribe&hub.challenge=abc123&hub.verify_token=sitebank-qa-webhook-2026"
# → "abc123"  (challenge is echoed back)

# Step 2: Wrong token
curl -s "http://localhost:4000/api/v1/notifications/whatsapp/webhook?hub.mode=subscribe&hub.challenge=xyz&hub.verify_token=wrong-token"
# → {"error":"Verification failed"}

# Step 3: Token not configured
# (remove WHATSAPP_VERIFY_TOKEN from .env, restart, then:)
curl -s "http://localhost:4000/api/v1/notifications/whatsapp/webhook?hub.mode=subscribe&hub.challenge=test"
# → {"error":"Not configured"}
```

### 2.5 Test Delivery Status Webhook

```bash
# Simulate Meta sending a delivery status update
curl -s -X POST http://localhost:4000/api/v1/notifications/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {"display_phone_number": "15551234567"},
          "statuses": [{
            "id": "wamid.test123",
            "status": "delivered",
            "timestamp": "1715000000",
            "recipient_id": "919876543210"
          }]
        }
      }]
    }]
  }'
# → {"status":"ok"}
# Check DB: pnpm --filter api db:studio → WhatsAppMessage → status = DELIVERED
```

### 2.6 Test Inbound Message Webhook

```bash
# Simulate a buyer replying to a WhatsApp message
curl -s -X POST http://localhost:4000/api/v1/notifications/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {"display_phone_number": "15551234567"},
          "messages": [{
            "from": "919876543210",
            "id": "wamid.msg001",
            "timestamp": "1715000000",
            "type": "text",
            "text": {"body": "Is this property still available?"}
          }]
        }
      }]
    }]
  }'
# → {"status":"ok"}
# Check server logs for: "WhatsApp inbound: from=919876543210 type=text text=Is this property still available?"
```

### 2.7 Test Hot Lead Alert Flow

| Step | Action | Expected |
|------|--------|----------|
| 1 | Ensure agent has `whatsappNumber` set in Profile | |
| 2 | Find a smart link slug: GET /smart-links (or check DB) | Copy a slug |
| 3 | Open http://localhost:3000/p/{slug} | Microsite loads |
| 4 | Fill lead form: Name + Phone + Message | Submit |
| 5 | Check agent's WhatsApp | Receives: "🔔 Hot Lead!\nProperty: {title}\n..." |
| 6 | Check agent email (if FEATURE_EMAIL=true) | Receives lead notification email |
| 7 | Check DB: pnpm --filter api db:studio → Lead table | New lead created |

### 2.8 Test AI Pitch + WhatsApp Send

```bash
# Generate an AI pitch + send it via WhatsApp
curl -s -X POST http://localhost:4000/api/v1/ai/pitch/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"propertyId":"<PROPERTY_ID>","audience":"buyer","tone":"casual","phone":"919876543210"}'
# → {"pitch":"...generated pitch text...","sent":true,"result":{...}}
```

### 2.9 Test Template List

```bash
# List WhatsApp templates (needs WHATSAPP_WABA_ID set in .env)
curl -s http://localhost:4000/api/v1/notifications/whatsapp/templates \
  -H "Authorization: Bearer $TOKEN" | jq
# → {"templates":[...]} or {"templates":[]} if WABA ID not set
```

### 2.10 ngrok for Full Webhook Integration

```bash
ngrok http 4000
# Copy https URL → set in Meta Dashboard:
#   WhatsApp → Configuration → Callback URL:
#   https://abc123.ngrok.io/api/v1/notifications/whatsapp/webhook
#   Verify token: sitebank-qa-webhook-2026
#   → Subscribe to "messages" and "message_status" webhook fields
#
# Then send a WhatsApp message to the test number
# The webhook delivers it → check server logs for "WhatsApp inbound:"
```

---

## 3. Poster / Thumbnail Generation Testing

**Note**: Poster generation uses HTML/CSS templates rendered by Playwright (headless Chromium). No AI image generation model (DALL-E, Stable Diffusion, etc.) is used. Chromium is installed at `apps/api/node_modules/playwright-browsers/`.

### 3.1 Prerequisites

```bash
# Chromium should already be installed:
ls apps/api/node_modules/playwright-browsers/chromium-*/chrome-mac-arm64/Chromium.app
# If missing, reinstall:
cd apps/api && PLAYWRIGHT_BROWSERS_PATH=./node_modules/playwright-browsers npx playwright install chromium
```

### 3.2 Test Template List

```bash
curl -s http://localhost:4000/api/v1/thumbnails/templates \
  -H "Authorization: Bearer $TOKEN" | jq
# → 3 templates: premium, hot-property, simple-whatsapp
```

### 3.3 Test Poster Generation

```bash
# Generate a poster for a property (needs property with cover photo)
curl -s -X POST http://localhost:4000/api/v1/thumbnails/properties/<PROPERTY_ID>/poster \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"templateId":"premium","headline":"Luxury Villa in Bangalore","keySpec":"3 BHK · 2000 sqft · East Facing"}' | jq
# → { "assets": [ { "id":"...", "imageUrl":"...", "aspectRatio":"16:9" }, ... ] }
```

### 3.4 Test Frontend UI

| Step | Action | Expected |
|------|--------|----------|
| 1 | Login as agent | Dashboard |
| 2 | Navigate to /properties/{id}/poster | Poster page loads |
| 3 | Select a template (Premium/Hot/Simple) | Template card highlights orange |
| 4 | Edit headline and key specs | Fields update |
| 5 | Click **Generate Poster** | Loading state, then 3 images appear (16:9, 1:1, 9:16) |
| 6 | Click Download on any image | Image downloads |
| 7 | Check thumbnails list: GET /thumbnails/properties/{id} | 3 new assets |

### 3.5 Edge Cases to Test

| Scenario | Expected |
|----------|----------|
| Property with no photos | Toast: "Upload a cover photo first" |
| Generate with default headline (no custom text) | Uses AI-generated title |
| Free plan user | "Made with SiteBank" branding text on poster |
| Paid plan user | No SiteBank branding text |
| Property with price "0" | "On Request" instead of ₹0.00 |
| Price ≥ 1 Cr | Shows "₹X.XX Cr" |
| Price in lakhs | Shows "₹X.XX L" |

---

## 4. Environment Variable Reference

| Variable | Required For | Test Value |
|----------|-------------|------------|
| `FEATURE_PAYMENTS` | Razorpay | `true` |
| `RAZORPAY_KEY_ID` | Razorpay | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay | from dashboard |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook verification | any string |
| `FEATURE_WHATSAPP` | WhatsApp | `true` |
| `WHATSAPP_TOKEN` | WhatsApp send | `EAA...` from Meta |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp send | from Meta |
| `WHATSAPP_VERIFY_TOKEN` | Webhook verification | any string |
| `WHATSAPP_WABA_ID` | Template listing | from Meta (optional) |
| `FEATURE_EMAIL` | Email notifications | `true` |
| `RESEND_API_KEY` | Email send | from resend.com |
| `S3_ENDPOINT` / `S3_ACCESS_KEY` / `S3_SECRET_KEY` | Thumbnail upload | MinIO or AWS |

---

## 5. Quick Smoke Test Checklist

- [ ] Server starts: `pnpm dev` → http://localhost:4000/health returns OK
- [ ] Login works with demo credentials
- [ ] Plans load at `/subscriptions/plans`
- [ ] Razorpay modal opens on Upgrade click
- [ ] Test card `4111 1111 1111 1111` processes successfully
- [ ] Subscription status updates to ACTIVE after payment
- [ ] Billing history shows new payment entry
- [ ] WhatsApp test message sends to admin
- [ ] WhatsApp webhook verification returns challenge
- [ ] Status webhook updates WhatsAppMessage in DB
- [ ] Hot lead alert fires on smart-link lead form submit
- [ ] Poster templates list returns 3 items
- [ ] Poster generation creates 3 PNG assets
- [ ] 91 unit tests pass: `pnpm --filter api test`

---

## 6. Common Issues

| Issue | Fix |
|-------|-----|
| Razorpay modal doesn't open | `FEATURE_PAYMENTS=true` not set, or `RAZORPAY_KEY_ID` empty |
| "Payment gateway unavailable" toast | Razorpay keys missing or invalid |
| WhatsApp test says "skipped" | `FEATURE_WHATSAPP=false` or `WHATSAPP_TOKEN` empty |
| Webhook verification fails | `WHATSAPP_VERIFY_TOKEN` doesn't match what Meta sends |
| Chromium not found error | Run `cd apps/api && PLAYWRIGHT_BROWSERS_PATH=./node_modules/playwright-browsers npx playwright install chromium` |
| Poster generation 500 error | Property has no photos, or S3/MinIO not running |
| `docker compose up` fails | Docker Desktop not running |
| Port 4000/3000 in use | Kill process: `lsof -ti:4000 \| xargs kill` |

---

## 7. About Image Generation

The poster/thumbnail feature does **not** use a generative AI image model (no DALL-E, Stable Diffusion, or Midjourney). Instead, it uses:

- **Template**: Pre-designed HTML/CSS layouts (3 templates: Premium, Hot Property, Simple WhatsApp)
- **Render engine**: Playwright (headless Chromium) renders HTML → PNG at 2x resolution
- **Image source**: The property's cover photo is used as the background image
- **AI text**: The headline can come from the existing DeepSeek AI title/description generator, but the image itself is deterministic template rendering, not AI-generated

This is intentional per the PRD: "Use rule-based templates for MVP to reduce cost and ensure consistent output. Later versions can use generative image models for luxury backgrounds, but actual property image must remain truthful and not misleading."
