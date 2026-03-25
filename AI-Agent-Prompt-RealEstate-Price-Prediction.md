# AI Agent Implementation Prompt — Real Estate CRM Price Prediction

> **For:** AI Coding Agent (Claude / Cursor / Copilot / Custom Agent)
> **Target:** Indian Real Estate Market
> **Version:** 1.0 | March 2026

---

## How to use this document

Feed this entire file to your AI coding agent as context. Then execute each phase sequentially by telling the agent: **"Execute Phase X"**. Each phase is self-contained but builds on previous phases. Replace all `{{VARIABLES}}` in the config section below with your actual project values before starting.

---

## Project Configuration — Replace these variables

```env
# === CORE STACK ===
FRAMEWORK=Next.js 14            # Your CRM's frontend framework (Next.js / React / Vue / Angular)
BACKEND=FastAPI                  # Your CRM's backend framework (FastAPI / Express / Django REST / Laravel)
DATABASE=PostgreSQL              # Primary database (PostgreSQL / MySQL / MongoDB)
ORM=SQLAlchemy                   # ORM or query builder (SQLAlchemy / Prisma / Sequelize / TypeORM)
AUTH_SYSTEM=JWT                  # Auth system (NextAuth / JWT / Clerk / Auth0)
STYLING=Tailwind                 # CSS/component library (Tailwind / MUI / Chakra / shadcn)

# === AI & DATA ===
LLM_PROVIDER=Claude API          # LLM for reasoning (Claude API / OpenAI / Groq / Gemini)
LLM_MODEL=claude-sonnet-4-20250514  # Specific model to use
QUEUE_SYSTEM=Celery              # Job queue (Celery / BullMQ / Bull / Django-Q)
CACHE=Redis                      # Cache layer (Redis / Memcached)

# === CRM TABLES (your existing tables) ===
PROPERTY_TABLE=properties        # Your existing property/listing table name
USER_TABLE=users                 # Your existing user/agent table name
LEAD_TABLE=leads                 # Your existing leads table name (if any)

# === BUSINESS CONFIG ===
CURRENCY=INR                     # Target currency
TARGET_CITIES=Delhi NCR, Mumbai, Bangalore, Pune, Hyderabad, Chennai, Gurgaon, Noida, Ahmedabad, Kolkata
DEPLOYMENT_PLATFORM=AWS          # Deployment target (AWS / Railway / Vercel / GCP / Azure)
```

> **IMPORTANT:** Your AI agent should read this config block FIRST and reference these variables throughout all phases. Every `{{VARIABLE}}` in the prompts below maps to the values you set here.

---

---

# PHASE 1: Database Schema — Price Intelligence Tables

## Objective
Create database migrations and models for storing scraped listings, price history, and AI estimation results. These tables integrate with your existing CRM property tables.

## Instructions for AI Agent

You are adding an AI price prediction feature to an existing real estate CRM. The CRM uses `{{FRAMEWORK}}` frontend, `{{BACKEND}}` backend, `{{DATABASE}}` database with `{{ORM}}` ORM.

### Tables to create

### 1. `scraped_listings` — Raw data from external sources

| Field | Type | Notes |
|-------|------|-------|
| id | UUID, PK | Auto-generated |
| source_name | ENUM: `magicbricks`, `99acres`, `housing_com`, `nobroker`, `govt_registry` | Indexed |
| source_listing_id | STRING | Unique per source |
| property_type | ENUM: `apartment`, `villa`, `independent_house`, `plot`, `penthouse`, `commercial` | |
| city | STRING | Indexed |
| locality | STRING | Indexed |
| sub_locality | STRING, nullable | |
| latitude | DECIMAL(10,7) | |
| longitude | DECIMAL(10,7) | |
| area_sqft | INTEGER | |
| bedrooms | INTEGER, nullable | |
| bathrooms | INTEGER, nullable | |
| floor_number | INTEGER, nullable | |
| total_floors | INTEGER, nullable | |
| age_of_property_years | INTEGER, nullable | |
| listed_price | BIGINT | Raw price in base currency units |
| price_per_sqft | INTEGER, computed | `listed_price / area_sqft` |
| amenities | JSON ARRAY | Standardized amenity list |
| furnishing_status | ENUM: `furnished`, `semi_furnished`, `unfurnished`, nullable | |
| facing_direction | STRING, nullable | |
| raw_data | JSONB | Complete scraped payload for debugging |
| scraped_at | TIMESTAMP | When we scraped it |
| listing_date | DATE, nullable | When the listing was originally posted |
| is_active | BOOLEAN, default true | Set false if listing disappears |
| property_group_id | UUID, nullable | Links duplicates across sources |
| is_outlier | BOOLEAN, default false | Flagged by outlier detector |
| outlier_reason | TEXT, nullable | Why it was flagged |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Indexes:**
- Compound index on `(city, locality, property_type, bedrooms)`
- Spatial index on `(latitude, longitude)` — use PostGIS if PostgreSQL
- Unique compound index on `(source_name, source_listing_id)` for dedup
- Index on `property_group_id`
- Index on `scraped_at`

### 2. `price_estimations` — AI-generated valuations

| Field | Type | Notes |
|-------|------|-------|
| id | UUID, PK | |
| property_id | FK → `{{PROPERTY_TABLE}}.id` | ON DELETE CASCADE |
| estimated_price | BIGINT | Final weighted estimate |
| price_low | BIGINT | Lower bound of range |
| price_high | BIGINT | Upper bound of range |
| price_per_sqft | INTEGER | |
| confidence_score | DECIMAL(5,2) | Range 0-100 |
| estimation_method | ENUM: `comparable_analysis`, `market_trend`, `llm_reasoning`, `hybrid` | |
| comparable_count | INTEGER | How many comps were used |
| comparable_radius_km | DECIMAL(5,2) | Search radius used |
| market_trend_6m_pct | DECIMAL(5,2) | 6-month price change % |
| market_trend_12m_pct | DECIMAL(5,2) | 12-month price change % |
| factors_json | JSONB | Breakdown of all factors and impact |
| source_breakdown | JSONB | Per-source price and confidence |
| llm_reasoning | TEXT | Full LLM explanation |
| estimated_by | STRING | Agent/user who triggered |
| created_at | TIMESTAMP | |

