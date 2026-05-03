# DataForSEO API Usage Guide

> Agent reference document for DataForSEO API integration. This guide documents lessons learned from the initial setup and testing.

## Quick Start

### 1. Environment Setup

Create a `.env` file in the project root:

```bash
DATAFORSEO_LOGIN=your_login@email.com
DATAFORSEO_PASSWORD=your_api_password
DATAFORSEO_API_URL=https://api.dataforseo.com
```

### 2. Install the Client

```bash
npm install dataforseo-client
```

### 3. Test Connection

```bash
node scripts/test-dataforseo.mjs
```

---

## Critical Lessons Learned

### ⚠️ `keyword` vs `keywords` — Different Endpoints Use Different Formats

This is the most important gotcha:

| Endpoint Type | Field | Format |
|---------------|-------|--------|
| `SerpGoogleOrganicLiveAdvancedRequestInfo` | `keyword` | **Single string**: `"llc formation"` |
| `GoogleKeywordsLiveRequestInfo` | `keywords` | **Array**: `["llc formation", "non-resident"]` |

**Wrong (will return 40501 "Invalid Field" error):**
```javascript
// ❌ This is WRONG for SERP endpoints
task.keyword = ["llc formation"];
```

**Correct:**
```javascript
// ✅ Correct for SERP endpoints
task.keyword = "llc formation";
```

### ⚠️ Authentication Uses Base64

```javascript
function createAuthenticatedFetch(username, password) {
  return (url, init) => {
    const token = Buffer.from(`${username}:${password}`).toString('base64');
    const authHeader = { Authorization: `Basic ${token}` };

    const newInit = {
      ...init,
      headers: {
        ...init?.headers,
        ...authHeader,
      },
    };

    return fetch(url, newInit);
  };
}
```

### ⚠️ Location Code is Required

Most requests require `location_code`. Common values:
- `2840` = United States
- `2826` = United Kingdom
- `2036` = Canada

You can get the full list by calling:
```
GET https://api.dataforseo.com/v3/serp/google/locations
```

---

## Code Examples

### SERP API — Live Request (Quick Results)

```typescript
import * as client from 'dataforseo-client';

async function getSerpData() {
  const authFetch = createAuthenticatedFetch(
    process.env.DATAFORSEO_LOGIN!,
    process.env.DATAFORSEO_PASSWORD!
  );

  const serpApi = new client.SerpApi('https://api.dataforseo.com', { fetch: authFetch });

  const task = new client.SerpGoogleOrganicLiveAdvancedRequestInfo();
  task.keyword = 'llc formation non-resident';  // ✅ Single string
  task.location_code = 2840;                    // ✅ Required
  task.language_code = 'en';

  const response = await serpApi.googleOrganicLiveAdvanced([task]);

  if (response.tasks?.[0]?.result) {
    const items = response.tasks[0].result[0].items;
    const organicResults = items.filter(i => i.type === 'organic');
    console.log(`Found ${organicResults.length} results`);
  }
}
```

### SERP API — Task-Based Request (Async, for Large Batches)

```typescript
// 1. Submit task
const taskResponse = await serpApi.googleOrganicTaskPost([task]);
const taskId = taskResponse.tasks[0].id;

// 2. Poll for completion
while (!await isTaskReady(serpApi, taskId)) {
  await new Promise(resolve => setTimeout(resolve, 2000));
}

// 3. Get results
const results = await serpApi.googleOrganicTaskGetAdvanced(taskId);
```

### Keywords Data API

```typescript
const keywordsApi = new client.KeywordsDataApi('https://api.dataforseo.com', { fetch: authFetch });

// ⚠️ Note: keywords_data uses "keywords" (array), not "keyword" (string)
const keywordTask = new client.GoogleKeywordsLiveRequestInfo();
keywordTask.keywords = ['llc formation', 'non-resident llc'];  // Array!
keywordTask.location_code = 2840;
keywordTask.language_code = 'en';

const response = await keywordsApi.googleKeywordsLive([keywordTask]);
```

---

## Available APIs

The `dataforseo-client` package provides 12 API sections:

| API | Use Case |
|-----|----------|
| `SerpApi` | Search engine results (SERP) data |
| `KeywordsDataApi` | Keyword search volume, difficulty, CPC |
| `DomainAnalyticsApi` | Domain-level analytics |
| `DataforseoLabsApi` | DataForSEO Labs features |
| `BacklinksApi` | Backlink analysis |
| `OnPageApi` | On-page SEO analysis |
| `ContentAnalysisApi` | Content analysis |
| `ContentGenerationApi` | Content generation |
| `MerchantApi` | E-commerce merchant data |
| `AppDataApi` | App store data (iOS/Android) |
| `BusinessDataApi` | Business listings data |
| `AiOptimizationApi` | AI optimization features |

---

## Response Format

DataForSEO returns a consistent envelope:

```json
{
  "version": "0.1.20260430",
  "status_code": 20000,
  "status_message": "Ok.",
  "time": "1.5 sec",
  "cost": 0.002,
  "tasks_count": 1,
  "tasks_error": 0,
  "tasks": [
    {
      "id": "task-id-here",
      "status_code": 20000,
      "status_message": "Ok.",
      "cost": 0.002,
      "result_count": 1,
      "result": [
        { /* actual data */ }
      ]
    }
  ]
}
```

**Status codes:**
- `20000` = Success
- `40501` = Invalid field (usually wrong parameter format)
- `40400` = Endpoint not found (wrong URL)
- `401` = Authentication failed

---

## Project Integration

### Client Module Location
`src/lib/dataforseo.ts` — Use this module in your code:

```typescript
import { getSerpClient, SerpGoogleOrganicLiveAdvancedRequestInfo } from '@/lib/dataforseo';

const client = await getSerpClient();
const task = new SerpGoogleOrganicLiveAdvancedRequestInfo();
task.keyword = 'your search term';
task.location_code = 2840;
task.language_code = 'en';

const result = await client.googleOrganicLiveAdvanced([task]);
```

### Test Script
`scripts/test-dataforseo.mjs` — Run to verify connection:

```bash
node scripts/test-dataforseo.mjs
```

---

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `40501 Invalid Field: 'keyword'` | Used array for `keyword` field | Use single string: `keyword: "text"` |
| `40501 Invalid Field: 'keywords'` | Used string for `keywords` field | Use array: `keywords: ["a", "b"]` |
| `40400 Not Found` | Wrong endpoint URL | Check API docs for correct path |
| `401 Unauthorized` | Bad credentials | Verify `.env` credentials |
| `Insufficient balance` | No credits | Recharge DataForSEO account |

---

## Resources

- [DataForSEO API Documentation](https://docs.dataforseo.com/v3/)
- [Client GitHub](https://github.com/dataforseo/TypeScriptClient)
- [API Authentication Docs](https://dataforseo.com/docs/base-api-authentication)

---

*Last updated: 2026-05-03*
*Initial setup by Claude Code agent*