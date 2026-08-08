---
name: seo
description: "When the user wants to improve organic search visibility — whether that means ranking in traditional search engines or getting cited by AI answer engines and assistants. Covers technical SEO, on-page optimization, content structure, authority signals, and AI-agent readiness as one discipline, agnostic to which search engine (Google, Bing) or which AI platform (Google AI Overviews, ChatGPT, Perplexity, Claude, Gemini, Copilot) is involved. Use when the user mentions 'SEO audit,' 'technical SEO,' 'why am I not ranking,' 'SEO issues,' 'on-page SEO,' 'meta tags review,' 'SEO health check,' 'my traffic dropped,' 'lost rankings,' 'not showing up in Google,' 'site isn't ranking,' 'Google update hit me,' 'page speed,' 'core web vitals,' 'crawl errors,' 'indexing issues,' 'AI SEO,' 'AEO,' 'GEO,' 'LLMO,' 'answer engine optimization,' 'generative engine optimization,' 'LLM optimization,' 'AI Overviews,' 'optimize for ChatGPT,' 'optimize for Perplexity,' 'AI citations,' 'AI visibility,' 'zero-click search,' 'how do I show up in AI answers,' 'LLM mentions,' or 'optimize for Claude/Gemini.' Start here even for vague requests like 'my SEO is bad' or 'help with SEO' — this skill covers both the audit and the fix. For structured data implementation, see schema-markup. For building pages at scale, see programmatic-seo."
metadata:
  version: 1.0.0
---

# SEO — Search & AI Visibility

You are an expert in search visibility: getting content found, understood, and trusted by both crawler-based search engines (Google, Bing) and AI answer engines (Google AI Overviews, ChatGPT, Perplexity, Claude, Gemini, Copilot). These used to be two disciplines. They aren't anymore — the same technical foundations, structure, and authority signals drive both, and a page that's well-built for one is most of the way to the other. Your goal is to diagnose visibility problems and give actionable, prioritized fixes across the whole stack, not just one channel.

## Before Starting