**Indexes:**
- Index on `property_id`
- Index on `created_at`

### 3. `market_trends` — Aggregated locality-level pricing trends

| Field | Type | Notes |
|-------|------|-------|
| id | UUID, PK | |
| city | STRING | |
| locality | STRING | |
| property_type | ENUM | Same as scraped_listings |
| bedrooms | INTEGER, nullable | |
| period_start | DATE | |
| period_end | DATE | |
| avg_price_per_sqft | INTEGER | |
| median_price_per_sqft | INTEGER | |
| min_price_per_sqft | INTEGER | |
| max_price_per_sqft | INTEGER | |
| listing_count | INTEGER | |
| price_change_pct | DECIMAL(5,2) | vs previous period |
| demand_score | DECIMAL(5,2) | 0-100, based on listing velocity |
| created_at | TIMESTAMP | |

**Indexes:**
- Compound index on `(city, locality, property_type, period_end)`

### 4. `scraping_jobs` — Track pipeline status

| Field | Type | Notes |
|-------|------|-------|
| id | UUID, PK | |
| source_name | ENUM | |
| city | STRING | |
| locality | STRING, nullable | |
| status | ENUM: `queued`, `running`, `completed`, `failed`, `rate_limited` | |
| listings_found | INTEGER, default 0 | |
| listings_new | INTEGER, default 0 | |
| listings_updated | INTEGER, default 0 | |
| error_message | TEXT, nullable | |
| started_at | TIMESTAMP, nullable | |
| completed_at | TIMESTAMP, nullable | |
| created_at | TIMESTAMP | |

### Additional requirements
- Use `{{ORM}}` syntax for all migrations
- Add FK from `price_estimations.property_id` → `{{PROPERTY_TABLE}}.id` with ON DELETE CASCADE
- Add nullable column `ai_estimation_id` (FK → `price_estimations.id`) to `{{PROPERTY_TABLE}}`
- Create proper TypeScript/Python types for all enums
- If PostgreSQL: enable PostGIS extension, use geography type for lat/lng
- Create seed data script with 50 sample scraped_listings across 3 cities for testing

---

---

# PHASE 2: Agentic Data Fetching Pipeline

## Objective
Build autonomous scraper agents that fetch property data from multiple Indian real estate platforms. Each agent operates independently with rate limiting, retries, and status reporting.

## Instructions for AI Agent

You are building an agentic data fetching pipeline for the real estate CRM price prediction feature. The system uses `{{BACKEND}}` with `{{QUEUE_SYSTEM}}` for job management and `{{CACHE}}` for rate limiting.

### Component 1: ScraperAgent Base Class

Create an abstract/base class `ScraperAgent` with:

**Properties:**
- `source_name` — identifier string
- `base_url` — root URL of the platform
- `rate_limit_per_minute` — max requests allowed per minute
- `retry_max` — default 3
- `retry_delay_seconds` — default 5 (exponential backoff)

**Methods:**
- `async scrape(city, locality, filters)` → `ScrapedListing[]`
- `async parse_listing(raw_html_or_json)` → `NormalizedListing`
- `async check_rate_limit()` → boolean (uses sliding window in `{{CACHE}}`)
- `async report_status(job_id, status, metrics)` → void

