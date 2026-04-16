/**
 * Seed script — Populates the database with sample real estate articles
 * Run: node scripts/seedArticles.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Article = require('../models/Article');

// Helper to generate slug
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

const SAMPLE_ARTICLES = [
    {
        title: '10 Essential Tips for First-Time Home Buyers',
        excerpt: 'Buying your first home can be overwhelming. Learn the essential tips that will help you make an informed decision.',
        content: `Buying your first home is one of the biggest financial decisions you'll make in your lifetime. Here are 10 essential tips to guide you through the process:

1. Get Pre-Approved for a Mortgage
Before house hunting, get pre-approved for a mortgage. This shows sellers you're serious and helps you understand your budget.

2. Save for a Down Payment
Know that down payments typically range from 3-20% of the home price. Save accordingly and explore down payment assistance programs.

3. Improve Your Credit Score
A higher credit score means better loan terms. Aim for a score above 700 if possible.

4. Make a List of Must-Haves
Decide what's important: location, size, amenities, schools. This helps narrow down your search.

5. Get a Home Inspection
Never skip the inspection. It reveals potential issues that could cost you thousands later.

6. Review the Market
Understand current market conditions. Is it a buyer's or seller's market? This affects your negotiating power.

7. Don't Make Large Purchases Before Closing
Lenders can deny your loan if you make major purchases or change jobs unexpectedly.

8. Consider Long-Term Value
Think beyond the current trend. Will this property appreciate over time?

9. Budget for Hidden Costs
Factor in property taxes, insurance, maintenance, and HOA fees.

10. Work with a Good Real Estate Agent
A knowledgeable agent can guide you through the entire process and help negotiate better deals.`,
        category: 'Buying',
        keywords: ['home buying', 'first time buyer', 'mortgage', 'purchase', 'investment'],
        tags: ['buying', 'beginner', 'tips'],
        author: 'Real Estate Team',
        readTime: 8,
        seoTitle: '10 Essential Tips for First-Time Home Buyers | Expert Guide',
        seoDescription: 'New to home buying? Learn 10 essential tips that will help you make a smart investment decision.',
        coverImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=400&fit=crop'
    },
    {
        title: 'Real Estate Investment Strategies for 2025',
        excerpt: 'Discover proven investment strategies that can help you build wealth through real estate in the current market.',
        content: `Real estate remains one of the most reliable ways to build long-term wealth. Here are the top investment strategies for 2025:

RENTAL PROPERTY INVESTMENT
Investing in rental properties provides steady income and long-term appreciation. Key considerations include location analysis, tenant quality, and property management efficiency.

FLIPPING PROPERTIES
Property flipping involves buying undervalued properties, renovating them, and selling for profit. This requires capital, market knowledge, and strong negotiation skills.

REAL ESTATE INVESTMENT TRUSTS (REITs)
REITs allow you to invest in real estate without managing properties directly. They offer liquidity and diversification.

COMMERCIAL PROPERTIES
Commercial real estate can offer higher returns than residential. Consider office spaces, retail stores, or industrial properties.

BUILD-TO-RENT STRATEGY
Purchase land and build new homes for rental purposes. This limits competition and maximizes long-term revenue.

MARKET TIMING
Study economic indicators, interest rates, and local market trends to make informed investment decisions.

RISKS TO CONSIDER
- Market volatility and economic downturns
- Property vacancy and tenant issues
- Unexpected maintenance costs
- Liquidity challenges

SUCCESS FACTORS
- Thorough market research
- Strong financial planning
- Professional property management
- Diversification across properties`,
        category: 'Investment',
        keywords: ['real estate investment', 'strategy', '2025', 'rental', 'wealth building'],
        tags: ['investment', 'strategy', 'wealth'],
        author: 'Investment Expert',
        readTime: 10,
        seoTitle: 'Real Estate Investment Strategies for 2025 | Expert Guide',
        seoDescription: 'Master real estate investment strategies to build wealth in 2025. Learn proven tactics from experts.',
        coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop'
    },
    {
        title: 'The Complete Guide to Home Staging',
        excerpt: 'Learn how to stage your home effectively to attract buyers and increase your selling price.',
        content: `Home staging is the process of preparing your home for sale to make it as appealing as possible to buyers. A well-staged home sells faster and for more money.

WHY STAGING MATTERS
- Buyers make decisions based on first impressions
- Staging highlights your home's best features
- It offsets the "lived-in" appearance
- Staged homes typically sell 8-17% faster

DECLUTTERING AND DEPERSONALIZING
Remove personal photos and excessive decorations. Buyers need to imagine themselves living in the space. Reduce furniture to make rooms appear larger.

FRESH PAINT AND REPAIRS
A fresh coat of neutral paint does wonders. Fix minor repairs, squeaky doors, and loose handles. These small fixes make a big difference.

CURB APPEAL
Your home's exterior is the first thing buyers see. Maintain the lawn, paint the front door, add potted plants, and ensure the entrance is clean and welcoming.

STRATEGIC LIGHTING
Good lighting makes spaces feel warm and inviting. Replace dim bulbs, open curtains, and add table lamps in key areas.

FURNITURE ARRANGEMENT
Arrange furniture to maximize space and create natural flow. Avoid blocking windows or creating cramped areas.

NEUTRAL STYLING
Use neutral colors and minimal personal touches. This allows buyers to visualize their own belongings in the space.

SCENT AND ATMOSPHERE
Fresh flowers, subtle fragrances, or freshly baked cookies can create a positive emotional connection. However, avoid strong or overpowering scents.

COMMON STAGING MISTAKES
- Over-decorating
- Neglecting outdoor spaces
- Outdated fixtures and hardware
- Poor lighting
- Strong cooking smells
- Too many personal touches`,
        category: 'Selling',
        keywords: ['home staging', 'selling', 'house sale', 'preparation', 'tips'],
        tags: ['selling', 'staging', 'preparation'],
        author: 'Staging Professional',
        readTime: 7,
        seoTitle: 'Complete Guide to Home Staging | Sell Your Home Faster',
        seoDescription: 'Master home staging techniques to sell your house faster and for more money. Expert tips inside.',
        coverImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop'
    },
    {
        title: 'Understanding Property Taxes and Assessment',
        excerpt: 'Decode property taxes and understand how property assessments affect your homeownership costs.',
        content: `Property taxes are a significant part of homeownership costs. Understanding how they're calculated and assessed can help you budget better and potentially reduce your tax burden.

WHAT ARE PROPERTY TAXES?
Property taxes are annual taxes imposed by local governments on real estate. They fund schools, infrastructure, emergency services, and other public services.

HOW PROPERTY TAXES ARE CALCULATED
Property taxes = Assessed Value × Tax Rate

The tax rate is determined by your local municipality and can vary significantly by location.

PROPERTY ASSESSMENT
An assessor determines your property's value for tax purposes. Factors considered include:
- Property size and lot size
- Location and neighborhood
- Age and condition
- Recent comparable sales
- Improvements and renovations

ASSESSMENT APPEALS
If you believe your assessment is too high, you can file an appeal. Gather evidence like recent appraisals or comparable property sales.

TAX DEDUCTIONS AND EXEMPTIONS
- Homestead exemptions (varies by state)
- Age exemptions (for seniors)
- Disability exemptions
- Property tax deductions on federal returns

TAX RATES BY REGION
Property tax rates vary dramatically by state and locality. Some areas have lower rates, while others can be significantly higher.

STRATEGIES TO REDUCE PROPERTY TAXES
- File for applicable exemptions
- Appeal assessments if warranted
- Make energy-efficient improvements (some states offer reductions)
- Look for professional advice from tax specialists

IMPACT ON HOME VALUE
High property taxes can impact property values in your area. When house hunting, factor in tax rates as part of your decision.`,
        category: 'Legal',
        keywords: ['property tax', 'assessment', 'homeowner', 'costs', 'deduction'],
        tags: ['taxes', 'legal', 'finance'],
        author: 'Tax Expert',
        readTime: 8,
        seoTitle: 'Property Taxes & Assessment Explained | Complete Guide',
        seoDescription: 'Understand property taxes and assessments. Learn strategies to reduce your tax burden.',
        coverImage: 'https://images.unsplash.com/photo-1510182213441-c382a266b0a3?w=800&h=400&fit=crop'
    },
    {
        title: 'Urban vs. Suburban Living: Which is Right for You?',
        excerpt: 'Compare urban and suburban living to determine which lifestyle best fits your needs and preferences.',
        content: `The choice between urban and suburban living is deeply personal and depends on your lifestyle, budget, and priorities.

URBAN LIVING ADVANTAGES
- Walking distance to amenities
- Better public transportation
- More rental options
- Cultural and entertainment opportunities
- Job opportunities and career growth
- Diverse dining and shopping options

URBAN LIVING DISADVANTAGES
- Higher cost of living
- Smaller living spaces
- Limited parking
- More noise and pollution
- Less green space
- Crowded environments

SUBURBAN LIVING ADVANTAGES
- Larger homes and properties
- Lower cost of living
- Quieter, family-friendly environment
- Strong sense of community
- Better schools (often)
- Safe neighborhoods
- More parking and outdoor space

SUBURBAN LIVING DISADVANTAGES
- Car dependency
- Limited public transportation
- Longer commutes
- Fewer entertainment options
- Less diverse dining and shopping
- Can feel isolating for some

FINANCIAL COMPARISON
Urban properties typically have higher prices but offer better rental returns. Suburban properties are more affordable and attract family renters.

LIFESTYLE FACTORS TO CONSIDER
- Career and job opportunities
- Family situation and school needs
- Social preferences
- Environmental concerns
- Commute tolerance

MAKING THE DECISION
1. List your priorities
2. Calculate total cost of living
3. Visit neighborhoods at different times
4. Talk to residents
5. Consider your 5-year and 10-year plans
6. Evaluate work commute options

The best choice is the one that aligns with your values and lifestyle goals.`,
        category: 'Lifestyle',
        keywords: ['urban living', 'suburban', 'lifestyle', 'choice', 'location'],
        tags: ['lifestyle', 'urban', 'suburban', 'comparison'],
        author: 'Lifestyle Contributor',
        readTime: 9,
        seoTitle: 'Urban vs Suburban Living | Complete Comparison Guide',
        seoDescription: 'Deciding between urban and suburban life? Compare benefits, costs, and lifestyle factors.',
        coverImage: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&h=400&fit=crop'
    },
    {
        title: 'Real Estate Market Trends: Q2 2025 Report',
        excerpt: 'Stay informed with the latest real estate market trends and predictions for Q2 2025.',
        content: `The real estate market continues to evolve in 2025. Here's what we're seeing in Q2 2025:

INTEREST RATE TRENDS
Interest rates remain relatively stable after adjustments in early 2025. Mortgage rates hover around historical averages, making borrowing slightly less expensive than recent years.

MARKET CONDITIONS BY REGION
Northern Markets: Cooling demand in major metros with increased inventory
Southern Markets: Strong growth continues with steady migration patterns
Western Markets: Mixed signals with price stabilization
Midwest Markets: Steady appreciation with lower price volatility

PROPERTY TYPE PERFORMANCE
Single-family homes: Continued strong demand
Condos: Recovering as affordability concerns eased
Commercial: Mixed results with office vacancy challenges
Mixed-use developments: Growing investor interest

PRICE TRENDS
Average home prices show modest growth (2-4% annually in most regions)
Luxury market: Segment seeing premium pricing power
First-time buyer market: More accessible than recent years
Investment properties: Still attractive for cash-flow investors

SELLER VS. BUYER MARKET
Most markets remain balanced or slightly favoring buyers
Inventory levels are healthy in most regions
Days on market are increasing moderately
Negotiations are becoming more balanced

PREDICTIONS FOR H2 2025
- Continued market stabilization
- Potential interest rate fluctuations
- Increased competition in desirable locations
- Growing demand for sustainable properties
- More technological integration in real estate

OPPORTUNITIES FOR INVESTORS
- REITs showing recovery potential
- Rental markets remain strong
- Development opportunities in growing areas
- Tech-enabled property management

KEY TAKEAWAY
2025 presents a balanced market with opportunities for both buyers and sellers. Success requires informed decision-making and market awareness.`,
        category: 'Market Trends',
        keywords: ['market trend', 'Q2 2025', 'forecast', 'prediction', 'real estate market'],
        tags: ['market', 'trends', 'news', '2025'],
        author: 'Market Analyst',
        readTime: 10,
        seoTitle: 'Real Estate Market Trends Q2 2025 | Expert Analysis',
        seoDescription: 'Get the latest real estate market trends for Q2 2025. Expert predictions and analysis.',
        coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop'
    }
];

async function seedArticles() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');

        // Check if articles already exist
        const existing = await Article.countDocuments();
        if (existing > 0) {
            console.log(`Database already has ${existing} articles. Skipping seed.`);
            console.log('To re-seed, run: node scripts/seedArticles.js --force');
            if (!process.argv.includes('--force')) {
                process.exit(0);
            }
            console.log('--force flag detected, clearing and re-seeding...');
            await Article.deleteMany({});
        }

        // Add slugs to articles
        const articlesWithSlugs = SAMPLE_ARTICLES.map(article => ({
            ...article,
            slug: generateSlug(article.title)
        }));

        // Create articles
        const createdArticles = await Article.insertMany(articlesWithSlugs);
        console.log(`✓ Created ${createdArticles.length} articles`);

        // Display summary
        console.log('\n=== ARTICLES SEEDED ===');
        createdArticles.forEach((article, index) => {
            console.log(`${index + 1}. ${article.title} (${article.category})`);
        });

        console.log('\n✓ Article seeding complete!');
        console.log(`Tip: Articles are now accessible at /api/articles`);
        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err.message);
        process.exit(1);
    }
}

seedArticles();