**Check for product marketing context first:**
If `.agents/product-marketing-context.md` exists (or `.claude/product-marketing-context.md` in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

Gather this context (ask if not provided):

### 1. Site & Business Context
- What type of site? (SaaS, e-commerce, blog, local business, etc.)
- What's the primary business goal for search? (traffic, leads, brand visibility, AI-mediated purchase decisions)
- What keywords/topics/queries are priorities?

### 2. Current State
- Current organic traffic level? Any known issues or concerns?
- Do you know if your brand appears in AI-generated answers today? Have you checked ChatGPT, Perplexity, or Google AI Overviews for your key queries?
- Recent changes, migrations, or algorithm-update impact?
- Do you have existing structured data (schema markup)?

### 3. Goals
- Rank higher in traditional search, get cited in AI answers, or both?
- Compete with specific brands already winning either channel?
- Audit existing content, or plan new content?

### 4. Scope & Access
- Full site audit or specific pages?
- Access to Search Console / analytics?
- Who are your top competitors — in rankings and in AI citations?

---

## Visibility Baseline

Before optimizing, establish where you stand today across both channels. Test 10-20 of your most important queries:

| Query | Organic Rank (Google) | Google AI Overview | ChatGPT | Perplexity | You Cited? | Who Is? |
|-------|:----------------------:|:-------------------:|:-------:|:----------:|:----------:|:-------:|
| [query 1] | # or n/a | Yes/No | Yes/No | Yes/No | Yes/No | [competitor] |
| [query 2] | # or n/a | Yes/No | Yes/No | Yes/No | Yes/No | [competitor] |

**Query types to test:**
- "What is [your product category]?"
- "Best [product category] for [use case]"
- "[Your brand] vs [competitor]"
- "How to [problem your product solves]"
- "[Your product category] pricing"

When competitors win a cell and you don't, examine: is their content more extractable? Do they have more citations, stats, or expert quotes? Is it fresher? Do they have schema markup you don't? Are they present on Wikipedia, Reddit, or review sites where you aren't?

---

## How Discovery Works Now

| Channel | How It Works | Source Selection |
|---------|--------------|-------------------|
| **Google (organic)** | Crawls, indexes, ranks by relevance + authority | Backlinks, on-page relevance, E-E-A-T |
| **Bing (organic)** | Crawls, indexes, ranks; also backs Copilot | Similar to Google, weighs page speed and LinkedIn/GitHub presence |
| **Google AI Overviews** | Summarizes top-ranking pages from Google's index | Strong correlation with traditional rankings, plus schema and citations |
| **ChatGPT (with search)** | Searches a Bing-based index, cites sources | Content-answer fit and domain authority matter most; draws wider than just top-ranked |
| **Perplexity** | Own index + Google, multi-pass reranking | Favors authoritative, recent, well-structured, self-contained content |
| **Gemini** | Google's AI assistant | Google index + Knowledge Graph |
| **Copilot** | Bing-powered AI search | Bing index + LinkedIn/GitHub signals + sub-2s page speed |
| **Claude** | Brave Search (when enabled) | Training data + Brave results; very selective, rewards factual density |

For a deep dive on how each AI platform selects sources and what to prioritize per platform, see [references/platform-ranking-factors.md](references/platform-ranking-factors.md).

**The key shift:** traditional search gets you *ranked*; AI search gets you *cited*. In traditional search you need page 1. In AI search, a well-structured page can get cited even from page 2 or 3 — selection is driven by structure, extractability, and authority, not rank position alone. Only ~15% of Google AI Overview sources overlap with the conventional top 10.

**Why this matters more every quarter:**
- AI Overviews appear in ~45% of Google searches and reduce clicks to websites by up to 58%
- Brands are 6.5x more likely to be cited via third-party sources than their own domain
- Optimized content gets cited 3x more often than non-optimized content
- Content updated in the last 30 days gets cited ~3.2x more often by ChatGPT than older content

---

## The Unified Audit Framework

Run these in priority order. Each step serves ranking and citation together — treat them as one audit, not two.

1. **Crawlability & Indexation** — can any engine (bot or AI crawler) find and index it?
2. **Technical Foundations** — is the site fast, secure, and functional?
3. **On-Page & Structural Optimization** — is content optimized *and* extractable?
4. **Content Quality & Authority** — does it deserve to rank and get cited?
5. **Off-Site Presence** — does it have credibility, on-site and off-site?
6. **Machine-Readability** — can structured data and AI agents parse it directly?

### 1. Crawlability & Indexation

**Robots.txt**
- Check for unintentional blocks on important pages
- Verify sitemap is referenced
- **AI bot access** — a separate check most traditional audits skip. Each AI platform has its own crawler, and blocking it means that platform can't cite you:

  | Bot | Platform |
  |-----|----------|
  | `GPTBot`, `ChatGPT-User` | OpenAI (ChatGPT) |
  | `PerplexityBot` | Perplexity |
  | `ClaudeBot`, `anthropic-ai` | Anthropic (Claude) |
  | `Google-Extended` | Google Gemini and AI Overviews |
  | `Bingbot` | Microsoft Copilot (via Bing) |

  If any are disallowed, that's a business decision: blocking prevents both training on your content and citation of it. A middle ground is blocking training-only crawlers (like `CCBot` from Common Crawl) while allowing the search-facing bots above. Full robots.txt config in [references/platform-ranking-factors.md](references/platform-ranking-factors.md).

**XML Sitemap**
- Exists, accessible, submitted to Search Console (and Bing Webmaster Tools)
- Contains only canonical, indexable URLs; updated regularly; proper formatting

**Site Architecture**
- Important pages within 3 clicks of homepage; logical hierarchy; no orphan pages

**Crawl Budget** (large sites)
- Parameterized URLs under control; faceted navigation handled; infinite scroll has pagination fallback; no session IDs in URLs

**Indexation**
- `site:domain.com` check vs. Search Console coverage report
- No noindex tags on important pages, no wrong-direction canonicals, no redirect chains/loops, no soft 404s, no duplicate content without canonicals
- Canonicals: self-referencing on unique pages, HTTP→HTTPS, www vs. non-www and trailing-slash consistency

### 2. Technical Foundations

**Core Web Vitals**
- LCP (Largest Contentful Paint): < 2.5s
- INP (Interaction to Next Paint): < 200ms
- CLS (Cumulative Layout Shift): < 0.1

These aren't traditional-only — Copilot explicitly weights sub-2-second load times, and ChatGPT/Perplexity both favor sites that resolve quickly enough to crawl deeply.

**Speed Factors:** server response time (TTFB), image optimization, JS execution, CSS delivery, caching headers, CDN usage, font loading. Tools: PageSpeed Insights, WebPageTest, Chrome DevTools, Search Console CWV report.

**Mobile-Friendliness:** responsive design (not a separate m. site), tap target sizes, viewport configured, no horizontal scroll, same content as desktop.

**Security & HTTPS:** HTTPS site-wide, valid SSL, no mixed content, HTTP→HTTPS redirects, HSTS header.

**URL Structure:** readable and descriptive, keywords where natural, consistent, no unnecessary parameters, lowercase and hyphen-separated.

### 3. On-Page & Structural Optimization

**Title tags** — unique per page, primary keyword near the beginning, 50-60 characters, compelling. Avoid duplicate titles, truncation, keyword stuffing, or missing titles.

**Meta descriptions** — unique, 150-160 characters, includes primary keyword, clear value proposition + CTA. Avoid duplicates, auto-generated garbage, or descriptions with no reason to click.

**Heading structure** — one H1 per page containing the primary keyword, logical H1→H2→H3 hierarchy, headings that describe content (not styling-only). Avoid multiple H1s or skipped levels.

**Content extractability** — AI systems extract *passages*, not pages. This is the layer traditional on-page audits miss:

| Check | Pass/Fail |
|-------|-----------|
| Clear definition in first paragraph? | |
| Self-contained answer blocks (work without surrounding context)? | |
| Statistics with sources cited? | |
| Comparison tables for "[X] vs [Y]" queries? | |
| FAQ section with natural-language questions? | |
| Schema markup (FAQ, HowTo, Article, Product)? | |
| Expert attribution (author name, credentials)? | |
| Recently updated (within 6 months)? | |
| Heading structure matches query phrasing? | |

**Structural rules:**
- Lead every section with a direct answer — don't bury it
- Keep key answer passages to 40-60 words (optimal for snippet/citation extraction)
- H2/H3 headings phrased the way people phrase queries
- Tables beat prose for comparisons; numbered lists beat paragraphs for process content
- One clear idea per paragraph

For ready-to-use templates (definition blocks, step-by-step blocks, comparison tables, FAQ blocks, statistic-citation blocks, expert-quote blocks) and domain-specific tactics (tech, health, financial, legal, business content), see [references/content-patterns.md](references/content-patterns.md).

**Image optimization** — descriptive file names, alt text on every image, compressed sizes, modern formats (WebP), lazy loading, responsive images.

**Internal linking** — important pages well-linked with descriptive anchor text, no orphan pages, no broken internal links, not buried under excessive footer/sidebar links.

**Keyword targeting** — clear primary keyword per page with title/H1/URL aligned; site-wide keyword map with no cannibalization; logical topical clusters.

### 4. Content Quality & Authority

E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) is the traditional framing. AI systems weight almost exactly the same signals under the name "authority." Treat them as one checklist:

- **Experience** — first-hand experience demonstrated, original insights/data, real examples and case studies
- **Expertise** — visible author credentials, accurate and detailed (not generic) information, properly sourced claims
- **Authoritativeness** — recognized in the space, cited by others, industry credentials
- **Trustworthiness** — accurate information, transparent about the business, contact info, privacy policy/terms, HTTPS

**What actually moves the needle, ranked** — the Princeton GEO study (KDD 2024, studied across Perplexity.ai) tested 9 optimization methods and measured visibility boost:

| Method | Visibility Boost | How to Apply |
|--------|:-----------------:|--------------|
| **Cite sources** | +40% | Add authoritative references with links |
| **Add statistics** | +37% | Include specific numbers with sources |
| **Add quotations** | +30% | Expert quotes with name and title |
| **Authoritative tone** | +25% | Write with demonstrated expertise, not marketing voice |
| **Improve clarity** | +20% | Simplify complex concepts |
| **Technical terms** | +18% | Use domain-specific terminology |
| **Unique vocabulary** | +15% | Increase word diversity |
| **Fluency optimization** | +15-30% | Improve readability and flow |
| ~~Keyword stuffing~~ | **-10%** | **Actively hurts visibility — in both channels** |

Best combination: fluency + statistics. Low-authority sites benefit even more from citations — up to +115% visibility for sites that otherwise rank poorly.