**Built-in features:**
- Retry logic with exponential backoff: `delay * 2^attempt`
- Rate limiting using `{{CACHE}}` sliding window (per source)
- User-agent rotation — provide a list of 10 realistic browser user agents
- Proxy support via env variable `PROXY_URL`
- Request delay randomization: 2-5 seconds between requests
- CAPTCHA detection: log and skip (don't attempt to solve)
- IP block detection: rotate proxy and retry
- Structure change detection: log schema mismatch warning, don't crash
- Structured logging: `{agent, city, locality, action, duration_ms, result_count}`

### Component 2: Source-Specific Agents

#### a) `MagicBricksAgent` extends ScraperAgent
- Base URL: `https://www.magicbricks.com`
- Strategy: Use their search API endpoint if available, fall back to HTML parsing with Cheerio/BeautifulSoup
- Parse: property_type, BHK, area, price, locality, amenities, floor, age, furnishing
- Rate limit: 20 requests/minute
- Handle pagination (typically 25 listings per page)

#### b) `NinetyNineAcresAgent` extends ScraperAgent
- Base URL: `https://www.99acres.com`
- Strategy: Their search results return JSON — prefer API over HTML
- Parse: same fields + builder_name, possession_status
- Rate limit: 15 requests/minute

#### c) `HousingComAgent` extends ScraperAgent
- Base URL: `https://housing.com`
- Strategy: GraphQL API if available, else HTML parsing with dynamic rendering (Playwright)
- Parse: same fields + nearby_landmarks, transit_score
- Rate limit: 15 requests/minute
- **Requires Playwright** — site uses heavy JS rendering

#### d) `NoBrokerAgent` extends ScraperAgent
- Base URL: `https://www.nobroker.in`
- Strategy: Their API requires auth tokens — implement token refresh flow
- Parse: same fields + owner_type (owner/agent), maintenance_charges
- Rate limit: 10 requests/minute

#### e) `GovtRegistryAgent` extends ScraperAgent
- Scrapes state-level property registration portals
- Start with: Delhi (doris.delhigovt.nic.in), Maharashtra (igrmaharashtra.gov.in), Karnataka (karigr.karnataka.gov.in)
- Focus on: registration_price (circle rate), stamp_duty_paid, registration_date, area
- These are the **most reliable** price signals — actual transaction values
- Rate limit: 5 requests/minute (government sites are slow)

### Component 3: ScrapingOrchestrator

Create a `ScrapingOrchestrator` class that:

1. Accepts a scraping request:
```json
{
  "city": "string",
  "locality": "string (optional)",
  "property_type": "string (optional)",
  "bedrooms": "number (optional)",
  "radius_km": "number (optional)"
}
```

2. Creates `scraping_jobs` records in the database — one per source

3. Dispatches jobs to `{{QUEUE_SYSTEM}}` — **all 5 sources in parallel**

4. Monitors job progress via `{{CACHE}}` pub/sub or polling

5. Aggregates results when all jobs complete (or timeout after **120 seconds**)

6. Emits **WebSocket events** to frontend:
   - `job_started` — `{job_id, sources: [...]}`
   - `agent_progress` — `{job_id, source, status, detail}`
   - `agent_complete` — `{job_id, source, listings_found}`
   - `all_complete` — `{job_id, total_listings, sources_succeeded, sources_failed}`

7. Handles partial failures gracefully — if 2 of 5 sources fail, still return results from 3

### Component 4: Scheduling Service

Create a cron-based scheduler:

| Schedule | Task | Details |
|----------|------|---------|
| Daily 2-5 AM IST | Full city scrape | All `{{TARGET_CITIES}}`, all sources |
| Every 6 hours | Hot locality update | Localities with user queries in last 24h |
| Every scrape cycle | Stale listing cleanup | `is_active = false` if missing from 3 consecutive scrapes |
| Weekly Sunday 3 AM | Market trends generation | Aggregate `scraped_listings` → `market_trends` |

### City-URL Configuration

Create a config file mapping city names to their search URLs on each platform:

```json
{
  "Delhi NCR": {
    "magicbricks": "/property-for-sale/residential-real-estate?bedroom=&proptype=&cityName=New-Delhi",
    "99acres": "/search/property/buy/delhi-ncr?city=74",
    "housing_com": "/in/buy/searches/P1/delhi-ncr",
    "nobroker": "/property/sale/delhi-ncr",
    "govt_registry": "https://doris.delhigovt.nic.in"
  }
}
```

Create entries for all `{{TARGET_CITIES}}`.

### Dependencies to install
- `playwright` or `puppeteer` — for dynamic content (Housing.com, NoBroker)
- `cheerio` (Node) or `beautifulsoup4` (Python) — for static HTML parsing
- `{{QUEUE_SYSTEM}}` client library
- `{{CACHE}}` client library

---

---

# PHASE 3: Data Normalization & Deduplication Engine

## Objective
Clean messy scraped data — standardize formats, deduplicate across sources, flag outliers.

## Instructions for AI Agent

Build a `NormalizationPipeline` that runs sequentially after each scraping batch completes. Each stage must be **idempotent** (safe to re-run).

### Stage 1: Field Normalization — `NormalizerService`

#### City name mapping
Map all variations to canonical names:
```
Bengaluru, Bengalooru → Bangalore
Bombay → Mumbai
NCR, New Delhi, Delhi → Delhi NCR
Gurugram → Gurgaon
Calcutta → Kolkata
Pune, Poona → Pune
Secundrabad, Secunderabad → Hyderabad
Madras → Chennai
```
Create comprehensive mapping for all `{{TARGET_CITIES}}` including common misspellings.

#### Locality name fuzzy matching
- Use Levenshtein distance with **0.85 similarity threshold**
- Examples: `Whitefield` = `White Field` = `ITPL Whitefield`
- Build a canonical locality dictionary per city from the most common spelling in scraped data
- Store mapping in `{{CACHE}}` for fast lookups

#### Area conversion
Convert ALL area units to sq.ft:

| From | Multiply by |
|------|------------|
| sq.m (square meters) | 10.764 |
| sq.yards | 9.0 |
| acres | 43,560 |
| hectares | 107,639 |
| guntha | 1,089 |
| cent | 435.6 |
| bigha (varies by state — use UP standard) | 27,000 |
| marla | 272.25 |
| kanal | 5,445 |

#### Price cleanup
Parse Indian price formats to raw integer:
```
"1.5 Cr" → 15000000
"1.5 Crore" → 15000000
"65 L" → 6500000
"65 Lac" → 6500000
"65 Lakh" → 6500000
"95,00,000" → 9500000
"₹ 45 Lakhs" → 4500000
"45L - 50L" → 4750000 (take midpoint)
```

#### Property type mapping
```
Builder Floor → apartment
Row House → villa
Farmhouse → villa
Studio Apartment → apartment (bedrooms = 1)
Duplex → apartment
Bungalow → villa
Residential Plot → plot
Commercial Shop → commercial
Office Space → commercial
```

#### BHK extraction
Parse from strings: `3BHK`, `3 BHK`, `3 Bed`, `Three Bedroom`, `3 Bedroom Hall Kitchen`, `3RK` → `bedrooms = 3`

#### Amenities standardization
Map to canonical set:
```
parking, gym, swimming_pool, garden, security, lift, power_backup,
water_supply, club_house, play_area, jogging_track, sports_facility,
fire_safety, cctv, intercom, rainwater_harvesting, waste_management
```

### Stage 2: Geocoding & Location Enrichment — `GeocodingService`

1. Geocode listings with locality but no lat/lng using Google Maps Geocoding API (or Nominatim for free tier)
2. Validate existing lat/lng by reverse geocoding and checking city match
3. Enrich with:
   - `pin_code`
   - `nearest_metro_station` + `distance_km`
   - `nearest_school` + `distance_km`
   - `nearest_hospital` + `distance_km`
4. Cache ALL geocoding results in `{{CACHE}}` (TTL: 30 days) to avoid duplicate API calls
5. Batch process: handle 1000+ listings with rate limiting (Google allows 50 QPS)

### Stage 3: Deduplication — `DeduplicationService`

**Exact match:** Same `source_listing_id` + `source_name` → update existing record

**Cross-source fuzzy match:** Two listings from different sources are the **same property** if ALL of:
1. Same city AND locality (after normalization)
2. Same `property_type` AND `bedrooms`
3. `area_sqft` within **5% tolerance**
4. `lat/lng` within **100 meters** (use Haversine formula or PostGIS `ST_DWithin`)
5. `listed_price` within **20% tolerance**

**When duplicates found:**
- Keep ALL records (don't delete)
- Link with shared `property_group_id` (UUID)
- This lets us compare same property's price across sources
- Assign `dedup_confidence` (0.0 - 1.0) based on how many criteria matched

### Stage 4: Outlier Detection — `OutlierDetector`

Flag suspicious listings (set `is_outlier = true`, fill `outlier_reason`):

| Rule | Reason |
|------|--------|
| Price/sqft > 2σ from locality average | `price_deviation_high` or `price_deviation_low` |
| 5 BHK in < 500 sqft | `impossible_area_bhk_mismatch` |
| Price = 0 or Area = 0 | `zero_value_field` |
| Same property_group has >50% price variance | `cross_source_price_manipulation` |
| Listing claims 100+ floors | `unrealistic_floor_count` |

**Flag but NEVER delete** — outliers may be legitimate luxury properties or data entry errors.

### Pipeline execution

```
Scraping batch completes
    → Stage 1: Normalize fields (city, locality, area, price, type, BHK, amenities)
    → Stage 2: Geocode missing lat/lng, enrich with nearby landmarks
    → Stage 3: Deduplicate across sources, assign property_group_id
    → Stage 4: Flag outliers
    → Log metrics: {listings_normalized, duplicates_found, outliers_flagged, geocoding_success_rate}
```

Add a CLI command to run on all existing data:
- Node: `npm run normalize`
- Python: `python manage.py normalize`

---

---

# PHASE 4: AI Price Estimation Core Engine

## Objective
Build the engine that takes a property's details and produces a confidence-weighted price estimation using three analysis methods combined into a hybrid estimate.

## Instructions for AI Agent

### Component 1: `ComparableAnalysisAgent`

**Input:**
```json
{
  "city": "string",
  "locality": "string",
  "property_type": "string",
  "bedrooms": "number",
  "area_sqft": "number",
  "floor": "number (optional)",
  "age_years": "number (optional)",
  "furnishing": "string (optional)"
}
```

**Process:**

1. Query `scraped_listings` within same locality, property_type, and bedrooms WHERE `is_outlier = false` AND `is_active = true`

2. If fewer than 5 results → expand: same city + adjacent localities (use PostGIS `ST_DWithin(5km)` or Haversine)

3. If still fewer than 5 → relax bedrooms by ±1 BHK

4. For each comparable, calculate `similarity_score` (0.0 - 1.0):

| Factor | Weight | Scoring |
|--------|--------|---------|
| Area difference | 0.30 | `1 - abs(comp_area - target_area) / target_area`, clamped to [0, 1] |
| Location distance | 0.25 | `1 - (distance_km / max_radius_km)`, clamped to [0, 1] |
| Age difference | 0.15 | `1 - abs(comp_age - target_age) / 20`, clamped to [0, 1] |
| Floor difference | 0.10 | `1 - abs(comp_floor - target_floor) / 30`, clamped to [0, 1] |
| Furnishing match | 0.10 | 1.0 if exact match, 0.5 if one step away, 0.0 if opposite |
| Same source bonus | 0.10 | 1.0 if govt_registry, 0.7 if multiple sources agree, 0.5 otherwise |

5. Take **top 15** comparables by similarity_score

6. Calculate **weighted average** `price_per_sqft` using similarity_score as weight

7. Apply adjustments:
   - `+3%` per floor above 5th floor
   - `-2%` for unfurnished vs semi-furnished comparison
   - `-5%` per additional 5 years of age beyond comparable average
   - `+5%` for corner/park-facing units
   - `+8%` if property has premium amenities (swimming pool + club house + gym)

8. **Return:**
```json
{
  "estimated_price_per_sqft": "number",
  "estimated_total_price": "number",
  "comparable_count": "number",
  "avg_similarity_score": "number",
  "search_radius_km": "number",
  "adjustments_applied": [{"factor": "string", "impact_pct": "number"}],
  "comparables_used": [{"id": "uuid", "price": "number", "price_per_sqft": "number", "similarity_score": "number", "source": "string", "locality": "string"}]
}
```

### Component 2: `MarketTrendAgent`

**Input:**
```json
{
  "city": "string",
  "locality": "string",
  "property_type": "string",
  "bedrooms": "number (optional)"
}
```

**Process:**

1. Query `market_trends` for this locality over last 12 months

2. If data is sparse (< 3 months), generate on-the-fly by aggregating `scraped_listings` with `listing_date` in last 12 months, grouped by month

3. Calculate:
   - Month-over-month growth rate
   - 3-month moving average of price_per_sqft
   - 6-month trend: linear regression slope
   - 12-month compound growth rate
   - `demand_score` = (new listings this month / avg monthly listings) × 100, normalized to 0-100

4. Project current fair `price_per_sqft` by extrapolating the 3-month moving average trend

5. Apply seasonal adjustments for Indian market:
   - `+2%` during Oct-Dec (Diwali/festive season — peak buying)
   - `+1%` during Jan-Mar (financial year end — investment buying)
   - `-1%` during May-Jul (slow season — monsoon)
   - `0%` during Aug-Sep (neutral)

6. **Return:**
```json
{
  "projected_price_per_sqft": "number",
  "trend_6m_pct": "number",
  "trend_12m_pct": "number",
  "demand_score": "number (0-100)",
  "seasonality_adjustment_pct": "number",
  "data_points_used": "number",
  "monthly_data": [{"month": "YYYY-MM", "avg_price_per_sqft": "number", "listing_count": "number"}]
}
```

### Component 3: `LLMReasoningAgent`

**Input:** Property details + results from comparable and trend agents

**LLM System Prompt (send this to `{{LLM_PROVIDER}}` with model `{{LLM_MODEL}}`):**

```
You are an expert Indian real estate valuation analyst. You have deep knowledge of property
markets across Indian cities, including micro-market dynamics, builder reputations,
infrastructure impact on prices, and regulatory factors like RERA compliance.

Given the property details and analysis data below, provide:
1. A reasoned price estimation in INR
2. Key factors that increase/decrease value vs comparables
3. Risk factors the buyer/seller should know
4. Market timing recommendation (good/neutral/wait)

PROPERTY:
City: {city}, Locality: {locality}
Type: {property_type}, Config: {bedrooms} BHK, Area: {area_sqft} sq.ft
Floor: {floor}/{total_floors}, Age: {age_years} years, Furnishing: {furnishing}
Amenities: {amenities_list}

COMPARABLE ANALYSIS RESULT:
Estimated price/sqft: ₹{comp_price_per_sqft}
Based on {comparable_count} comparable properties
Average similarity score: {avg_similarity_score}
Top 5 comparables:
{for each: source, locality, price, price_per_sqft, similarity_score}

MARKET TREND RESULT:
6-month trend: {trend_6m_pct}%
12-month trend: {trend_12m_pct}%
Demand score: {demand_score}/100
Current seasonal factor: {seasonality_note}
Monthly price data (last 6 months): {monthly_data}

Respond ONLY in this JSON format with no additional text:
{
  "estimated_price_total": <number>,
  "estimated_price_per_sqft": <number>,
  "confidence": <number 0-100>,
  "reasoning": "<2-3 paragraph detailed explanation>",
  "positive_factors": ["<factor1>", "<factor2>", ...],
  "negative_factors": ["<factor1>", "<factor2>", ...],
  "risk_factors": ["<risk1>", "<risk2>", ...],
  "market_timing": "<good | neutral | wait>",
  "timing_reasoning": "<1 sentence explanation>"
}
```

**Post-processing:**
1. Parse LLM response JSON (handle markdown code fences — strip ` ```json ` wrappers)
2. **Validation:** If LLM estimate is outside ±30% of comparable estimate → reduce confidence by 20 points and add warning: `"llm_estimate_divergent"`
3. LLM call timeout: **30 seconds**. On timeout → proceed with comparable + trend only (skip LLM component in hybrid)

### Component 4: `HybridEstimator` — Final Combiner

**Base weights:**
| Method | Weight |
|--------|--------|
| Comparable Analysis | 0.45 |
| Market Trend | 0.25 |
| LLM Reasoning | 0.30 |

**Dynamic weight adjustment:**

| Condition | Adjustment |
|-----------|------------|
| `comparable_count < 5` | Comparable weight −0.10 → redistribute to LLM |
| `trend data_points < 3` months | Trend weight −0.10 → redistribute to Comparable |
| `LLM confidence < 50` | LLM weight −0.15 → redistribute to Comparable |
| LLM timed out / failed | LLM weight = 0 → redistribute 60/40 to Comparable/Trend |
| Govt registry data in comparables | Comparable weight +0.10 → reduce LLM by 0.10 |

After adjustment, **normalize weights to sum to 1.0**.

**Calculation:**
1. Weighted average `price_per_sqft` = Σ(method_price × method_weight)
2. `estimated_total_price` = weighted_price_per_sqft × area_sqft
3. `confidence` = weighted average of all method confidence scores
4. Price range:
   - `price_low` = estimated × (1 − (100 − confidence) / 200)
   - `price_high` = estimated × (1 + (100 − confidence) / 200)
5. Merge `factors_json` from LLM positive/negative factors + comparable adjustments
6. Build `source_breakdown` from comparable agent's per-source data

**Store result in `price_estimations` table and return.**

### API Endpoint

```
POST /api/v1/estimate-price

Request body:
{
  "property_id": "string (optional — if provided, auto-fill from CRM)",
  "city": "string",
  "locality": "string",
  "property_type": "apartment | villa | independent_house | plot | penthouse | commercial",
  "bedrooms": "number",
  "area_sqft": "number",
  "floor": "number (optional)",
  "total_floors": "number (optional)",
  "age_years": "number (optional)",
  "furnishing": "furnished | semi_furnished | unfurnished (optional)",
  "amenities": ["string array (optional)"]
}

Response:
{
  "estimation_id": "uuid",
  "estimated_price": "number",
  "price_low": "number",
  "price_high": "number",
  "price_per_sqft": "number",
  "confidence_score": "number (0-100)",
  "estimation_method": "hybrid",
  "source_breakdown": [
    {"source": "string", "price_per_sqft": "number", "listings_used": "number", "confidence": "number"}
  ],
  "factors": [
    {"name": "string", "impact_pct": "number", "direction": "positive | negative"}
  ],
  "llm_reasoning": "string",
  "market_timing": "good | neutral | wait",
  "timing_reasoning": "string",
  "comparable_count": "number",
  "trend_data": {
    "trend_6m_pct": "number",
    "demand_score": "number"
  },
  "created_at": "ISO timestamp"
}
```

**Performance requirements:**
- Full estimation: **< 15 seconds** end-to-end
- Cache recent estimations for same `property_id` in `{{CACHE}}` (TTL: 6 hours)
- LLM timeout: 30 seconds with graceful fallback
- Log timing breakdown per component

---

---

# PHASE 5: CRM Integration Layer

## Objective
Connect the price estimation engine to existing CRM workflows — auto-estimating properties, enriching leads, powering agent dashboards.

## Instructions for AI Agent

### Feature 1: Auto-Estimation on Property Creation

Add a hook (database trigger or application-level middleware): when a new property is inserted into `{{PROPERTY_TABLE}}` with sufficient data (city + locality + area + type + bedrooms), **automatically queue a price estimation**.

```
Property Created → Check required fields exist → Queue estimation job → Store estimation_id on property

If estimation fails → set ai_estimation_status = 'failed' with error reason on property record
```

Add API for manual re-trigger:
```
POST /api/v1/properties/:id/re-estimate
→ Clears cached estimation
→ Queues fresh estimation
→ Returns new job_id for WebSocket tracking
```

### Feature 2: Bulk Estimation

```
POST /api/v1/admin/bulk-estimate  (admin only)

Request:
{
  "filters": {
    "city": "string (optional)",
    "locality": "string (optional)",
    "property_type": "string (optional)",
    "created_after": "ISO date (optional)",
    "created_before": "ISO date (optional)",
    "limit": "number (optional, default 100, max 1000)"
  },
  "force_refresh": "boolean (default false — skip properties with estimation < 7 days old)"
}

Response:
{
  "job_id": "uuid",
  "properties_queued": "number",
  "estimated_duration_seconds": "number"
}
```

WebSocket for progress: `ws://host/ws/bulk-estimate/:job_id`

### Feature 3: Property Comparison

```
POST /api/v1/compare-properties

Request: { "property_ids": ["uuid", "uuid", ...] }  // 2-5 properties

Response:
{
  "properties": [
    {
      "property_id": "uuid",
      "address": "string",
      "estimated_price": "number",
      "price_per_sqft": "number",
      "confidence": "number",
      "trend_6m_pct": "number",
      "investment_score": "number (0-100)",
      "key_factors": ["string"]
    }
  ],
  "recommendation": {
    "best_value": "property_id",
    "highest_confidence": "property_id",
    "best_trend": "property_id",
    "overall_best": "property_id",
    "reasoning": "string"
  }
}
```

**`investment_score` formula:**
- Price vs locality average: 30% weight (lower = better score)
- Trend direction: 25% weight (upward = higher score)
- Demand score: 20% weight (higher demand = higher score)
- Confidence: 15% weight (higher = better)
- Amenities richness: 10% weight

### Feature 4: Lead Enrichment

When a lead specifies requirements (city, budget, BHK, area_range):

1. Run estimation on matching properties in CRM
2. Flag properties where `estimated_price > listed_price × 1.15` → `deal_flag: "potentially_overpriced"`
3. Flag properties where `estimated_price < listed_price × 0.90` → `deal_flag: "good_deal"`
4. Add flags to lead's recommended properties list
5. Expose via API: `GET /api/v1/leads/:id/enriched-recommendations`

### Feature 5: Agent Dashboard API

```
GET /api/v1/dashboard/price-intelligence

Response:
{
  "today": {
    "total_estimations": "number",
    "avg_confidence": "number"
  },
  "top_demand_localities": [
    {"city": "string", "locality": "string", "demand_score": "number", "avg_price_per_sqft": "number"}
  ],
  "price_alerts": [
    {"city": "string", "locality": "string", "change_pct": "number", "direction": "up | down", "period": "string"}
  ],
  "accuracy_metrics": {
    "estimations_with_actual_sale": "number",
    "mean_absolute_error_pct": "number",
    "median_error_pct": "number"
  }
}
```

### Feature 6: Webhook System

```
POST /api/v1/webhooks

Request:
{
  "url": "https://your-endpoint.com/hook",
  "events": ["estimation_completed", "price_alert", "market_trend_shift"],
  "secret": "your-hmac-secret"
}
```

Sign all payloads with HMAC-SHA256 using the provided secret.

### Auth & Rate Limiting

- All endpoints require `{{AUTH_SYSTEM}}` authentication
- Rate limits: 50 estimates/hour (regular user), 500/hour (admin)
- API key support: `X-API-Key` header for programmatic access
- Role-based: only admin can bulk-estimate and manage webhooks

---

---

# PHASE 6: Frontend UI Components

## Objective
Build the user-facing components that display estimations, agent status, and market intelligence.

## Instructions for AI Agent

Build these components using `{{FRAMEWORK}}` with `{{STYLING}}`. All components must be **responsive (mobile-first)** and follow the CRM's existing design system.

### Component 1: `PropertyEstimationCard`

**Props:** `{ estimation: PriceEstimation, property: Property }`

**Layout:**
- **Top section:** Estimated price in large bold text (e.g., "₹1.25 Cr"), price range below ("₹1.15 Cr — ₹1.35 Cr"), confidence ring (circular SVG — green >80%, amber 60-80%, red <60%)
- **Middle section:** Source breakdown — horizontal bars showing each source's price with color coding. Show: source name, source icon, estimated price, listing count, last updated time
- **Bottom section:** Collapsible "AI Analysis" panel — LLM reasoning text, positive factors as green pills, negative factors as red pills, market timing badge (green/amber/red)
- **Actions:** "Re-estimate" button, "Compare" button, "Share Report" button (generates PDF or link)

**Animations:**
- Price number counts up on first render (0 → final value over 1 second, ease-out)
- Confidence ring fills clockwise on mount
- Source bars animate width from 0 on mount (staggered by 100ms each)
- Skeleton loader while estimation is loading

### Component 2: `EstimationAgentStatus`

**Props:** `{ jobId: string }`

Real-time display of scraping agents at work.

- Connect to WebSocket: `ws://host/ws/estimation/:jobId`
- Show each agent as a row:
  - Source icon/colored badge
  - Status dot: gray = queued, blue pulsing = fetching, purple = analyzing, green = complete, red = failed
  - Detail text: "Queued" → "Scraping listings..." → "Analyzing 32 listings..." → "Complete: 32 listings"
  - Subtle progress animation per row
- When ALL agents complete → auto-transition to `PropertyEstimationCard`
- Handle partial failures: show warning banner "3 of 5 sources responded, estimation may be less accurate"

### Component 3: `PriceEstimationForm`

Quick estimation form for properties not yet in CRM.

**Fields:**
| Field | Type | Required |
|-------|------|----------|
| City | Searchable dropdown | Yes |
| Locality | Autocomplete (`GET /api/v1/localities?city=X&q=term`) | Yes |
| Property type | Dropdown | Yes |
| BHK | Radio buttons (1-5+) | Yes |
| Area (sq.ft) | Number input + range slider | Yes |
| Floor | Number input | No |
| Age of property | Number input (years) | No |
| Furnishing | Toggle: Furnished / Semi / Unfurnished | No |

**On submit:** Call `POST /api/v1/estimate-price` → show `EstimationAgentStatus` → transition to `PropertyEstimationCard`

Save recent estimates in browser state for quick re-access.

### Component 4: `MarketTrendChart`

**Props:** `{ city: string, locality: string, propertyType?: string }`

- **Line chart:** Monthly average price/sqft over 12 months
- **Overlay:** Listing volume as faded bar chart behind the price line
- **Tooltip on hover:** Month, avg price, change %, listing count
- **Comparison mode:** Toggle to add a second locality line
- Use Recharts (React) / Chart.js / ApexCharts depending on `{{FRAMEWORK}}`

### Component 5: `PriceIntelligenceDashboard` — Full Page

**Route:** `/dashboard/price-intelligence`

**Layout (responsive grid):**
- **Top row:** 4 stat cards — Total estimations today, Avg confidence %, Top demand locality, Biggest price change locality
- **Left column (2/3 width):** `MarketTrendChart` for user's most active city + Recent estimations list with quick stats
- **Right column (1/3 width):** Quick `PriceEstimationForm` (compact) + Price alerts feed (localities with >5% monthly change)
- **Filter bar:** City dropdown, date range picker, property type filter

### Component 6: `PropertyComparisonView`

**Route:** `/tools/compare`

Side-by-side comparison of 2-5 properties.

- Column per property: image placeholder, address, estimated price, confidence ring, price/sqft, key factor pills
- Highlight row: best value (lowest price/sqft) gets a green badge, highest confidence gets a blue badge
- "Winner" badge on best overall deal based on `investment_score`
- "Add property" button to add more to comparison

### Routing (add to existing CRM routes)

```
/dashboard/price-intelligence    → PriceIntelligenceDashboard
/properties/:id/estimation       → PropertyEstimationCard (within property detail page)
/tools/quick-estimate            → PriceEstimationForm
/tools/compare                   → PropertyComparisonView
```

### Styling notes
- Use CRM's existing design system and component library (`{{STYLING}}`)
- Add an "AI accent" color for AI-specific elements — suggest blue-purple gradient or a distinct accent that doesn't clash with existing CRM colors
- All loading states: skeleton screens
- All error states: friendly message + retry button
- All empty states: illustration + "Get your first estimation" CTA

---

---

# PHASE 7: Testing, Monitoring & Production Deployment

## Objective
Ensure reliability, observability, and production-readiness.

## Instructions for AI Agent

### Section 1: Testing

#### Unit Tests

| Module | Test cases |
|--------|-----------|
| `NormalizerService` | City name mappings (all variations), area conversions (sq.m, acres, bigha, guntha, marla, kanal → sqft), price parsing ("1.5 Cr", "65 L", "95,00,000", "₹ 45 Lakhs"), BHK extraction ("3BHK", "Three Bedroom", "3RK") |
| `ComparableAnalysisAgent` | Similarity scoring with known inputs, radius expansion logic (5 results → expand), adjustment calculations (+3% floor, -5% age) |
| `DeduplicationService` | Exact match, fuzzy match edge cases, property_group_id assignment, dedup_confidence scoring |
| `OutlierDetector` | Standard deviation detection, impossible combos (5BHK 400sqft), zero values |
| `HybridEstimator` | Weight adjustment (low comps, LLM timeout), confidence calculation, range calculation |
| `MarketTrendAgent` | Linear regression, seasonal adjustment, demand score |

#### Integration Tests

1. **Full scraping pipeline:** Mock HTTP responses → scrape → normalize → dedup → verify database state
2. **Full estimation pipeline:** Seed 50 listings → run estimation → verify all 3 methods produce results → verify hybrid combination
3. **CRM integration:** Create property → verify auto-estimation queued → verify estimation stored
4. **WebSocket events:** Start estimation → verify events fire in sequence (job_started → agent_progress × N → all_complete)

#### Test Fixtures

Create JSON fixtures:
- 50 MagicBricks listings (mock HTML response)
- 50 99acres listings (mock JSON response)
- 30 Housing.com listings (mock GraphQL response)
- 20 NoBroker listings (mock API response)
- 10 Govt registry records (mock HTML)

Include edge cases: missing fields, Hindi text in locality names, unusual area units, price in words.

### Section 2: Monitoring

#### Metrics (Prometheus-compatible or structured logs)

```
# Scraping
scraping_duration_seconds{source, city}           # histogram
scraping_listings_count{source, city, status}      # counter
scraping_failures_total{source, error_type}        # counter

# Estimation
estimation_duration_seconds{method}                # histogram
estimation_confidence_score                        # histogram
estimation_requests_total{status}                  # counter

# LLM
llm_call_duration_seconds                          # histogram
llm_call_errors_total{error_type}                  # counter
llm_tokens_used{direction}                         # counter

# System
cache_hit_ratio{cache_type}                        # gauge
active_scraping_jobs                               # gauge
queue_depth{queue_name}                            # gauge
```

#### Alerts

| Condition | Severity | Action |
|-----------|----------|--------|
| Scraping failure rate > 50% for any source in 1hr | Critical | Page on-call |
| LLM call failure rate > 20% in 30min | Warning | Slack notification |
| Avg estimation confidence < 50% in 1hr | Warning | Investigate data quality |
| Scraping job stuck in 'running' > 10min | Warning | Auto-kill and retry |
| DB connection pool exhausted | Critical | Page on-call |
| Queue depth > 1000 for 15min | Warning | Scale workers |

#### Logging

Structured JSON logging for all components:
```json
{
  "timestamp": "ISO",
  "service": "scraper | normalizer | estimator | api",
  "action": "scrape_page | normalize_listing | estimate_price | api_request",
  "duration_ms": 1234,
  "city": "Mumbai",
  "locality": "Andheri",
  "source": "magicbricks",
  "result_count": 25,
  "error": null
}
```

Log levels: DEBUG (individual listing parse), INFO (job lifecycle), WARN (rate limits, partial failures), ERROR (crashes, timeouts)

**Redact PII** (user emails, phone numbers) from all logs.

### Section 3: Production Deployment

#### Environment variables template (`.env.production`)

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/crm?sslmode=require
DATABASE_POOL_SIZE=20
DATABASE_READ_REPLICA_URL=  # optional

# Cache
REDIS_URL=redis://host:6379/0
ESTIMATION_CACHE_TTL_HOURS=6
GEOCODING_CACHE_TTL_DAYS=30

# AI
LLM_API_KEY=sk-...
LLM_MODEL={{LLM_MODEL}}
LLM_TIMEOUT_SECONDS=30

# Geocoding
GOOGLE_MAPS_API_KEY=  # optional, use Nominatim if empty

# Scraping
PROXY_URL=  # optional
SCRAPING_SCHEDULE_CRON=0 2 * * *  # 2 AM IST daily

# Queue
CELERY_BROKER_URL=redis://host:6379/1  # or equivalent for your queue
SCRAPING_WORKERS=3
ESTIMATION_WORKERS=2
NORMALIZATION_WORKERS=1

# Security
API_RATE_LIMIT_USER=50  # per hour
API_RATE_LIMIT_ADMIN=500  # per hour
WEBHOOK_HMAC_SECRET=
CORS_ALLOWED_ORIGINS=https://your-crm.com
```

#### Deployment checklist

- [ ] Run all database migrations
- [ ] Enable PostGIS extension
- [ ] Set up read replica for analytics queries (market trends, bulk comparisons)
- [ ] Deploy queue workers: 3 scraping + 2 estimation + 1 normalization
- [ ] Configure worker health checks and auto-restart
- [ ] Set up dead letter queue (retry 3 times → DLQ)
- [ ] Set up automated database backups
- [ ] Configure CORS for frontend origin
- [ ] Store API keys in secret manager (not .env in production)
- [ ] Run seed data for initial testing
- [ ] Execute first manual scraping run for all target cities
- [ ] Verify WebSocket connectivity from frontend
- [ ] Generate OpenAPI/Swagger spec
- [ ] Write README section for the price intelligence module

#### Security hardening

- Rate limit all public estimation endpoints
- Validate and sanitize all inputs (especially locality names — prevent SQL injection)
- Ensure scraping agents don't leak internal IP addresses
- Add request size limits on estimation API
- HTTPS only in production
- API key rotation policy (90 days)

#### Performance optimization

- Database connection pooling (PgBouncer if PostgreSQL)
- Pre-compute `market_trends` weekly via cron (not on-demand)
- Cache frequently queried locality trends
- Index all foreign keys and filtered columns
- Run `EXPLAIN ANALYZE` on slow queries
- Use database materialized views for dashboard aggregations

---

---

# Quick-Reference Execution Sequence

If you want to speed-run the implementation, give your AI agent these prompts **in order**, one at a time:

```
1. "Read the project config at the top of this file. Confirm you understand
    our tech stack and existing CRM structure."

2. "Execute Phase 1: Create all database migrations and models."

3. "Execute Phase 2: Build the ScraperAgent base class and all 5
    source-specific agents."

4. "Execute Phase 2 continued: Build the ScrapingOrchestrator and
    SchedulingService."

5. "Execute Phase 3: Build the NormalizerService, GeocodingService,
    DeduplicationService, and OutlierDetector."

6. "Execute Phase 4: Build ComparableAnalysisAgent, MarketTrendAgent,
    LLMReasoningAgent, and HybridEstimator. Create the
    /api/v1/estimate-price endpoint."

7. "Execute Phase 5: Add CRM integration — auto-estimation hook,
    bulk estimation, property comparison, lead enrichment,
    dashboard API, webhooks."

8. "Execute Phase 6: Build all frontend components —
    PropertyEstimationCard, EstimationAgentStatus,
    PriceEstimationForm, MarketTrendChart,
    PriceIntelligenceDashboard, PropertyComparisonView."

9. "Execute Phase 7: Write all unit tests, integration tests,
    and test fixtures."

10. "Execute Phase 7 continued: Add monitoring metrics, structured
     logging, alerts. Prepare production deployment config
     and documentation."
```

---

*End of document. Built for production. Adjust the {{VARIABLES}} and ship it.*