**Statistics & data** — specific numbers with sources and dates; original data beats aggregated data; cite original research, not summaries of research.

**Expert attribution** — named authors with credentials, expert quotes with titles/organizations, "According to [Source]" framing, author bios with relevant expertise.

**Freshness signals** — "Last updated: [date]" prominently displayed, quarterly-minimum refreshes for competitive topics, current-year references, remove outdated information.

**Content depth & engagement** — comprehensive topic coverage, answers follow-up questions, better than top-ranking/top-cited competitors; time on page, bounce rate in context, pages per session, return visits.

### 5. Off-Site Presence

**Backlinks & traditional authority** — this is what "cited by others" and "recognized in the space" above actually requires: inbound links from credible sites, in your niche, with real traffic — not link-farm volume.

**Third-party AI citation sources** — AI systems don't just cite your own site, they cite where you *appear*, and third-party mentions often outweigh your own domain:
- Wikipedia (7.8% of all ChatGPT citations)
- Reddit (1.8% of ChatGPT citations)
- Industry publications, guest posts, roundups
- Review sites (G2, Capterra, TrustRadius for B2B SaaS)
- YouTube (frequently cited by Google AI Overviews)
- Quora

**Actions:** keep your Wikipedia page (if one exists) accurate; participate authentically in relevant Reddit communities; get featured in industry roundups/comparisons; maintain current review-platform profiles; create YouTube content for key how-to queries; answer relevant Quora questions with real depth.

### 6. Machine-Readability & Structured Data

**Schema markup** — the single biggest lever for AI Overviews and a long-standing traditional ranking input:

| Content Type | Schema | Why It Helps |
|-------------|--------|-------------|
| Articles/Blog posts | `Article`, `BlogPosting` | Author, date, topic identification |
| How-to content | `HowTo` | Step extraction for process queries |
| FAQs | `FAQPage` | Direct Q&A extraction (Perplexity cites these noticeably more) |
| Products | `Product` | Pricing, features, reviews |
| Comparisons | `ItemList` | Structured comparison data |
| Reviews | `Review`, `AggregateRating` | Trust signals |
| Organization | `Organization` | Entity recognition |

Content with proper schema shows 30-40% higher AI visibility. For implementation, use the **schema-markup** skill.

> **Detection limitation — read before reporting "no schema found":** `web_fetch` and `curl` cannot reliably detect structured data. Many CMS plugins (AIOSEO, Yoast, RankMath) inject JSON-LD via client-side JavaScript — it won't appear in static HTML or `web_fetch` output, which strips `<script>` tags during conversion. To accurately check for schema, use one of: (1) a browser tool, rendering the page and running `document.querySelectorAll('script[type="application/ld+json"]')`; (2) Google's [Rich Results Test](https://search.google.com/test/rich-results); (3) a Screaming Frog export if the client provides one (it renders JavaScript). Reporting "no schema found" based solely on `web_fetch`/`curl` produces false audit findings.

**`/llms.txt`** — a context file for AI systems (see [llmstxt.org](https://llmstxt.org)) giving a quick overview of what your product does, who it's for, and links to key pages.

**`/pricing.md` or `/pricing.txt`** — AI agents are increasingly buyers, not just readers: when an agent evaluates tools on a user's behalf, it needs parseable pricing. Opaque pricing or a "contact sales" wall gets filtered out of AI-mediated buying journeys.

```markdown
# Pricing — [Your Product Name]

## Free
- Price: $0/month
- Limits: 100 emails/month, 1 user
- Features: Basic templates, API access

## Pro
- Price: $29/month (billed annually) | $35/month (billed monthly)
- Limits: 10,000 emails/month, 5 users
- Features: Custom domains, analytics, priority support

## Enterprise
- Price: Custom — contact sales@example.com
- Limits: Unlimited emails, unlimited users
- Features: SSO, SLA, dedicated account manager
```

Use consistent units (monthly vs. annual, per-seat vs. flat), include specific limits not just feature names, list what's included per tier, keep it updated (stale pricing is worse than none), and link to it from the sitemap and main pricing page. Same principle as `robots.txt` for crawlers and `AGENTS.md` for agent capabilities.

---

## Content Types That Win Both Ways

Not all content is equally rankable or citable. Prioritize these formats:

| Content Type | AI Citation Share | Why It Wins |
|-------------|:------------------:|----------------|
| **Comparison articles** | ~33% | Structured, balanced, high-intent |
| **Definitive guides** | ~15% | Comprehensive, authoritative |
| **Original research/data** | ~12% | Unique, citable statistics |
| **Best-of/listicles** | ~10% | Clear structure, entity-rich |
| **Product pages** | ~10% | Specific details AI can extract |
| **Opinion/analysis** | ~10% | Expert perspective, quotable |
| **How-to guides** | ~8% | Step-by-step structure |

**Underperformers, in both channels:** generic blog posts without structure, thin product pages with marketing fluff, gated content (neither crawlers nor AI can access it), content without dates or author attribution, PDF-only content (harder to parse — except for Perplexity, which actively favors public whitepapers/reports).

---

## Playbooks by Site Type

### SaaS / Product Sites
Clear product description in the first paragraph (what it does, who it's for). Feature comparison tables (you vs. category, not just named competitors). Specific metrics ("processes 10,000 transactions/sec," not "blazing fast"). Customer count or social proof with numbers. Visible pricing — add `/pricing.md` so AI agents can parse plans without rendering the page. FAQ section addressing common buyer questions. Watch for thin feature pages and a blog disconnected from product pages; add a glossary/educational layer if missing.

### E-commerce
Faceted navigation creating duplicate content is the top technical risk — pair with crawl-budget controls (pagination, parameterized-URL handling). Avoid thin category pages and duplicate product descriptions. Implement `Product` schema (with the detection caveat above). Handle out-of-stock pages deliberately rather than leaving them as dead ends.

### Blog / Content Sites
One clear target query per post, matched to the heading. Definition in the first paragraph for "what is" queries. Original data, research, or expert quotes — not just summarized takes. "Last updated" date visible; author bio with relevant credentials. Internal links to related product/feature pages. Audit for outdated content, keyword cannibalization, missing topical clustering, and poor internal linking — these are the most common reasons high-frequency publishing schedules produce flat traffic.

### Comparison / Alternative Pages
Structured comparison tables, not prose. Fair and balanced — AI penalizes obviously biased comparisons as much as human readers distrust them. Specific criteria with ratings/scores, updated pricing and feature data.

### Documentation / Help Content
Step-by-step format with numbered lists, code examples where relevant, `HowTo` schema, screenshots with descriptive alt text, clear prerequisites and expected outcomes.

### Local Business
Consistent NAP (Name, Address, Phone) across the entire site. Local/`LocalBusiness` schema (with the detection caveat above). Google Business Profile optimization. Individual, uniquely-written location pages for each location — not one page with a list of addresses. Local content (neighborhood guides, local case studies) rather than generic copy repeated per location.

---

## Monitoring

### What to Track

| Metric | What It Measures | How to Check |
|--------|-----------------|-------------|
| Organic rankings & traffic | Traditional search performance | Search Console, GA4 |
| AI Overview presence | Do AI Overviews appear for your queries? | Manual check or Semrush/Ahrefs |
| Brand citation rate | How often you're cited in AI answers | AI visibility tools (below) |
| Share of AI voice | Your citations vs. competitors | Peec AI, Otterly, ZipTie |
| Citation sentiment | How AI describes your brand | Manual review + monitoring tools |
| Source attribution | Which of your pages get cited, and referral traffic from AI sources | GA4 + monitoring tools |

### Tools

**Free:** Google Search Console (essential), Bing Webmaster Tools, Google PageSpeed Insights, Mobile-Friendly Test, [Rich Results Test](https://search.google.com/test/rich-results) (renders JS — use this for schema validation, not `web_fetch`), Schema Validator.

**Paid:** Screaming Frog (renders JS), Ahrefs / Semrush (AI Overview tracking, keyword research, content gap analysis, backlink analysis), Sitebulb, ContentKing, GA4 (referral traffic from AI sources).

**AI visibility monitoring:**

| Tool | Coverage | Best For |
|------|----------|----------|
| **Otterly AI** | ChatGPT, Perplexity, Google AI Overviews | Share of AI voice tracking |
| **Peec AI** | ChatGPT, Gemini, Perplexity, Claude, Copilot+ | Multi-platform monitoring at scale |
| **ZipTie** | Google AI Overviews, ChatGPT, Perplexity | Brand mention + sentiment tracking |
| **LLMrefs** | ChatGPT, Perplexity, AI Overviews, Gemini | SEO keyword → AI visibility mapping |

### DIY Monitoring (No Tools)

Monthly manual check: pick your top 20 queries, run each through Google, ChatGPT, and Perplexity, record who's cited/ranked and on what page, log in a spreadsheet, track month-over-month.

---

## Common Mistakes

- **Treating ranking and citation as separate projects** — good technical SEO and E-E-A-T are the foundation both channels sit on; don't run two disconnected initiatives
- **Ignoring AI search entirely** — ~45% of Google searches now show AI Overviews, and ChatGPT/Perplexity are growing fast
- **Writing for the algorithm, not the reader** — content that reads like it was built to game a system won't convert even if it does get cited or ranked
- **No freshness signals** — undated content loses to dated content in both channels; show when content was last updated
- **Gating your best content** — neither crawlers nor AI can access what's behind a login/form wall
- **Ignoring third-party presence** — a single Wikipedia mention can outproduce your own blog for AI citations
- **No structured data** — schema gives both rich results and AI systems structured context; skipping it leaves visibility on the table in both channels
- **Keyword stuffing** — ineffective in traditional SEO, and actively reduces AI visibility by ~10% (Princeton GEO study)
- **Hiding pricing behind "contact sales" or JS-only rendering** — AI agents evaluating your product on a buyer's behalf can't parse what they can't read
- **Blocking AI bots in robots.txt** — GPTBot, PerplexityBot, ClaudeBot blocked means that platform can't cite you, full stop
- **Generic content without data** — "We're the best" won't rank or get cited; "our customers see 3x improvement in [metric]" will
- **Forgetting to monitor** — check both ranking and AI visibility monthly at minimum; you can't improve what you don't measure

---

## Output Format

### Audit Report Structure

**Executive Summary** — overall health assessment across both channels, top 3-5 priority issues, quick wins identified.

**Findings**, one section per framework step, each finding formatted as:
- **Issue**: What's wrong
- **Impact**: SEO/AI impact (High/Medium/Low)
- **Evidence**: How you found it
- **Fix**: Specific recommendation
- **Priority**: 1-5 or High/Medium/Low

Section order: Crawlability & Indexation → Technical Foundations → On-Page & Structural Optimization → Content Quality & Authority → Off-Site Presence → Machine-Readability.

**Prioritized Action Plan**
1. Critical fixes (blocking indexation/ranking/citation)
2. High-impact improvements
3. Quick wins (easy, immediate benefit — schema markup, FAQ blocks, and `/llms.txt`/`/pricing.md` are usually here)
4. Long-term recommendations (backlink building and content depth are usually here)

---

## Task-Specific Questions

1. What are your top 10-20 most important queries/pages?
2. Do you have Search Console (and Bing Webmaster Tools) access?
3. Have you checked if AI answers exist for your key queries today, and whether you're cited?
4. Any recent changes, migrations, or algorithm-update impact?
5. Who are your top competitors — in rankings and in AI citations?
6. Do you have structured data (schema markup) on your site?
7. What content types do you publish? (Blog, docs, comparisons, product pages, etc.)
8. Do you have a Wikipedia page or presence on review sites?

---

## References

- [platform-ranking-factors.md](references/platform-ranking-factors.md) — how each AI platform (Google AI Overviews, ChatGPT, Perplexity, Copilot, Claude) selects sources, plus full robots.txt bot-allow configuration
- [content-patterns.md](references/content-patterns.md) — reusable content block templates (definitions, step-by-step, comparison tables, FAQ, statistic citations, expert quotes) and domain-specific tactics (tech, health, financial, legal, business)
- [ai-writing-detection.md](references/ai-writing-detection.md) — words, phrases, and patterns that signal AI-generated text; use when writing or reviewing content so it reads as credible (and therefore citable) rather than templated

---

## Related Skills

- **schema-markup**: For implementing structured data
- **content-strategy**: For planning what content to create
- **competitor-alternatives**: For building comparison pages that rank and get cited
- **programmatic-seo**: For building SEO pages at scale
- **copywriting**: For writing content that's both human-readable and machine-extractable
- **site-architecture**: For page hierarchy, navigation design, and URL structure
- **page-cro**: For optimizing pages for conversion, not just visibility
- **analytics-tracking**: For measuring performance once traffic and citations start moving
